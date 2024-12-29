"use client";
import React, { useMemo, useCallback, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ItemCard, ItemCardInner, ItemContainer } from "@/components";
import { Switch, Card } from "@nextui-org/react";
import { useSessionWithDetails } from "@/store";
import { getMonthValue } from "@/utils";

interface MonthData {
  name: string;
  chiffre_affaire: number;
  sessions: number;
  clients: number;
}

interface ChartConfig {
  id: string;
  dataKey: keyof MonthData;
  name: string;
  color: string;
}

const CHART_CONFIG: ChartConfig[] = [
  {
    id: "1",
    dataKey: "chiffre_affaire",
    name: "Chiffre d'affaires",
    color: "#7c3aed",
  },
  {
    id: "2",
    dataKey: "sessions",
    name: "Nombre de sessions",
    color: "#fb923c",
  },
  {
    id: "3",
    dataKey: "clients",
    name: "Nombre de clients",
    color: "#0ea5e9",
  },
];

// Composant pour le graphique
const Chart = ({ data }: { data: MonthData[] }) => (
  <div className="w-full h-[400px]">
    <ResponsiveContainer>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 20,
          left: 20,
          bottom: 10,
        }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "Chiffre d'affaires") {
              return new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(value);
            }
            return value;
          }}
          labelFormatter={(label) => `Période : ${label}`}
        />
        {CHART_CONFIG.map(({ id, dataKey, name, color }) => (
          <Area
            key={id}
            type="monotone"
            dataKey={dataKey}
            name={name}
            stackId={id}
            stroke={color}
            fill={color}
          />
        ))}
        <Legend />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Composant pour le calcul des données
const ChartWithData = () => {
  const { SessionWithDetails } = useSessionWithDetails();
  const [showForecast, setShowForecast] = useState(false);

  const calculateSessionMetrics = useCallback(
    (
      customerSessions: (typeof SessionWithDetails)[number]["customerSessions"]
    ) => {
      return customerSessions.reduce(
        (acc, customerSession) => {
          if (customerSession.status !== "Canceled") {
            return {
              revenue: acc.revenue + customerSession.price_total,
              clients: acc.clients + customerSession.people_list.length,
            };
          }
          return acc;
        },
        { revenue: 0, clients: 0 }
      );
    },
    []
  );

  const chartData = useMemo(() => {
    try {
      const monthlyData: { [key: string]: MonthData } = {};
      const currentDate = new Date();
      const startMonth = showForecast ? currentDate.getMonth() : 0;
      const startYear = currentDate.getFullYear();

      // Initialiser les 12 mois
      for (let i = 0; i < 12; i++) {
        const date = new Date(startYear, startMonth + i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

        monthlyData[monthKey] = {
          name: `${getMonthValue(date.getMonth())} ${date.getFullYear()}`,
          chiffre_affaire: 0,
          sessions: 0,
          clients: 0,
        };
      }

      // Filtrer et calculer les données
      SessionWithDetails.filter((session) => {
        const sessionDate = new Date(session.date);
        const sessionKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;
        return (
          session.status !== "Archived" && monthlyData[sessionKey] !== undefined
        );
      }).forEach((session) => {
        const sessionDate = new Date(session.date);
        const monthKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;

        if (monthlyData[monthKey]) {
          const { revenue, clients } = calculateSessionMetrics(
            session.customerSessions
          );
          monthlyData[monthKey].chiffre_affaire += revenue;
          monthlyData[monthKey].sessions += 1;
          monthlyData[monthKey].clients += clients;
        }
      });

      return Object.values(monthlyData);
    } catch (error) {
      console.error("Erreur lors du calcul des données:", error);
      return [];
    }
  }, [SessionWithDetails, calculateSessionMetrics, showForecast]);

  // Calcul des totaux pour l'affichage des KPIs
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, month) => ({
        chiffre_affaire: acc.chiffre_affaire + month.chiffre_affaire,
        sessions: acc.sessions + month.sessions,
        clients: acc.clients + month.clients,
      }),
      { chiffre_affaire: 0, sessions: 0, clients: 0 }
    );
  }, [chartData]);

  return (
    <ItemContainer
      title={`${showForecast ? "Prévisionnelles" : "Réalisées"} de l'année`}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row items-center justify-between">
          <div className="flex gap-4">
            {Object.entries(totals).map(([key, value]) => (
              <ItemCardInner key={key} className="p-3">
                <p className="text-sm text-gray-200">
                  {CHART_CONFIG.find((config) => config.dataKey === key)?.name}
                </p>
                <p className="text-lg font-semibold">
                  {key === "chiffre_affaire"
                    ? new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(value)
                    : value}
                </p>
              </ItemCardInner>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-200">
              {showForecast ? "Prévisionnel" : "Réalisé"}
            </span>
            <Switch
              defaultSelected={showForecast}
              size="md"
              color="primary"
              onValueChange={setShowForecast}
              aria-label="Toggle forecast view"
            >
              {showForecast ? "À partir de ce mois" : "Année complète"}
            </Switch>
          </div>
        </div>

        <Chart data={chartData} />
      </div>
    </ItemContainer>
  );
};

// Composant principal
const YearlyStats = () => {
  return <ChartWithData />;
};

export { YearlyStats };

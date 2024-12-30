"use client";
/* libs*/
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
/* components */
import { ItemCardInner, ItemContainer } from "@/components";
import { Switch } from "@nextui-org/react";
/* store */
import { useSessionWithDetails } from "@/store";
/* utils & types */
import { formatDateToLocaleDateString } from "@/utils";
import { ISessionsWithDetails } from "@/types";

interface DayData {
  name: string;
  date: string;
  chiffre_affaire: number;
  sessions: number;
  clients: number;
}

interface ChartConfig {
  id: string;
  dataKey: keyof Omit<DayData, "name" | "date">;
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
const Chart = ({ data }: { data: DayData[] }) => (
  <div className="w-full h-[400px]">
    <ResponsiveContainer className="w-full h-full min-h-[300px] md:min-h-[400px]">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
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
          labelFormatter={(_, payload) => {
            if (payload && payload[0]) {
              const data = payload[0].payload as DayData;
              return `Date : ${formatDateToLocaleDateString(data.date)}`;
            }
            return "";
          }}
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
      const dailyData: { [key: string]: DayData } = {};
      const currentDate = new Date();
      const startDate = showForecast
        ? currentDate
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Initialiser les 31 jours
      for (let i = 0; i < 31; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = date.toISOString().split("T")[0];

        dailyData[dateKey] = {
          name: date.getDate().toString(),
          date: dateKey,
          chiffre_affaire: 0,
          sessions: 0,
          clients: 0,
        };
      }

      // Filtrer et calculer les données
      SessionWithDetails.filter((session) => {
        const sessionDate = new Date(session.date);
        const sessionKey = sessionDate.toISOString().split("T")[0];
        return (
          session.status !== "Archived" && dailyData[sessionKey] !== undefined
        );
      }).forEach((session) => {
        const sessionDate = new Date(session.date);
        const dateKey = sessionDate.toISOString().split("T")[0];

        if (dailyData[dateKey]) {
          const { revenue, clients } = calculateSessionMetrics(
            session.customerSessions
          );
          dailyData[dateKey].chiffre_affaire += revenue;
          dailyData[dateKey].sessions += 1;
          dailyData[dateKey].clients += clients;
        }
      });

      return Object.values(dailyData);
    } catch (error) {
      console.error("Erreur lors du calcul des données:", error);
      return [];
    }
  }, [SessionWithDetails, calculateSessionMetrics, showForecast]);

  // Calcul des totaux pour l'affichage des KPIs
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, day) => ({
        chiffre_affaire: acc.chiffre_affaire + day.chiffre_affaire,
        sessions: acc.sessions + day.sessions,
        clients: acc.clients + day.clients,
      }),
      { chiffre_affaire: 0, sessions: 0, clients: 0 }
    );
  }, [chartData]);

  return (
    <ItemContainer
      title={` ${
        showForecast ? "Prévisionnelles d'un mois" : "Réalisées du mois"
      }`}
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
              {showForecast ? "31 prochains jours" : "Mois en cours"}
            </span>
            <Switch
              defaultSelected={showForecast}
              size="md"
              color="primary"
              onValueChange={setShowForecast}
              aria-label="Toggle forecast view"
            >
              {showForecast ? "À partir d'aujourd'hui" : "Mois en cours"}
            </Switch>
          </div>
        </div>

        <Chart data={chartData} />
      </div>
    </ItemContainer>
  );
};

// Composant principal
const MonthlyStats = () => {
  return <ChartWithData />;
};

export { MonthlyStats };

"use client";
/* libs */
import React, { useState, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
/* components */
import { ItemContainer } from "@/components";
/* store */
import { useSessionWithDetails } from "@/store";

// Constantes
const BASE_COLOR = "#4f46e5";
const LIGHTEN_STEP = 10;

interface ActivityData {
  name: string;
  value: number;
  color: string;
  revenue: number; // Ajout du chiffre d'affaires
}

// Fonction pour éclaircir une couleur hex d'un certain pourcentage
const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

// Fonction pour générer les couleurs
const generateColors = (baseColor: string, count: number): string[] => {
  return Array.from({ length: count }, (_, index) =>
    lightenColor(baseColor, index * LIGHTEN_STEP)
  );
};

// Rendu du secteur actif avec plus d'informations
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#fff">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff">
        {`${value} sessions (${(percent * 100).toFixed(1)}%)`}
      </text>
      <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill="#fff">
        {new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(payload.revenue)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const FavorisActivities = () => {
  const { SessionWithDetails } = useSessionWithDetails();
  const [activeIndex, setActiveIndex] = useState(0);

  // Calcul des données pour le graphique
  const data = useMemo(() => {
    const activityStats: {
      [key: string]: { sessions: number; revenue: number };
    } = {};

    // Compter le nombre de sessions et le revenu par activité
    SessionWithDetails.forEach((session) => {
      if (session.status !== "Archived") {
        const activityName = session.activity.name;
        if (!activityStats[activityName]) {
          activityStats[activityName] = { sessions: 0, revenue: 0 };
        }
        activityStats[activityName].sessions += 1;

        // Calculer le revenu total pour cette session
        const sessionRevenue = session.customerSessions.reduce(
          (acc, customer) =>
            customer.status !== "Canceled" ? acc + customer.price_total : acc,
          0
        );
        activityStats[activityName].revenue += sessionRevenue;
      }
    });

    // Convertir en tableau et trier par nombre de sessions
    const sortedData = Object.entries(activityStats)
      .map(([name, stats]) => ({
        name,
        value: stats.sessions,
        revenue: stats.revenue,
        color: "",
      }))
      .sort((a, b) => b.value - a.value);

    // Générer les couleurs pour toutes les activités
    const colors = generateColors(BASE_COLOR, sortedData.length);

    // Assigner les couleurs aux données
    return sortedData.map((item, index) => ({
      ...item,
      color: colors[index],
    }));
  }, [SessionWithDetails]);

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  // Calcul du total des sessions et du revenu
  const totals = data.reduce(
    (acc, item) => ({
      sessions: acc.sessions + item.value,
      revenue: acc.revenue + item.revenue,
    }),
    { sessions: 0, revenue: 0 }
  );

  return (
    <ItemContainer title="Activités les plus populaires">
      <div className="w-full min-h-[330px]  h-fit max-h-[600px] relative flex flex-col justify-center items-center">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={105}
              outerRadius={125}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Légende en bas */}
        <div className=" flex flex-wrap justify-center gap-4 p-4">
          {data.map((entry, index) => (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-200">
                {entry.name} (
                {Math.round((entry.value / totals.sessions) * 100)}%) -{" "}
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(entry.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ItemContainer>
  );
};

export { FavorisActivities };

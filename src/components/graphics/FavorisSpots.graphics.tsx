"use client";
/* libs */
import React, { useState, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
/* components */
import { ItemContainer } from "@/components";
/* store */
import { useSessionWithDetails } from "@/store";

// Constantes
const BASE_COLOR = "#ea580c";
const LIGHTEN_STEP = 10; // pourcentage d'éclaircissement par spot

interface SpotData {
  name: string;
  value: number;
  color: string;
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

// Rendu du secteur actif
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
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#fff">
        {`${value} sessions (${(percent * 100).toFixed(1)}%)`}
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

const FavorisSpots = () => {
  const { SessionWithDetails } = useSessionWithDetails();
  const [activeIndex, setActiveIndex] = useState(0);

  // Calcul des données pour le graphique
  const data = useMemo(() => {
    const spotCounts: { [key: string]: number } = {};

    // Compter le nombre de sessions par spot
    SessionWithDetails.forEach((session) => {
      if (session.status !== "Archived") {
        const spotName = session.spot.name;
        spotCounts[spotName] = (spotCounts[spotName] || 0) + 1;
      }
    });

    // Convertir en tableau et trier par nombre de sessions
    const sortedData = Object.entries(spotCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: "", // La couleur sera définie après
      }))
      .sort((a, b) => b.value - a.value);

    // Générer les couleurs pour tous les spots
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

  // Calcul du total des sessions
  const totalSessions = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ItemContainer title="Lieux les plus fréquentés">
      <div className="w-full min-h-[330px] h-fit max-h-[600px] relative flex flex-col  items-center">
        <ResponsiveContainer className="w-full h-full " minHeight={300}>
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
                {entry.name} ({Math.round((entry.value / totalSessions) * 100)}
                %)
              </span>
            </div>
          ))}
        </div>
      </div>
    </ItemContainer>
  );
};

export { FavorisSpots };

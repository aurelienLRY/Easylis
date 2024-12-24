"use client";
import { Spin } from "antd";

interface LoadingSpinnerProps {
  text?: string;
}

/**
 * Composant de chargement réutilisable
 * @param {LoadingSpinnerProps} props - Les propriétés du composant
 * @returns {JSX.Element} Composant de chargement
 */
export const LoadingSpinner = ({
  text = "Chargement...",
}: LoadingSpinnerProps) => {
  return (
    <div className="flex gap-4 flex-col items-center justify-center h-full w-full">
      <Spin size="large" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

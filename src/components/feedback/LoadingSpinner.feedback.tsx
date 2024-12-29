"use client";
import { Spin } from "antd";
import { cn } from "@/utils";
interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

/**
 * Composant de chargement réutilisable
 * @param {LoadingSpinnerProps} props - Les propriétés du composant
 * @returns {JSX.Element} Composant de chargement
 */
export const LoadingSpinner = ({
  text = "Chargement...",
  className,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        "flex gap-4 flex-col items-center justify-center h-full w-full",
        className
      )}
    >
      <Spin size="large" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

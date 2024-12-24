import React from "react";
import { toast } from "sonner";
import { ICallback } from "@/types";

/**
 * ToasterAction component
 * @param {ICallback} result - The result of the action
 * @param {string} defaultMessage - The default message to display if the result is successful
 * @returns {JSX.Element} - The ToasterAction component
 */
export function ToasterAction({
  result,
  defaultMessage,
}: {
  result: ICallback;
  defaultMessage: string;
}) {
  if (result.success) {
    toast.success(
      (result.feedback &&
        result.feedback.map((feedback: string) => (
          <p key={feedback}>{feedback}</p>
        ))) ||
        defaultMessage
    );
  } else {
    toast.error(
      <div className="w-full">
        <p className="text-center font-semibold text-lg">Erreur</p>
        <ul className="p-3">
          {result.feedback &&
            result.feedback.map((error: string, index: number) => (
              <li key={index} className="list-disc list-inside">
                {error}
              </li>
            ))}
        </ul>
        {result.error && (
          <p className="text-center font-semibold text-lg">{result.error}</p>
        )}
      </div>
    );
  }
}

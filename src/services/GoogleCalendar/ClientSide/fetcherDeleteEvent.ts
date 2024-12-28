"use client";
import { ICallback } from "@/types";
import { ToasterAction } from "@/components";

export const fetcherDeleteEvent = async (
  refreshToken: string,
  sessionId: string
): Promise<ICallback> => {
  let result;
  try {
    const rep = await fetch("/api/services/google/events", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken, sessionId }),
    });
    result = await rep.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || "Impossible de supprimer l'événement",
      feedback: null,
    };
  } finally {
    ToasterAction({ result, defaultMessage: "Événement supprimé avec succès" });
  }
};

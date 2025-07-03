"use client";
import { ICallback } from "@/types";

interface IEventExistsResponse {
  existsInDB: boolean;
  existsInGoogle: boolean;
  eventId?: string;
}

/**
 * Vérifie si un événement existe en base de données et sur Google Calendar
 * @param sessionId - L'ID de la session à vérifier
 * @param refreshToken - Le token de rafraîchissement pour Google Calendar
 * @returns Un objet ICallback avec les informations d'existence de l'événement
 */
export const fetcherCheckEventExists = async (
  sessionId: string,
  refreshToken?: string
): Promise<ICallback & { data: IEventExistsResponse }> => {
  try {
    const response = await fetch("/api/services/google/events/check-exists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        refreshToken,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      data: {
        existsInDB: false,
        existsInGoogle: false,
      },
      error: error.message || "Erreur lors de la vérification de l'événement",
      feedback: null,
    };
  }
}; 
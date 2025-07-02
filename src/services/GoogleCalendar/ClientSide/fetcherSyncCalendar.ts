"use client";
import { ICallback , IUser, ICredentials } from "@/types";



export const fetcherSyncCalendar = async (): Promise<ICallback> => {
  try {
    const response = await fetch("/api/services/google/sync-calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la synchronisation du calendrier:", error);
    return {
      success: false,
      error: "Erreur lors de la synchronisation du calendrier",
      feedback: ["Erreur de connexion"],
      data: null,
    };
  }
};
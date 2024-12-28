"use client";
import { ICalendarEvent, ICallback } from "@/types";
import { ToasterAction } from "@/components";

export const fetcherUpdateEvent = async (
  refreshToken: string,
  event: ICalendarEvent,
  sessionId: string
): Promise<ICallback> => {
  let result;
  try {
    const rep = await fetch("/api/services/google/events", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
        event: event,
        sessionId: sessionId,
      }),
    });
    result = await rep.json();
    return {
      success: true,
      data: null,
      error: null,
      feedback: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error as string,
      feedback: null,
    };
  } finally {
    ToasterAction({
      result,
      defaultMessage: "Événement mis à jour sur votre calendrier avec succès",
    });
  }
};

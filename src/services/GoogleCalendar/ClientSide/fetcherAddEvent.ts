"use client";
import { ICalendarEvent, ICallback } from "@/types";
import { ToasterAction } from "@/components";
export const fetcherAddEvent = async (
  refreshToken: string,
  event: ICalendarEvent,
  sessionId: string
): Promise<ICallback> => {
  let result;
  try {
    const rep = await fetch("/api/services/google/events", {
      method: "POST",
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
  } catch (error: any) {
    return { success: false, data: null, error: error.message, feedback: null };
  } finally {
    ToasterAction({
      result,
      defaultMessage: "Événement ajouté à votre calendrier",
    });
  }
};

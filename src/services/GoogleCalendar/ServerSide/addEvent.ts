import { ICalendarEvent } from "@/types";
import { google } from "googleapis";
import { refreshAccessToken } from "@/services/GoogleCalendar/ServerSide";

/**
 * Add an event to Google Calendar
 * @param refreshToken - The refresh token
 * @param event - The event
 * @returns The response from Google Calendar
 */
export const addEvent = async (refreshToken: string, event: ICalendarEvent) => {
  const oauth2Client = await refreshAccessToken(refreshToken);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });
  return response;
};

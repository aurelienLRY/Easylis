import { google } from "googleapis";
import { refreshAccessToken } from "@/services/GoogleCalendar/ServerSide";

/**
 * Delete an event from the Google Calendar
 * @param refreshToken - The refresh token of the user
 * @param eventId - The ID of the event to delete
 * @returns The response from the Google Calendar API
 */
export const deleteEvent = async (refreshToken: string, eventId: string) => {
  const oauth2Client = await refreshAccessToken(refreshToken);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const response = await calendar.events.delete({
    calendarId: "primary",
    eventId: eventId,
  });
  return response;
};

import { google } from "googleapis";
import { refreshAccessToken } from "@/services/GoogleCalendar/ServerSide";

export const getEvent = async (token: string) => {
  const oauth2Client = await refreshAccessToken(token);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const response = await calendar.events.list({
    calendarId: "primary",
    singleEvents: true,
    orderBy: "startTime",
  });
  return response;
};

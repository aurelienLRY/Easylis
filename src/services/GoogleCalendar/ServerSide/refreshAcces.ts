import { oauth2Client } from "@/services/GoogleCalendar/ServerSide";

/**
 * Récupération du nouveau token d'accès
 * @param token Refresh token
 * @returns oauth2Client
 */
export const refreshAccessToken = async (token: string) => {
  oauth2Client.setCredentials({ refresh_token: token });
  await oauth2Client.refreshAccessToken();
  return oauth2Client;
};

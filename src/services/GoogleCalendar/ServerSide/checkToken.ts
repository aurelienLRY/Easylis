import { oauth2Client } from "@/services/GoogleCalendar/ServerSide";

/**
 * Vérification si le token est valide
 * @param token
 * @returns
 */
export const checkToken = async (token: string) => {
  const tokenInfo = await oauth2Client.getTokenInfo(token);
  return tokenInfo;
};

import { oauth2Client } from "@/services/GoogleCalendar/ServerSide";

/**
 * Génération de l'URL d'autorisation Google
 * @param origin URL d'origine
 * @returns URL d'autorisation Google
 */
export const GoogleAuthorization = async (origin: string) => {
  // Génération de l'URL d'autorisation Google
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
    ],
    state: origin, // Inclure l'URL d'origine comme état
  });

  return authUrl;
};

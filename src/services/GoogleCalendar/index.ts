"use server";
import { google } from "googleapis";

export const oauth2Client = await new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/services/google/callback` // URL de callback
);

export const GoogleAuthorization = async () => {
  // URL d'autorisation Google
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
    ],
  });

  return authUrl;
};

/**
 * @param token
 * @returns
 */
export const getCalendarEvents = async (token: string) => {
  const blogger = google.blogger({ version: "v3", auth: token });
  const response = await blogger.blogs;
  return response;
};

// function qui vérifie si le token est valide
export const verifyToken = async (token: string) => {
  const response = await oauth2Client.getTokenInfo(token);
  return response;
};

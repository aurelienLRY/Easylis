"use server";
import { NextRequest, NextResponse } from "next/server";
import {
  IUser,
  ICallbackForCredentials,
  ICallbackForUser,
  ICredentials,
  ICallback,
} from "@/types";
import { refreshAccessToken } from "@/services/GoogleCalendar/ServerSide";
import { google } from "googleapis";
import { UPDATE_USER } from "@/libs/ServerAction";
import { createResponse } from "@/utils/ServerSide";
import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
/**
 * Constantes pour les messages d'erreur
 */
const ERROR_MESSAGES = {
  MISSING_REFRESH_TOKEN: "Refresh token manquant",
  REFRESH_FAILED: "Impossible de rafraîchir le token",
  INVALID_GRANT: "Autorisation Google invalide, veuillez vous reconnecter",
} as const;

// faire le type pour le callback
interface TCallback extends ICallback {
  data: {
    credentials: ICredentials | null;
    profile: IUser | null;
  };
}

/**
 * Vérifie la présence du refresh token
 * @param profile - Profil utilisateur
 * @returns {boolean} - True si le refresh token est présent
 */
const hasRefreshToken = (profile: IUser): boolean =>
  Boolean(profile?.tokenRefreshCalendar);

/**
 * Met à jour les tokens de l'utilisateur
 * @param profile - Profil utilisateur actuel
 * @param accessToken - Nouveau token d'accès
 * @param refreshToken - Nouveau refresh token (optionnel)
 */
const updateUserTokens = async (
  profile: IUser,
  accessToken: string | null,
  calendar: boolean = false
): Promise<ICallbackForUser> => {
  const newData = {
    ...profile,
    tokenCalendar: accessToken,
    calendar: calendar,
  };

  const updatedUser = await UPDATE_USER(profile._id as string, newData);

  if (!updatedUser.success) {
    console.error("Erreur lors de la mise à jour du token :", updatedUser);
    console.log(updatedUser);
    throw new Error(ERROR_MESSAGES.REFRESH_FAILED);
  }

  return updatedUser;
};

/**
 * Réinitialise les données Google de l'utilisateur
 */
const resetGoogleData = async (profile: IUser): Promise<ICallbackForUser> => {
  const newData = {
    ...profile,
    tokenCalendar: null,
    calendar: false,
  };
  const x = await UPDATE_USER(profile._id as string, newData as IUser);
  return x;
};

/**
 * Révoque un token Google
 */
const revokeToken = async (token: string) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    await oauth2Client.revokeToken(token);
  } catch (error) {
    console.error("Erreur lors de la révocation du token:", error);
  }
};

/**
 * Route POST pour rafraîchir le token d'accès Google
 * @param req - Requête entrante
 * @returns Réponse avec le nouveau token ou une erreur
 */
export async function POST(req: NextRequest): Promise<NextResponse<TCallback>> {
  try {
    const { profile }: { profile: IUser } = await req.json();

    if (!hasRefreshToken(profile)) {
      return createResponse<TCallback>(
        false,
        {
          credentials: null,
          profile: null,
        },
        null,
        ERROR_MESSAGES.MISSING_REFRESH_TOKEN,
        400
      );
    }

    try {
      const oauth2Client = await refreshAccessToken(
        profile.tokenRefreshCalendar as string
      );
      if (!oauth2Client.credentials.access_token) {
        return createResponse<TCallback>(
          false,
          {
            credentials: null,
            profile: null,
          },
          null,
          ERROR_MESSAGES.REFRESH_FAILED,
          500
        );
      }
      await connectDB();
      await updateUserTokens(
        profile,
        oauth2Client.credentials.access_token,
        true
      );

      return createResponse<TCallback>(
        true,
        {
          credentials: oauth2Client.credentials as ICredentials,
          profile: profile,
        },
        null,
        null,
        200
      );
    } catch (error: any) {
      if (
        error?.response?.status === 400 &&
        error?.message?.includes("invalid_grant")
      ) {
        console.log("Token invalide détecté, révocation des droits...");
        const resetUser = await resetGoogleData(profile);
        try {
          if (profile.tokenCalendar) {
            await revokeToken(profile.tokenCalendar as string);
          }
        } catch (revokeError) {
          console.error("Erreur lors de la révocation:", revokeError);
        }
        return createResponse<TCallback>(
          false,
          {
            credentials: null,
            profile: null,
          },
          null,
          ERROR_MESSAGES.INVALID_GRANT,
          400
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token :", error);
    return createResponse<TCallback>(
      false,
      {
        credentials: null,
        profile: null,
      },
      null,
      ERROR_MESSAGES.REFRESH_FAILED,
      500
    );
  } finally {
    await disconnectDB();
  }
}

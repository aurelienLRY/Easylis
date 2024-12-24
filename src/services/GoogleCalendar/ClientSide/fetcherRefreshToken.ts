"use client";
import { ICallback, IUser, ICredentials } from "@/types";

interface TCallback {
  success: boolean;
  error: string | null;
  feedback: string[] | null;
  data: {
    credentials: ICredentials | null;
    profile: IUser | null;
  };
}
/**
 * Récupère un nouveau token.
 * @param profile - Le profil de l'utilisateur.
 * @returns Un objet ICallback avec le nouveau token.
 */
export const fetcherRefreshToken = async (
  profile: IUser
): Promise<TCallback> => {
  try {
    const fetcherRefreshToken = await fetch(
      "/api/services/google/refresh-token",
      {
        method: "POST",
        body: JSON.stringify({
          profile: profile,
        }),
      }
    );
    const isRefresh = await fetcherRefreshToken.json();
    if (isRefresh.success && isRefresh.data) {
      return {
        success: true,
        error: null,
        feedback: [],
        data: isRefresh.data,
      };
    } else {
      throw new Error("Erreur lors de la récupération du token");
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message as string,
      feedback: null,
      data: {
        credentials: null,
        profile: null,
      },
    };
  }
};

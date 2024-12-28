"use client";
import { ICallback, ICalendarTokenInfo } from "@/types";

/**
 * Vérifie si le token est valide.
 * @param token - Le token à vérifier.
 * @returns Un objet ICallback avec les données de la vérification du token.
 */
export const fetcherCheckToken = async (
  token: string
): Promise<
  ICallback & {
    data: { valid: boolean; tokenInfo: ICalendarTokenInfo | null };
  }
> => {
  try {
    const fetcherCheckToken = await fetch(
      `/api/services/google/check-token?token=${token}`
    );
    return (await fetcherCheckToken.json()) as ICallback & {
      data: { valid: boolean; tokenInfo: ICalendarTokenInfo };
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message as string,
      feedback: null,
      data: { valid: false, tokenInfo: null },
    };
  }
};

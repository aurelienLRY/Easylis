import { NextRequest, NextResponse } from "next/server";
import { checkToken } from "@/services";
import { ICallback } from "@/types";
import { createResponse } from "@/utils/ServerSide";
/**
 * Constantes pour les messages d'erreur et de statut
 */
const MESSAGES = {
  NOT_AUTHENTICATED: "Not authenticated",
  INVALID_TOKEN: "Invalid or expired token",
  CHECK_ERROR: "Error during token check",
} as const;

/**
 * Vérifie la validité d'un token Google
 */
const verifyToken = async (
  token: string
): Promise<{ valid: boolean; tokenInfo?: any }> => {
  const tokenInfo = await checkToken(token);
  const isTokenValid = tokenInfo.expiry_date > Date.now();

  return {
    valid: isTokenValid,
    tokenInfo: isTokenValid ? tokenInfo : undefined,
  };
};

/**
 * Route GET pour vérifier la validité d'un token Google
 * @param req - Requête entrante contenant le token à vérifier
 * @returns Réponse avec le statut de validité du token
 */
export async function GET(req: NextRequest): Promise<NextResponse<ICallback>> {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return createResponse(false, null, null, MESSAGES.NOT_AUTHENTICATED, 400);
    }

    try {
      const { valid, tokenInfo } = await verifyToken(token);
      return createResponse(
        true,
        { valid, ...(valid && { tokenInfo }) },
        null,
        null,
        200
      );
    } catch (error) {
      console.error("Token verification failed:", error);
      return createResponse(
        false,
        { valid: false },
        null,
        MESSAGES.INVALID_TOKEN,
        400
      );
    }
  } catch (error) {
    console.error("Token check API error:", error);
    return createResponse(false, null, null, MESSAGES.CHECK_ERROR, 500);
  }
}

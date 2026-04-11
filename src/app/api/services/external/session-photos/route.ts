import { NextRequest, NextResponse } from "next/server";
import { connectDBOnce, CustomerSession, SessionPhoto } from "@/libs/database";
import { verifyPhotoShareToken } from "@/libs/utils/photoShareToken.utils";

/**
 * API marchand (site externe) : liste des photos d'une session.
 *
 * Sécurité :
 * - `Authorization: Bearer <NEXT_API_OUT_SERVICES>` (middleware global `/api/services/external`)
 * - `sessionId` + `token` (lien email) : signature + expiration + réservation client valide
 *
 * Recommandation : appeler depuis le **serveur** du site marchand (ne pas exposer la clé API au navigateur).
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const token = request.nextUrl.searchParams.get("token");

    if (!sessionId || !token) {
      return NextResponse.json(
        {
          success: false,
          error: "sessionId et token sont requis (query string)",
        },
        { status: 400 }
      );
    }

    const payload = verifyPhotoShareToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Token invalide ou expiré" },
        { status: 403 }
      );
    }

    if (payload.sessionId !== sessionId) {
      return NextResponse.json(
        { success: false, error: "Le token ne correspond pas à cette session" },
        { status: 403 }
      );
    }

    await connectDBOnce();

    const customer = await CustomerSession.findOne({
      _id: payload.customerId,
      sessionId: payload.sessionId,
      status: { $ne: "Canceled" },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable ou annulée" },
        { status: 403 }
      );
    }

    const now = new Date();
    const photos = await SessionPhoto.find({
      sessionId,
      deletedAt: null,
      expiresAt: { $gt: now },
    })
      .sort({ uploadedAt: -1 })
      .lean();

    const data = photos.map((p) => ({
      _id: String(p._id),
      fileUrl: p.fileUrl,
      fileName: p.fileName,
      uploadedAt: p.uploadedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          sessionId,
          count: data.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[external/session-photos] GET:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

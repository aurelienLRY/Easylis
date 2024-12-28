import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/services";
import { authOptions } from "@/app/api/auth/auth";
import { UPDATE_USER, GET_USER_BY_ID } from "@/libs/ServerAction";
import { getServerSession } from "next-auth";
import { disconnectDB } from "@/libs/database/setting.mongoose";
import { IUser } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const origin = req.nextUrl.searchParams.get("state") || "/dashboard"; // Récupérer l'URL d'origine

    const session = await getServerSession(authOptions);
    if (!session || !session.user._id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!code) {
      return NextResponse.json({ error: "Element manquant" }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    } else {
      const user = await GET_USER_BY_ID(session.user._id);
      if (!user.success) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      const newUser = {
        ...user.data,
        tokenCalendar: tokens.access_token,
        ...(tokens.refresh_token && {
          tokenRefreshCalendar: tokens.refresh_token,
        }),
        calendar: true,
      };

      const updateUser = await UPDATE_USER(session.user._id, newUser as IUser);
      if (!updateUser.success) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${origin}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'échange des tokens :", error);
    return NextResponse.json({ error: "Erreur lors de l'autorisation" });
  } finally {
    await disconnectDB();
  }
}

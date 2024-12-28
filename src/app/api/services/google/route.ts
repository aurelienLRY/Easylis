import { NextRequest, NextResponse } from "next/server";
import { GoogleAuthorization } from "@/services";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.searchParams.get("origin") || "/dashboard";
    const authUrl = await GoogleAuthorization(origin);
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error(
      "Erreur lors de la génération de l'URL d'autorisation :",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL d'autorisation" },
      { status: 500 }
    );
  }
}

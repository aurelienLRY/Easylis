import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

export function middleware(request: NextRequest) {
  // Vérifier si la route commence par /api/outServices
  if (request.nextUrl.pathname.startsWith("/api/services/external")) {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    
    // Vérifier si le token est présent
    if (!token) {
      return NextResponse.json(
        { error: "Token d'autorisation requis" },
        { status: 401 }
      );
    }

    // Vérifier si le token correspond à la variable d'environnement
    if (token !== process.env.NEXT_API_OUT_SERVICES) {
      return NextResponse.json(
        { error: "Token d'autorisation invalide" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Mettre à jour la configuration pour inclure les routes API
export const config = {
  matcher: [
    "/dashboard/:path*", // Protéger toutes les pages sous /dashboard
    "/api/services/external/:path*", // Protéger toutes les routes API sous /api/outServices
  ],
};

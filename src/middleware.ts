import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

// Récupération des domaines autorisés depuis les variables d'environnement
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    // Valeurs par défaut si la variable n'est pas définie
    return [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://occitanie-evasion.com',
      'http://occitanie-evasion.com'
    ];
  }
  
  // Séparation par virgule et nettoyage des espaces
  return origins.split(',').map(origin => origin.trim());
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // Gestion CORS pour les routes API externes
  if (request.nextUrl.pathname.startsWith("/api/services/external")) {
    // Gestion des requêtes OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      // Ajout des en-têtes CORS
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
      
      return response;
    }

    // Vérification du token d'authentification
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      const errorResponse = NextResponse.json(
        { error: "Token d'autorisation requis" },
        { status: 401 }
      );
      
      // Ajout des en-têtes CORS même pour les erreurs
      if (origin && allowedOrigins.includes(origin)) {
        errorResponse.headers.set('Access-Control-Allow-Origin', origin);
      }
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return errorResponse;
    }

    if (token !== process.env.NEXT_API_OUT_SERVICES) {
      const errorResponse = NextResponse.json(
        { error: "Token d'autorisation invalide" },
        { status: 401 }
      );
      
      // Ajout des en-têtes CORS même pour les erreurs
      if (origin && allowedOrigins.includes(origin)) {
        errorResponse.headers.set('Access-Control-Allow-Origin', origin);
      }
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return errorResponse;
    }

    // Si tout est OK, on continue et on ajoute les en-têtes CORS
    const response = NextResponse.next();
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
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

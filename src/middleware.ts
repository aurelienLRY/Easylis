import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

// Configuration des domaines autorisés
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    return [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://occitanie-evasion.com',
      'http://occitanie-evasion.com'
    ];
  }
  
  return origins.split(',').map(origin => origin.trim());
};

// Configuration des méthodes autorisées par type de route
const getRouteConfig = (pathname: string) => {
  if (pathname.startsWith("/api/services/external")) {
    return {
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      requiresAuth: true,
      corsEnabled: true
    };
  }
  
  if (pathname.startsWith("/api/public")) {
    return {
      methods: ['GET', 'POST', 'OPTIONS'],
      requiresAuth: false,
      corsEnabled: true
    };
  }
  
  return {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    requiresAuth: false,
    corsEnabled: false
  };
};

// Fonction pour créer une réponse CORS
const createCorsResponse = (origin: string | null, allowedOrigins: string[], status: number = 200) => {
  const response = new NextResponse(null, { status });
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
};

// Fonction pour créer une réponse d'erreur CORS
const createCorsErrorResponse = (origin: string | null, allowedOrigins: string[], error: string, status: number) => {
  const response = NextResponse.json({ error }, { status });
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  const routeConfig = getRouteConfig(request.nextUrl.pathname);
  
  // Gestion des requêtes OPTIONS (preflight) pour toutes les routes CORS
  if (request.method === 'OPTIONS' && routeConfig.corsEnabled) {
    return createCorsResponse(origin, allowedOrigins);
  }
  
  // Gestion des routes API externes
  if (routeConfig.corsEnabled) {
    // Vérification de l'authentification si requise
    if (routeConfig.requiresAuth) {
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");
      
      if (!token) {
        return createCorsErrorResponse(
          origin, 
          allowedOrigins, 
          "Token d'autorisation requis", 
          401
        );
      }
      
      if (token !== process.env.NEXT_API_OUT_SERVICES) {
        return createCorsErrorResponse(
          origin, 
          allowedOrigins, 
          "Token d'autorisation invalide", 
          401
        );
      }
    }
    
    // Si tout est OK, on continue et on ajoute les en-têtes CORS
    const response = NextResponse.next();
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', routeConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  return NextResponse.next();
}

// Configuration des routes à traiter
export const config = {
  matcher: [
    "/dashboard/:path*", // Protéger toutes les pages sous /dashboard
    "/api/services/external/:path*", // Routes API externes (GET, POST, PATCH)
    "/api/public/:path*", // Routes API publiques (GET, POST)
    "/api/:path*", // Toutes les autres routes API
  ],
};
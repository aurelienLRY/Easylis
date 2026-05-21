import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Configuration des domaines autorisés
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    return [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://occitanie-evasion.com",
      "http://occitanie-evasion.com",
    ];
  }

  return origins.split(",").map((origin) => origin.trim());
};

// Configuration des méthodes autorisées par type de route
const getRouteConfig = (pathname: string) => {
  if (pathname.startsWith("/api/services/external")) {
    return {
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      requiresAuth: true,
      corsEnabled: true,
    };
  }

  if (pathname.startsWith("/api/public")) {
    return {
      methods: ["GET", "POST", "OPTIONS"],
      requiresAuth: false,
      corsEnabled: true,
    };
  }

  return {
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    requiresAuth: false,
    corsEnabled: false,
  };
};

// Fonction pour créer une réponse CORS
const createCorsResponse = (
  origin: string | null,
  allowedOrigins: string[],
  status: number = 200
) => {
  const response = new NextResponse(null, { status });

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
};

// Fonction pour créer une réponse d'erreur CORS
const createCorsErrorResponse = (
  origin: string | null,
  allowedOrigins: string[],
  error: string,
  status: number
) => {
  const response = NextResponse.json({ error }, { status });

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
};

function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const routeConfig = getRouteConfig(request.nextUrl.pathname);

  if (request.method === "OPTIONS" && routeConfig.corsEnabled) {
    return createCorsResponse(origin, allowedOrigins);
  }

  if (!routeConfig.corsEnabled) {
    return null;
  }

  if (routeConfig.requiresAuth) {
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

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

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    routeConfig.methods.join(", ")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}

async function requireDashboardAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return null;
  }

  const signInUrl = new URL("/", request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(signInUrl);
}

export async function proxy(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) {
    return corsResponse;
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const authResponse = await requireDashboardAuth(request);
    if (authResponse) {
      return authResponse;
    }
  }

  return NextResponse.next();
}

// Configuration des routes à traiter
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/services/external/:path*",
    "/api/public/:path*",
    "/api/:path*",
  ],
};

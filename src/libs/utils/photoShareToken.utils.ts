import { createHmac, timingSafeEqual } from "crypto";

const getSecret = (): string =>
  process.env.PHOTO_SHARE_LINK_SECRET || process.env.NEXTAUTH_SECRET || "";

const toBase64Url = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const signPayload = (secret: string, payloadBase64: string): string =>
  createHmac("sha256", secret).update(payloadBase64).digest("hex");

/**
 * Token signé envoyé dans le lien email (marchand).
 * Format : `{base64url(payload)}.{hmacSha256}` où payload = { sessionId, customerId, exp }.
 */
export const createPhotoShareToken = (
  sessionId: string,
  customerId: string,
  ttlMs: number = 90 * 24 * 60 * 60 * 1000
): string => {
  const secret = getSecret();
  if (!secret) {
    throw new Error("PHOTO_SHARE_LINK_SECRET ou NEXTAUTH_SECRET requis");
  }
  const payload = JSON.stringify({
    sessionId,
    customerId,
    exp: Date.now() + ttlMs,
  });
  const payloadBase64 = toBase64Url(payload);
  const signature = signPayload(secret, payloadBase64);
  return `${payloadBase64}.${signature}`;
};

export type PhotoShareTokenPayload = {
  sessionId: string;
  customerId: string;
};

/**
 * Vérifie la signature et l'expiration du token.
 * Retourne `null` si invalide.
 */
export const verifyPhotoShareToken = (
  fullToken: string
): PhotoShareTokenPayload | null => {
  const secret = getSecret();
  if (!secret || !fullToken?.trim()) {
    return null;
  }
  const parts = fullToken.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [payloadBase64, signature] = parts;
  const expected = signPayload(secret, payloadBase64);
  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(expBuf, sigBuf)) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const json = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(json) as {
      sessionId?: string;
      customerId?: string;
      exp?: number;
    };
    if (!payload.sessionId || !payload.customerId || typeof payload.exp !== "number") {
      return null;
    }
    if (Date.now() > payload.exp) {
      return null;
    }
    return {
      sessionId: payload.sessionId,
      customerId: payload.customerId,
    };
  } catch {
    return null;
  }
};

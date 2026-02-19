import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.PWA_JWT_SECRET || "visit-members-dev-secret-change-me"
);

export interface TokenPayload {
  memberId: string;
  squareCustomerId: string;
  tier: "classic" | "enthusiast";
  name: string;
  venueId: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract bearer token from Authorization header.
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

import type { UserJWTPayload } from "../user/schema.js";
import { SignJWT, jwtVerify } from "jose";

const secretENV = process.env.JWT_SECRET;
if (!secretENV) {
  throw new Error("JWT_SECRET is not set");
}

const secret = new TextEncoder().encode(secretENV);

export async function signToken(payload: UserJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify<UserJWTPayload>(token, secret, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

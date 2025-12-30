import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verifyToken } from "../lib/jwt.js";
import type { UserJWTPayload } from "../user/schema.js";

export const jwtMiddleware = createMiddleware<{
  Variables: {
    user: UserJWTPayload;
  };
}>(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    throw new HTTPException(401, {
      message: "Authorization header is missing or invalid",
    });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  c.set("user", payload);
  await next();
});

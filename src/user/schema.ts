import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "../db/schema";
import { z } from "zod";
import type { JWTPayload } from "hono/utils/jwt/types";

export const userSchema = createSelectSchema(userTable);

export type User = z.infer<typeof userSchema>;

export const createUserSchema = createInsertSchema(userTable);

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const authUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type AuthUserInput = z.infer<typeof authUserSchema>;

export type UserJWTPayload = JWTPayload & {
	id: number;
}

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authService } from "./service";
import { authUserSchema } from "../user/schema";

export const authRouter = new Hono();

authRouter.post("/signin", zValidator("json", authUserSchema), async (c) => {
  const validatedData = c.req.valid("json");

  const token = await authService.signin(validatedData);

  return c.json({ token });
});

authRouter.post("signup", zValidator("json", authUserSchema), async (c) => {
	const validatedData = c.req.valid("json");

	const token = await authService.signup(validatedData);

	return c.json({ token });
});


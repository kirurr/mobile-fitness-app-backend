import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { authService } from "./service.js";
import { authUserSchema } from "../user/schema.js";

export const authRouter = new Hono();

const authResponseSchema = z.object({
  userId: z.number(),
  token: z.string(),
});

authRouter.post(
  "/signin",
  describeRoute({
    description: "Sign in a user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(authResponseSchema) },
        },
      },
    },
  }),
  validator("json", authUserSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    const validatedData = c.req.valid("json");

    const res = await authService.signin(validatedData);

    return c.json(res);
  },
);

authRouter.post(
  "signup",
  describeRoute({
    description: "Sign up a user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(authResponseSchema) },
        },
      },
    },
  }),
  validator("json", authUserSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    const validatedData = c.req.valid("json");

    const res = await authService.signup(validatedData);

    return c.json(res);
  },
);

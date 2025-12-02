import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { jwtMiddleware } from "../middleware/jwt";
import { userDataService } from "./service";
import { createUserDataSchema, updateUserDataSchema } from "./schema";

export const userDataRouter = new Hono();

// Get user data for the authenticated user
userDataRouter.get("/", jwtMiddleware, async (c) => {
  const userId = c.var.user.id;

  const userData = await userDataService.getByUserId(userId);

  if (!userData) {
    return c.json({ error: "User data not found" }, 400);
  }

  return c.json(userData);
});

// Create user data for the authenticated user
userDataRouter.post(
  "/",
  jwtMiddleware,
  zValidator("json", createUserDataSchema),
  async (c) => {
    const validatedData = c.req.valid("json");
    const userId = c.var.user.id;

    // Override userId to ensure user can only create data for themselves
    const userDataToCreate = { ...validatedData, userId };

    try {
      const createdUserData = await userDataService.create(userDataToCreate);
      return c.json(createdUserData, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "An unknown error occurred" }, 500);
    }
  },
);

// Update user data for the authenticated user
userDataRouter.put(
  "/",
  jwtMiddleware,
  zValidator("json", updateUserDataSchema),
  async (c) => {
    const validatedData = c.req.valid("json");
    const userId = c.var.user.id;

    const updatedUserData = await userDataService.update(userId, validatedData);

    if (!updatedUserData) {
      return c.json({ error: "User data not found" }, 404);
    }

    return c.json(updatedUserData);
  },
);

// Delete user data for the authenticated user
userDataRouter.delete("/", jwtMiddleware, async (c) => {
  const userId = c.var.user.id;

  const deleted = await userDataService.delete(userId);

  if (!deleted) {
    return c.json({ error: "User data not found" }, 404);
  }

  return c.json({ message: "User data deleted successfully" });
});


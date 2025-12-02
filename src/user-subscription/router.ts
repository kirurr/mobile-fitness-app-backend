import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { jwtMiddleware } from "../middleware/jwt";
import { userSubscriptionService } from "./service";
import {
  createUserSubscriptionSchema,
  updateUserSubscriptionSchema,
} from "./schema";

export const userSubscriptionRouter = new Hono();

// Get user subscriptions for the authenticated user
userSubscriptionRouter.get("/", jwtMiddleware, async (c) => {
  const userId = c.var.user.id;

  const userSubscriptions = await userSubscriptionService.getByUserId(userId);

  return c.json(userSubscriptions);
});

// Get user subscription by ID (only if it belongs to the authenticated user)
userSubscriptionRouter.get("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const userId = c.var.user.id;

  const userSubscription = await userSubscriptionService.getById(id);

  if (!userSubscription || userSubscription.userId !== userId) {
    return c.json({ error: "User subscription not found" }, 404);
  }

  return c.json(userSubscription);
});

// Create user subscription for the authenticated user
userSubscriptionRouter.post(
  "/",
  jwtMiddleware,
  zValidator("json", createUserSubscriptionSchema),
  async (c) => {
    const validatedData = c.req.valid("json");
    const userId = c.var.user.id;

    // Override userId to ensure user can only create subscription for themselves
    const userSubscriptionToCreate = { ...validatedData, userId };

    try {
      const createdUserSubscription = await userSubscriptionService.create(
        userSubscriptionToCreate,
      );
      return c.json(createdUserSubscription, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Unknown error occurred" }, 500);
    }
  },
);

// Update user subscription (only if it belongs to the authenticated user)
userSubscriptionRouter.put(
  "/:id",
  jwtMiddleware,
  zValidator("json", updateUserSubscriptionSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const validatedData = c.req.valid("json");
    const userId = c.var.user.id;

    const existingUserSubscription = await userSubscriptionService.getById(id);

    if (
      !existingUserSubscription ||
      existingUserSubscription.userId !== userId
    ) {
      return c.json({ error: "User subscription not found" }, 404);
    }

    const updatedUserSubscription = await userSubscriptionService.update(
      id,
      validatedData,
    );

    if (!updatedUserSubscription) {
      return c.json({ error: "User subscription not found" }, 404);
    }

    return c.json(updatedUserSubscription);
  },
);

// Delete user subscription (only if it belongs to the authenticated user)
userSubscriptionRouter.delete("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const userId = c.var.user.id;

  const existingUserSubscription = await userSubscriptionService.getById(id);

  if (!existingUserSubscription || existingUserSubscription.userId !== userId) {
    return c.json({ error: "User subscription not found" }, 404);
  }

  const deleted = await userSubscriptionService.delete(id);

  if (!deleted) {
    return c.json({ error: "User subscription not found" }, 404);
  }

  return c.json({ message: "User subscription deleted successfully" });
});

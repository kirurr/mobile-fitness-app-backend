import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt.js";
import { userSubscriptionService } from "./service.js";
import {
  createUserSubscriptionSchema,
  updateUserSubscriptionSchema,
  userSubscriptionOpenApiSchema,
} from "./schema.js";

export const userSubscriptionRouter = new Hono();

const messageSchema = z.object({ message: z.string() });

// Get user subscriptions for the authenticated user
userSubscriptionRouter.get(
  "/",
  describeRoute({
    description: "Get user subscriptions for the authenticated user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(userSubscriptionOpenApiSchema.array()),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const userId = c.var.user.id;

    const userSubscriptions = await userSubscriptionService.getByUserId(userId);

    return c.json(userSubscriptions);
  },
);

// Get user subscription by ID (only if it belongs to the authenticated user)
userSubscriptionRouter.get(
  "/:id",
  describeRoute({
    description: "Get user subscription by ID for the authenticated user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(userSubscriptionOpenApiSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const id = Number(c.req.param("id"));
    const userId = c.var.user.id;

    const userSubscription = await userSubscriptionService.getById(id);

    if (!userSubscription || userSubscription.userId !== userId) {
      return c.json({ error: "User subscription not found" }, 404);
    }

    return c.json(userSubscription);
  },
);

// Create user subscription for the authenticated user
userSubscriptionRouter.post(
  "/",
  describeRoute({
    description: "Create user subscription for the authenticated user",
    responses: {
      201: {
        description: "Created",
        content: {
          "application/json": { schema: resolver(userSubscriptionOpenApiSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", createUserSubscriptionSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
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
  describeRoute({
    description: "Update user subscription for the authenticated user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(userSubscriptionOpenApiSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", updateUserSubscriptionSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
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
userSubscriptionRouter.delete(
  "/:id",
  describeRoute({
    description: "Delete user subscription for the authenticated user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(messageSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
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
  },
);

import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt.js";
import { userDataService } from "./service.js";
import {
  createUserDataSchema,
  updateUserDataSchema,
  userDataSchema,
} from "./schema.js";

export const userDataRouter = new Hono();

const messageSchema = z.object({ message: z.string() });

// Get user data for the authenticated user
userDataRouter.get(
  "/",
  describeRoute({
    description: "Get user data for the authenticated user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(userDataSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const userId = c.var.user.id;

    const userData = await userDataService.getByUserId(userId);

    if (!userData) {
      return c.json({ error: "User data not found" }, 400);
    }

    return c.json(userData);
  },
);

// Create user data for the authenticated user
userDataRouter.post(
  "/",
  describeRoute({
    description: "Create user data for the authenticated user",
    responses: {
      201: {
        description: "Created",
        content: {
          "application/json": { schema: resolver(userDataSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", createUserDataSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
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
  describeRoute({
    description: "Update user data for the authenticated user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(userDataSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", updateUserDataSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
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
userDataRouter.delete(
  "/",
  describeRoute({
    description: "Delete user data for the authenticated user",
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
    const userId = c.var.user.id;

    const deleted = await userDataService.delete(userId);

    if (!deleted) {
      return c.json({ error: "User data not found" }, 404);
    }

    return c.json({ message: "User data deleted successfully" });
  },
);

import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { jwtMiddleware } from "../middleware/jwt.js";
import { subscriptionService } from "./service.js";
import { subscriptionSchema } from "./schema.js";

export const subscriptionRouter = new Hono();

// Get all subscriptions
subscriptionRouter.get(
  "/",
  describeRoute({
    description: "Get all subscriptions",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(subscriptionSchema.array()) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const subscriptions = await subscriptionService.getAll();
    return c.json(subscriptions);
  },
);

// Get subscription by ID
subscriptionRouter.get(
  "/:id",
  describeRoute({
    description: "Get subscription by ID",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(subscriptionSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const id = Number(c.req.param("id"));

    const subscription = await subscriptionService.getById(id);

    if (!subscription) {
      return c.json({ error: "Subscription not found" }, 404);
    }

    return c.json(subscription);
  },
);

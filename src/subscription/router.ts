import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { subscriptionService } from "./service";

export const subscriptionRouter = new Hono();

// Get all subscriptions
subscriptionRouter.get("/", jwtMiddleware, async (c) => {
  const subscriptions = await subscriptionService.getAll();
  return c.json(subscriptions);
});

// Get subscription by ID
subscriptionRouter.get("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  
  const subscription = await subscriptionService.getById(id);
  
  if (!subscription) {
    return c.json({ error: "Subscription not found" }, 404);
  }
  
  return c.json(subscription);
});
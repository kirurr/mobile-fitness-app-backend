import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { jwtMiddleware } from "../middleware/jwt";
import { userPaymentService } from "./service";
import {
  createUserPaymentSchema,
  updateUserPaymentSchema,
} from "./schema";

export const userPaymentRouter = new Hono();

// Get user payments for the authenticated user
userPaymentRouter.get("/", jwtMiddleware, async (c) => {
  const userId = c.var.user.id;

  const userPayments = await userPaymentService.getByUserId(userId);

  return c.json(userPayments);
});

// Get user payment by ID (only if it belongs to the authenticated user)
userPaymentRouter.get("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const userId = c.var.user.id;

  const userPayment = await userPaymentService.getById(id);

  if (!userPayment || userPayment.userId !== userId) {
    return c.json({ error: "User payment not found" }, 404);
  }

  return c.json(userPayment);
});

// Create user payment for the authenticated user
userPaymentRouter.post(
  "/",
  jwtMiddleware,
  zValidator("json", createUserPaymentSchema),
  async (c) => {
    const validatedData = c.req.valid("json");
    const userId = c.var.user.id;

    // Override userId to ensure user can only create payment for themselves
    const userPaymentToCreate = { ...validatedData, userId };

    try {
      const createdUserPayment = await userPaymentService.create(
        userPaymentToCreate,
      );
      return c.json(createdUserPayment, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Unknown error occurred" }, 500);
    }
  },
);

// Update user payment (only if it belongs to the authenticated user)
userPaymentRouter.put(
  "/:id",
  jwtMiddleware,
  zValidator("json", updateUserPaymentSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const validatedData = c.req.valid("json");
    const userId = c.var.user.id;

    const existingUserPayment = await userPaymentService.getById(id);

    if (
      !existingUserPayment ||
      existingUserPayment.userId !== userId
    ) {
      return c.json({ error: "User payment not found" }, 404);
    }

    const updatedUserPayment = await userPaymentService.update(
      id,
      validatedData,
    );

    if (!updatedUserPayment) {
      return c.json({ error: "User payment not found" }, 404);
    }

    return c.json(updatedUserPayment);
  },
);

// Delete user payment (only if it belongs to the authenticated user)
userPaymentRouter.delete("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const userId = c.var.user.id;

  const existingUserPayment = await userPaymentService.getById(id);

  if (!existingUserPayment || existingUserPayment.userId !== userId) {
    return c.json({ error: "User payment not found" }, 404);
  }

  const deleted = await userPaymentService.delete(id);

  if (!deleted) {
    return c.json({ error: "User payment not found" }, 404);
  }

  return c.json({ message: "User payment deleted successfully" });
});

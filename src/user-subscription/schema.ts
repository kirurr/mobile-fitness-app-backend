import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userSubscriptionTable } from "../db/schema";
import { z } from "zod";

export const userSubscriptionSchema = createSelectSchema(userSubscriptionTable);

export type UserSubscription = z.infer<typeof userSubscriptionSchema>;

export const createUserSubscriptionSchema = createInsertSchema(userSubscriptionTable, {
  userId: z.number(),
  subscriptionId: z.number(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime(),
});

export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>;

export const updateUserSubscriptionSchema = createUserSubscriptionSchema.partial();

export type UpdateUserSubscriptionInput = z.infer<typeof updateUserSubscriptionSchema>;

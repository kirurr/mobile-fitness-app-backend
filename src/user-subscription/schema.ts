import { createInsertSchema, createSelectSchema  } from "drizzle-zod";
import { userSubscriptionTable } from "../db/schema";
import { z } from "zod";

export const userSubscriptionSchema = createSelectSchema(userSubscriptionTable);

export type UserSubscription = z.infer<typeof userSubscriptionSchema>;

export const userSubscriptionOpenApiSchema = userSubscriptionSchema.extend({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const createUserSubscriptionSchema = createInsertSchema(userSubscriptionTable, {
  userId: z.number(),
  subscriptionId: z.number(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime(),
});

export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>;

export const updateUserSubscriptionSchema = createUserSubscriptionSchema.partial();

export type UpdateUserSubscriptionInput = z.infer<typeof updateUserSubscriptionSchema>;

export const updateUserSubscriptionSchemaOmitStartDate = createUserSubscriptionSchema.omit({
	startDate: true,
	endDate: true,
});

export type UpdateUserSubscription = z.infer<
	typeof updateUserSubscriptionSchemaOmitStartDate
> & {
	startDate?: Date;
	endDate?: Date;
};

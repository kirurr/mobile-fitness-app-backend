import { createInsertSchema, createSelectSchema  } from "drizzle-zod";
import { userSubscriptionTable } from "../db/schema.js";
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
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime(),
}).extend({
  id: z.number().optional().nullable(),
});

export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>;

export const updateUserSubscriptionSchema = createUserSubscriptionSchema
  .omit({ id: true })
  .partial();

export type UpdateUserSubscriptionInput = z.infer<typeof updateUserSubscriptionSchema>;

export const updateUserSubscriptionSchemaOmitStartDate = createUserSubscriptionSchema.omit({
  id: true,
	startDate: true,
	endDate: true,
});

export type UpdateUserSubscription = z.infer<
	typeof updateUserSubscriptionSchemaOmitStartDate
> & {
	startDate?: Date;
	endDate?: Date;
};

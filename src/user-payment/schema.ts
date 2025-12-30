import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userPaymentTable } from "../db/schema.js";
import { z } from "zod";

export const userPaymentSchema = createSelectSchema(userPaymentTable);

export type UserPayment = z.infer<typeof userPaymentSchema>;

export const userPaymentOpenApiSchema = userPaymentSchema.extend({
  createdAt: z.string().datetime(),
});

export const createUserPaymentSchema = createInsertSchema(userPaymentTable, {
  userId: z.number(),
  amount: z.number(),
})
  .omit({ id: true, createdAt: true })
  .extend({
    id: z.number().optional().nullable(),
  });

export type CreateUserPaymentInput = z.infer<typeof createUserPaymentSchema>;

export const updateUserPaymentSchema = createUserPaymentSchema
  .omit({ id: true })
  .partial();

export type UpdateUserPaymentInput = z.infer<typeof updateUserPaymentSchema>;

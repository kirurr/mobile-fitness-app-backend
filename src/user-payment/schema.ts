import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userPaymentTable } from "../db/schema";
import { z } from "zod";

export const userPaymentSchema = createSelectSchema(userPaymentTable);

export type UserPayment = z.infer<typeof userPaymentSchema>;

export const createUserPaymentSchema = createInsertSchema(userPaymentTable, {
  userId: z.number(),
  amount: z.number(),
});

export type CreateUserPaymentInput = z.infer<typeof createUserPaymentSchema>;

export const updateUserPaymentSchema = createUserPaymentSchema.partial();

export type UpdateUserPaymentInput = z.infer<typeof updateUserPaymentSchema>;
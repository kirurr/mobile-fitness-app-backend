import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userDataTable } from "../db/schema.js";
import { z } from "zod";

export const userDataSchema = createSelectSchema(userDataTable);

export type UserData = z.infer<typeof userDataSchema>;

export const createUserDataSchema = createInsertSchema(userDataTable, {
  name: z.string().min(1),
  age: z.number().min(1).max(120),
  weight: z.number().min(1),
  height: z.number().min(1),
  fitnessGoalId: z.number(),
  trainingLevel: z.number(),
}).omit({ userId: true });

export type CreateUserDataInput = z.infer<typeof createUserDataSchema> & {
  userId: number;
};

export const updateUserDataSchema = createUserDataSchema.partial();

export type UpdateUserDataInput = z.infer<typeof updateUserDataSchema>;


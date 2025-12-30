import { createSelectSchema } from "drizzle-zod";
import { fitnessGoalTable } from "../db/schema.js";
import { z } from "zod";

export const fitnessGoalSchema = createSelectSchema(fitnessGoalTable);

export type FitnessGoal = z.infer<typeof fitnessGoalSchema>;
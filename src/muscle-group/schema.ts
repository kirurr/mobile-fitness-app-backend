import { createSelectSchema } from "drizzle-zod";
import { muscleGroupTable } from "../db/schema.js";
import { z } from "zod";

export const muscleGroupSchema = createSelectSchema(muscleGroupTable);

export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
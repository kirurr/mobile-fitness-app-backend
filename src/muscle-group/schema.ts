import { createSelectSchema } from "drizzle-zod";
import { muscleGroupTable } from "../db/schema";
import { z } from "zod";

export const muscleGroupSchema = createSelectSchema(muscleGroupTable);

export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
import { exerciseTable } from "../db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for selecting exercises from the database
export const exerciseSchema = createSelectSchema(exerciseTable);

// Define type for exercise
export type Exercise = z.infer<typeof exerciseSchema>;

// Schema for query parameters for filtering
export const exerciseFilterSchema = z.object({
  categoryId: z.string().optional().nullable(),
  muscleGroupId: z.string().optional().nullable(),
  difficultyLevelId: z.string().optional().nullable(),
}).partial();

export type ExerciseFilter = z.infer<typeof exerciseFilterSchema>;
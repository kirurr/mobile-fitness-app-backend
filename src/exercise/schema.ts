import { exerciseTable } from "../db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for selecting exercises from the database
export const exerciseSchema = createSelectSchema(exerciseTable);

// Define type for exercise
export type Exercise = z.infer<typeof exerciseSchema>;

// Schema for query parameters for filtering
export const exerciseFilterSchema = z.object({
  categoryId: z.string().optional(),
  muscleGroupId: z.string().optional(),
  difficultyLevelId: z.string().optional(),
}).partial();

export type ExerciseFilter = z.infer<typeof exerciseFilterSchema>;
import { createSelectSchema } from "drizzle-zod";
import { exerciseCategoryTable } from "../db/schema.js";
import { z } from "zod";

export const exerciseCategorySchema = createSelectSchema(exerciseCategoryTable);

export type ExerciseCategory = z.infer<typeof exerciseCategorySchema>;
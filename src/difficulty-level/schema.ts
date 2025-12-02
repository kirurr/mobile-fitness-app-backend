import { createSelectSchema } from "drizzle-zod";
import { difficultyLevelTable } from "../db/schema";
import { z } from "zod";

export const difficultyLevelSchema = createSelectSchema(difficultyLevelTable);

export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;
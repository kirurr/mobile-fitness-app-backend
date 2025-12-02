import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { difficultyLevelTable } from "../db/schema";
import type { DifficultyLevel } from "./schema";

export const difficultyLevelService = {
  getAll: async (): Promise<DifficultyLevel[]> => {
    const difficultyLevels = await db.select().from(difficultyLevelTable);
    return difficultyLevels;
  },

  getById: async (id: number): Promise<DifficultyLevel | null> => {
    const difficultyLevel = await db
      .select()
      .from(difficultyLevelTable)
      .where(eq(difficultyLevelTable.id, id));

    if (difficultyLevel.length === 0) {
      return null;
    }

    return difficultyLevel[0];
  },
};
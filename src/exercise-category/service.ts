import { db } from "../db/drizzle";
import { exerciseCategoryTable } from "../db/schema";
import type { ExerciseCategory } from "./schema";

export const exerciseCategoryService = {
  getAll: async (): Promise<ExerciseCategory[]> => {
    const exerciseCategories = await db.select().from(exerciseCategoryTable);
    return exerciseCategories;
  },

  getById: async (id: number): Promise<ExerciseCategory | null> => {
    const exerciseCategory = await db
      .select()
      .from(exerciseCategoryTable)
      .where(() => exerciseCategoryTable.id.eq(id));

    if (exerciseCategory.length === 0) {
      return null;
    }

    return exerciseCategory[0];
  },
};
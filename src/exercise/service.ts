import { exerciseTable } from "../db/schema.js";
import { eq, and, SQL, inArray } from "drizzle-orm";
import type { ExerciseFilter } from "./schema.js";
import { db } from "../db/drizzle.js";

export const exerciseService = {
  // Get all exercises with optional filtering
  getAll: async (filters?: ExerciseFilter) => {
    // Apply filters if provided
		const conditions: SQL[] = [];
    if (filters) {
      
      if (filters.categoryId) {
        const categoryIds = filters.categoryId.split(',').map(id => parseInt(id.trim()));
        if (categoryIds.length > 0 && !categoryIds.some(isNaN)) {
          conditions.push(inArray(exerciseTable.categoryId, categoryIds));
        }
      }
      
      if (filters.muscleGroupId) {
        const muscleGroupIds = filters.muscleGroupId.split(',').map(id => parseInt(id.trim()));
        if (muscleGroupIds.length > 0 && !muscleGroupIds.some(isNaN)) {
          conditions.push(inArray(exerciseTable.muscleGroupId, muscleGroupIds));
        }
      }
      
      if (filters.difficultyLevelId) {
        const difficultyLevelIds = filters.difficultyLevelId.split(',').map(id => parseInt(id.trim()));
        if (difficultyLevelIds.length > 0 && !difficultyLevelIds.some(isNaN)) {
          conditions.push(inArray(exerciseTable.difficultyLevelId, difficultyLevelIds));
        }
      }
      
    }
		const query = db.select().from(exerciseTable).where(conditions ? and(...conditions) : undefined);
    
    
    const exercises = await query;
    return exercises;
  },

  // Get exercise by ID
  getById: async (id: number) => {
    const [exercise] = await db
      .select()
      .from(exerciseTable)
      .where(eq(exerciseTable.id, id));
    
    return exercise || null;
  },
};

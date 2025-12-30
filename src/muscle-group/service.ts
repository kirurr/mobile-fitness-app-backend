import { db } from "../db/drizzle.js";
import { muscleGroupTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { MuscleGroup } from "./schema.js";

export const muscleGroupService = {
  getAll: async (): Promise<MuscleGroup[]> => {
    const muscleGroups = await db.select().from(muscleGroupTable);
    return muscleGroups;
  },

  getById: async (id: number): Promise<MuscleGroup | null> => {
    const muscleGroup = await db
      .select()
      .from(muscleGroupTable)
      .where(eq(muscleGroupTable.id, id));

    if (muscleGroup.length === 0) {
      return null;
    }

    return muscleGroup[0];
  },
};
import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { fitnessGoalTable } from "../db/schema";
import type { FitnessGoal } from "./schema";

export const fitnessGoalService = {
  getAll: async (): Promise<FitnessGoal[]> => {
    const fitnessGoals = await db.select().from(fitnessGoalTable);
    return fitnessGoals;
  },

  getById: async (id: number): Promise<FitnessGoal | null> => {
    const fitnessGoal = await db
      .select()
      .from(fitnessGoalTable)
      .where(eq(fitnessGoalTable.id, id));

    if (fitnessGoal.length === 0) {
      return null;
    }

    return fitnessGoal[0];
  },
};
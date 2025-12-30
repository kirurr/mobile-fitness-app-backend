import { db } from "../db/drizzle.js";
import {
  userCompletedExerciseTable,
  userCompletedProgramTable,
  exerciseTable,
  exerciseProgram_ExerciseTable,
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type {
  CreateUserCompletedExercise,
  UpdateUserCompletedExercise,
} from "./schema.js";

export const userCompletedExerciseService = {
  // Get all completed exercises for a specific completed program
  getAllByProgram: async (completedProgramId: number, userId: number) => {
    // First ensure the program belongs to the user
    const [program] = await db
      .select()
      .from(userCompletedProgramTable)
      .where(
        and(
          eq(userCompletedProgramTable.id, completedProgramId),
          eq(userCompletedProgramTable.userId, userId),
        ),
      );

    if (!program) {
      return null;
    }

    // Get completed exercises for this program with exercise details
    const completedExercises = await db
      .select({
        userCompletedExercise: userCompletedExerciseTable,
        exercise: exerciseTable,
        programExercise: exerciseProgram_ExerciseTable,
      })
      .from(userCompletedExerciseTable)
      .leftJoin(
        exerciseTable,
        eq(userCompletedExerciseTable.exerciseId, exerciseTable.id),
      )
      .leftJoin(
        exerciseProgram_ExerciseTable,
        eq(
          userCompletedExerciseTable.programExerciseId,
          exerciseProgram_ExerciseTable.id,
        ),
      )
      .where(
        eq(userCompletedExerciseTable.completedProgramId, completedProgramId),
      );

    return completedExercises.map((ex) => ({
      ...ex.userCompletedExercise,
      exercise: ex.exercise || null,
      programExercise: ex.programExercise || null,
    }));
  },

  // Get a specific completed exercise by ID
  getById: async (id: number, userId: number) => {
    // Join with userCompletedProgram to verify the exercise belongs to a program owned by the user
    const result = await db
      .select({
        userCompletedExercise: userCompletedExerciseTable,
        userCompletedProgram: userCompletedProgramTable,
      })
      .from(userCompletedExerciseTable)
      .innerJoin(
        userCompletedProgramTable,
        eq(
          userCompletedExerciseTable.completedProgramId,
          userCompletedProgramTable.id,
        ),
      )
      .where(
        and(
          eq(userCompletedExerciseTable.id, id),
          eq(userCompletedProgramTable.userId, userId),
        ),
      );

    if (result.length === 0) {
      return null;
    }

    const { userCompletedExercise } = result[0];

    // Get additional exercise details
    const exerciseDetail = await db
      .select({
        exercise: exerciseTable,
        programExercise: exerciseProgram_ExerciseTable,
      })
      .from(userCompletedExerciseTable)
      .leftJoin(
        exerciseTable,
        eq(userCompletedExerciseTable.exerciseId, exerciseTable.id),
      )
      .leftJoin(
        exerciseProgram_ExerciseTable,
        eq(
          userCompletedExerciseTable.programExerciseId,
          exerciseProgram_ExerciseTable.id,
        ),
      )
      .where(eq(userCompletedExerciseTable.id, id));

    if (exerciseDetail.length === 0) {
      return null;
    }

    return {
      ...userCompletedExercise,
      exercise: exerciseDetail[0].exercise || null,
      programExercise: exerciseDetail[0].programExercise || null,
    };
  },

  // Create a new completed exercise
  create: async (
    exerciseData: CreateUserCompletedExercise & { userId: number },
  ) => {
    // Begin transaction to ensure data consistency
    return await db.transaction(async (trx) => {
      // First verify that the completed program belongs to the user
      const [program] = await trx
        .select()
        .from(userCompletedProgramTable)
        .where(
          and(
            eq(userCompletedProgramTable.id, exerciseData.completedProgramId),
            eq(userCompletedProgramTable.userId, exerciseData.userId),
          ),
        );

      if (!program) {
        throw new Error("Completed program not found");
      }

      // Create the completed exercise
      const [newExercise] = await trx
        .insert(userCompletedExerciseTable)
        .values({
          ...(exerciseData.id !== null && exerciseData.id !== undefined
            ? { id: exerciseData.id }
            : {}),
          completedProgramId: exerciseData.completedProgramId,
          programExerciseId: exerciseData.programExerciseId,
          exerciseId: exerciseData.exerciseId,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          duration: exerciseData.duration,
          weight: exerciseData.weight,
          restDuration: exerciseData.restDuration,
        })
        .returning();

      // Get the created exercise with details
      const exerciseDetail = await trx
        .select({
          exercise: exerciseTable,
          programExercise: exerciseProgram_ExerciseTable,
        })
        .from(userCompletedExerciseTable)
        .leftJoin(
          exerciseTable,
          eq(userCompletedExerciseTable.exerciseId, exerciseTable.id),
        )
        .leftJoin(
          exerciseProgram_ExerciseTable,
          eq(
            userCompletedExerciseTable.programExerciseId,
            exerciseProgram_ExerciseTable.id,
          ),
        )
        .where(eq(userCompletedExerciseTable.id, newExercise.id));

      if (exerciseDetail.length === 0) {
        return newExercise;
      }

      return {
        ...newExercise,
        exercise: exerciseDetail[0].exercise || null,
        programExercise: exerciseDetail[0].programExercise || null,
      };
    });
  },

  // Update an existing completed exercise
  update: async (
    id: number,
    userId: number,
    exerciseData: UpdateUserCompletedExercise,
  ) => {
    // Begin transaction to ensure data consistency
    return await db.transaction(async (trx) => {
      // Verify that the exercise belongs to a program owned by the user
      const result = await trx
        .select({
          userCompletedExercise: userCompletedExerciseTable,
          userCompletedProgram: userCompletedProgramTable,
        })
        .from(userCompletedExerciseTable)
        .innerJoin(
          userCompletedProgramTable,
          eq(
            userCompletedExerciseTable.completedProgramId,
            userCompletedProgramTable.id,
          ),
        )
        .where(
          and(
            eq(userCompletedExerciseTable.id, id),
            eq(userCompletedProgramTable.userId, userId),
          ),
        );

      if (result.length === 0) {
        return null;
      }

      const existingExercise = result[0].userCompletedExercise;

      // Update the completed exercise
      const [updatedExercise] = await trx
        .update(userCompletedExerciseTable)
        .set({
          programExerciseId:
            exerciseData.programExerciseId !== undefined
              ? exerciseData.programExerciseId ?? undefined
              : existingExercise.programExerciseId ?? undefined,
          exerciseId:
            exerciseData.exerciseId !== undefined
              ? exerciseData.exerciseId ?? undefined
              : existingExercise.exerciseId ?? undefined,
          sets:
            exerciseData.sets !== undefined
              ? exerciseData.sets ?? undefined
              : existingExercise.sets,
          reps:
            exerciseData.reps !== undefined
              ? exerciseData.reps
              : existingExercise.reps,
          duration:
            exerciseData.duration !== undefined
              ? exerciseData.duration
              : existingExercise.duration,
          weight:
            exerciseData.weight !== undefined
              ? exerciseData.weight
              : existingExercise.weight,
          restDuration:
            exerciseData.restDuration !== undefined
              ? exerciseData.restDuration
              : existingExercise.restDuration,
        })
        .where(eq(userCompletedExerciseTable.id, id))
        .returning();

      // Get the updated exercise with details
      const exerciseDetail = await trx
        .select({
          exercise: exerciseTable,
          programExercise: exerciseProgram_ExerciseTable,
        })
        .from(userCompletedExerciseTable)
        .leftJoin(
          exerciseTable,
          eq(userCompletedExerciseTable.exerciseId, exerciseTable.id),
        )
        .leftJoin(
          exerciseProgram_ExerciseTable,
          eq(
            userCompletedExerciseTable.programExerciseId,
            exerciseProgram_ExerciseTable.id,
          ),
        )
        .where(eq(userCompletedExerciseTable.id, updatedExercise.id));

      if (exerciseDetail.length === 0) {
        return updatedExercise;
      }

      return {
        ...updatedExercise,
        exercise: exerciseDetail[0].exercise || null,
        programExercise: exerciseDetail[0].programExercise || null,
      };
    });
  },

  // Delete a completed exercise
  delete: async (id: number, userId: number) => {
    // Verify that the exercise belongs to a program owned by the user
    const result = await db
      .select({
        userCompletedExercise: userCompletedExerciseTable,
        userCompletedProgram: userCompletedProgramTable,
      })
      .from(userCompletedExerciseTable)
      .innerJoin(
        userCompletedProgramTable,
        eq(
          userCompletedExerciseTable.completedProgramId,
          userCompletedProgramTable.id,
        ),
      )
      .where(
        and(
          eq(userCompletedExerciseTable.id, id),
          eq(userCompletedProgramTable.userId, userId),
        ),
      );

    if (result.length === 0) {
      return false;
    }

    // Delete the completed exercise
    await db
      .delete(userCompletedExerciseTable)
      .where(eq(userCompletedExerciseTable.id, id));

    return true;
  },
};

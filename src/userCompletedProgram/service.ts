import { db } from "../db/drizzle";
import {
  userCompletedProgramTable,
  userCompletedExerciseTable,
  exerciseTable,
  exerciseProgram_ExerciseTable,
} from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  CreateUserCompletedProgram,
  UpdateUserCompletedProgram,
} from "./schema";

export const userCompletedProgramService = {
  // Get all user completed programs with optional filtering
  getAll: async (userId: number) => {
    // Get all completed programs for the user
    const completedPrograms = await db
      .select()
      .from(userCompletedProgramTable)
      .where(eq(userCompletedProgramTable.userId, userId))
      .orderBy(desc(userCompletedProgramTable.startDate)); // Order by most recent first

    // For each program, get its completed exercises
    const programsWithExercises = await Promise.all(
      completedPrograms.map(async (program) => {
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
          .where(eq(userCompletedExerciseTable.completedProgramId, program.id));

        return {
          ...program,
          completedExercises: completedExercises.map((ex) => ({
            ...ex.userCompletedExercise,
            exercise: ex.exercise || null,
            programExercise: ex.programExercise || null,
          })),
        };
      }),
    );

    return programsWithExercises;
  },

  // Get a specific user completed program by ID with its exercises
  getById: async (id: number, userId: number) => {
    // Get the completed program ensuring it belongs to the user
    const [program] = await db
      .select()
      .from(userCompletedProgramTable)
      .where(
        and(
          eq(userCompletedProgramTable.id, id),
          eq(userCompletedProgramTable.userId, userId),
        ),
      );

    if (!program) {
      return null;
    }

    // Get completed exercises for this program
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
      .where(eq(userCompletedExerciseTable.completedProgramId, program.id));

    return {
      ...program,
      completedExercises: completedExercises.map((ex) => ({
        ...ex.userCompletedExercise,
        exercise: ex.exercise || null,
        programExercise: ex.programExercise || null,
      })),
    };
  },

  // Create a new user completed program with optional exercises
  create: async (programData: CreateUserCompletedProgram) => {
    // Begin transaction to ensure data consistency
    return await db.transaction(async (trx) => {
      // Create the completed program
      const [newProgram] = await trx
        .insert(userCompletedProgramTable)
        .values({
          userId: programData.userId,
          programId: programData.programId,
          startDate: programData.startDate
            ? new Date(programData.startDate)
            : undefined,
          endDate: programData.endDate
            ? new Date(programData.endDate)
            : undefined,
        })
        .returning();

      // Return the program with its exercises
      const completedExercises = await trx
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
          eq(userCompletedExerciseTable.completedProgramId, newProgram.id),
        );

      return {
        ...newProgram,
        completedExercises: completedExercises.map((ex) => ({
          ...ex.userCompletedExercise,
          exercise: ex.exercise || null,
          programExercise: ex.programExercise || null,
        })),
      };
    });
  },

  // Update an existing user completed program
  update: async (
    id: number,
    userId: number,
    programData: UpdateUserCompletedProgram,
  ) => {
    // Begin transaction to ensure data consistency
    return await db.transaction(async (trx) => {
      // Check if the completed program exists and belongs to the user
      const [existingProgram] = await trx
        .select()
        .from(userCompletedProgramTable)
        .where(
          and(
            eq(userCompletedProgramTable.id, id),
            eq(userCompletedProgramTable.userId, userId),
          ),
        );

      if (!existingProgram) {
        return null;
      }

      // Update the completed program
      const [updatedProgram] = await trx
        .update(userCompletedProgramTable)
        .set({
          userId: programData.userId ?? existingProgram.userId,
          programId: programData.programId ?? existingProgram.programId,
          startDate: programData.startDate
            ? new Date(programData.startDate)
            : existingProgram.startDate,
          endDate:
            programData.endDate !== undefined
              ? programData.endDate
                ? new Date(programData.endDate)
                : null
              : existingProgram.endDate,
        })
        .where(eq(userCompletedProgramTable.id, id))
        .returning();

      // Return the updated program with its exercises
      const completedExercises = await trx
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
          eq(userCompletedExerciseTable.completedProgramId, updatedProgram.id),
        );

      return {
        ...updatedProgram,
        completedExercises: completedExercises.map((ex) => ({
          ...ex.userCompletedExercise,
          exercise: ex.exercise || null,
          programExercise: ex.programExercise || null,
        })),
      };
    });
  },

  // Delete a user completed program (and its exercises via cascade)
  delete: async (id: number, userId: number) => {
    // Check if the completed program exists and belongs to the user
    const [existingProgram] = await db
      .select()
      .from(userCompletedProgramTable)
      .where(
        and(
          eq(userCompletedProgramTable.id, id),
          eq(userCompletedProgramTable.userId, userId),
        ),
      );

    if (!existingProgram) {
      return false;
    }

    // Delete the completed program (exercises will be deleted via foreign key cascade if configured)
    await db
      .delete(userCompletedProgramTable)
      .where(eq(userCompletedProgramTable.id, id));

    return true;
  },
};


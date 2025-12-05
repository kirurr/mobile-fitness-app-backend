import {
  exerciseProgramTable,
  exerciseProgram_FitnessGoalTable,
  exerciseProgram_ExerciseTable,
  exerciseTable,
  fitnessGoalTable,
} from "../db/schema";
import { eq, and, or, isNull, inArray, SQL } from "drizzle-orm";
import type {
  ExerciseProgramFilter,
  CreateExerciseProgram,
  UpdateExerciseProgram,
} from "./schema";
import { db } from "../db/drizzle";

export const exerciseProgramService = {
  // Get all exercise programs with optional filtering and including exercises and fitness goals
  getAll: async (userId: number, filters?: ExerciseProgramFilter) => {
    // Base query to get exercise programs that belong to the user or are system programs (userId is null)

    // Apply filters if provided
    const conditions: SQL[] = [];
    if (filters) {
      if (filters.difficultyLevelId) {
        const difficultyIds = filters.difficultyLevelId
          .split(",")
          .map((id) => parseInt(id.trim()));
        if (difficultyIds.length > 0 && !difficultyIds.some(isNaN)) {
          conditions.push(
            inArray(exerciseProgramTable.difficultyLevelId, difficultyIds),
          );
        }
      }

      if (filters.subscriptionId) {
        const subscriptionIds = filters.subscriptionId
          .split(",")
          .map((id) => parseInt(id.trim()));
        if (subscriptionIds.length > 0 && !subscriptionIds.some(isNaN)) {
          conditions.push(
            inArray(exerciseProgramTable.subscriptionId, subscriptionIds),
          );
        }
      }

      if (filters.fitnessGoalId) {
        const fitnessGoalIds = filters.fitnessGoalId
          .split(",")
          .map((id) => parseInt(id.trim()));
        if (fitnessGoalIds.length > 0 && !fitnessGoalIds.some(isNaN)) {
          // This requires a more complex query to filter by fitness goal
          // We'll handle this case separately after the main query
        }
      }
    }

    const query = db
      .select()
      .from(exerciseProgramTable)
      .where(
        and(
          or(
            eq(exerciseProgramTable.userId, userId), // Programs belonging to the user
            isNull(exerciseProgramTable.userId), // System programs
          ),
          conditions ? and(...conditions) : undefined,
        ),
      );
    const programs = await query;

    // For each program, get its associated exercises and fitness goals
    const programsWithDetails = await Promise.all(
      programs.map(async (program) => {
        // Get exercises for this program
        const exerciseJoins = await db
          .select({
            exercise: exerciseTable,
            programExercise: exerciseProgram_ExerciseTable,
          })
          .from(exerciseProgram_ExerciseTable)
          .innerJoin(
            exerciseTable,
            eq(exerciseProgram_ExerciseTable.exerciseId, exerciseTable.id),
          )
          .where(eq(exerciseProgram_ExerciseTable.programId, program.id))
          .orderBy(exerciseProgram_ExerciseTable.order);

        // Get fitness goals for this program
        const fitnessGoalJoins = await db
          .select({
            fitnessGoal: fitnessGoalTable,
          })
          .from(exerciseProgram_FitnessGoalTable)
          .innerJoin(
            fitnessGoalTable,
            eq(
              exerciseProgram_FitnessGoalTable.fitnessGoalId,
              fitnessGoalTable.id,
            ),
          )
          .where(eq(exerciseProgram_FitnessGoalTable.programId, program.id));

        // Apply fitness goal filter if specified
        if (filters?.fitnessGoalId) {
          const requiredFitnessGoalIds = filters.fitnessGoalId
            .split(",")
            .map((id) => parseInt(id.trim()));

          // Check if this program has any of the required fitness goals
          const hasAnyRequiredGoal = fitnessGoalJoins.some((goalJoin) =>
            requiredFitnessGoalIds.includes(goalJoin.fitnessGoal.id),
          );

          // If this program doesn't have any of the required goals, skip it
          if (!hasAnyRequiredGoal) {
            return null;
          }
        }

        return {
          ...program,
          exercises: exerciseJoins.map((join) => ({
            ...join.exercise,
            programExercise: join.programExercise,
          })),
          fitnessGoals: fitnessGoalJoins.map((join) => join.fitnessGoal),
        };
      }),
    );

    // Filter out null programs (those that didn't match fitness goal filter)
    return programsWithDetails.filter((program) => program !== null);
  },

  // Get exercise program by ID
  getById: async (id: number, userId: number) => {
    // Get the program ensuring it belongs to the user or is a system program
    const [program] = await db
      .select()
      .from(exerciseProgramTable)
      .where(
        and(
          eq(exerciseProgramTable.id, id),
          or(
            eq(exerciseProgramTable.userId, userId),
            isNull(exerciseProgramTable.userId),
          ),
        ),
      );

    if (!program) {
      return null;
    }

    // Get exercises for this program
    const exerciseJoins = await db
      .select({
        exercise: exerciseTable,
        programExercise: exerciseProgram_ExerciseTable,
      })
      .from(exerciseProgram_ExerciseTable)
      .innerJoin(
        exerciseTable,
        eq(exerciseProgram_ExerciseTable.exerciseId, exerciseTable.id),
      )
      .where(eq(exerciseProgram_ExerciseTable.programId, program.id))
      .orderBy(exerciseProgram_ExerciseTable.order);

    // Get fitness goals for this program
    const fitnessGoalJoins = await db
      .select({
        fitnessGoal: fitnessGoalTable,
      })
      .from(exerciseProgram_FitnessGoalTable)
      .innerJoin(
        fitnessGoalTable,
        eq(exerciseProgram_FitnessGoalTable.fitnessGoalId, fitnessGoalTable.id),
      )
      .where(eq(exerciseProgram_FitnessGoalTable.programId, program.id));

    return {
      ...program,
      exercises: exerciseJoins.map((join) => ({
        ...join.exercise,
        programExercise: join.programExercise,
      })),
      fitnessGoals: fitnessGoalJoins.map((join) => join.fitnessGoal),
    };
  },

  // Create a new exercise program
  create: async (programData: CreateExerciseProgram) => {
    return await db.transaction(async (tx) => {
      const newProgram = await tx
        .insert(exerciseProgramTable)
        .values({
          name: programData.name,
          description: programData.description,
          difficultyLevelId: programData.difficultyLevelId,
          subscriptionId: programData.subscriptionId,
          userId: programData.userId,
        })
        .returning();

      const createdProgram = newProgram[0];

      // Add fitness goals to the program
      if (programData.fitnessGoalIds.length > 0) {
        await tx.insert(exerciseProgram_FitnessGoalTable).values(
          programData.fitnessGoalIds.map((fitnessGoalId) => ({
            programId: createdProgram.id,
            fitnessGoalId,
          })),
        );
      }

      // Add exercises to the program
      if (programData.exerciseIds.length > 0) {
        await tx.insert(exerciseProgram_ExerciseTable).values(
          programData.exerciseIds.map((ex) => ({
            programId: createdProgram.id,
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            restDuration: ex.restDuration,
          })),
        );
      }

      return createdProgram;
    });
  },

  // Update an existing exercise program
  update: async (
    id: number,
    userId: number,
    programData: UpdateExerciseProgram,
  ) => {
    // Check if program exists and belongs to user or is system
    return await db.transaction(async (tx) => {
      const [existingProgram] = await tx
        .select()
        .from(exerciseProgramTable)
        .where(
          and(
            eq(exerciseProgramTable.id, id),
            or(
              eq(exerciseProgramTable.userId, userId),
              isNull(exerciseProgramTable.userId),
            ),
          ),
        );

      if (!existingProgram) {
        return null;
      }

      // Update the program
      const updatedProgram = await tx
        .update(exerciseProgramTable)
        .set({
          name: programData.name ?? existingProgram.name,
          description: programData.description ?? existingProgram.description,
          difficultyLevelId:
            programData.difficultyLevelId ?? existingProgram.difficultyLevelId,
          subscriptionId:
            programData.subscriptionId ?? existingProgram.subscriptionId,
          // Only update userId if it's the user's own program (not a system program)
          ...(existingProgram.userId !== null &&
            programData.userId !== undefined && { userId: programData.userId }),
        })
        .where(eq(exerciseProgramTable.id, id))
        .returning();

      // Update fitness goals if provided
      if (programData.fitnessGoalIds !== undefined) {
        // Delete existing fitness goal associations
        await tx
          .delete(exerciseProgram_FitnessGoalTable)
          .where(eq(exerciseProgram_FitnessGoalTable.programId, id));

        // Add new fitness goal associations
        if (programData.fitnessGoalIds.length > 0) {
          await tx.insert(exerciseProgram_FitnessGoalTable).values(
            programData.fitnessGoalIds.map((fitnessGoalId) => ({
              programId: id,
              fitnessGoalId,
            })),
          );
        }
      }

      // Update exercises if provided
      if (programData.exerciseIds !== undefined) {
        // Delete existing exercise associations
        await tx
          .delete(exerciseProgram_ExerciseTable)
          .where(eq(exerciseProgram_ExerciseTable.programId, id));

        // Add new exercise associations
        if (programData.exerciseIds.length > 0) {
          await tx.insert(exerciseProgram_ExerciseTable).values(
            programData.exerciseIds.map((ex) => ({
              programId: id,
              exerciseId: ex.exerciseId,
              order: ex.order,
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.duration,
              restDuration: ex.restDuration,
            })),
          );
        }
      }

      return updatedProgram[0];
    });
  },

  // Delete an exercise program
  delete: async (id: number, userId: number) => {
    // Check if program exists and belongs to user or is system
    const [existingProgram] = await db
      .select()
      .from(exerciseProgramTable)
      .where(
        and(
          eq(exerciseProgramTable.id, id),
          or(
            eq(exerciseProgramTable.userId, userId),
            isNull(exerciseProgramTable.userId),
          ),
        ),
      );

    if (!existingProgram) {
      return false;
    }

    // Delete fitness goal associations
    await db
      .delete(exerciseProgram_FitnessGoalTable)
      .where(eq(exerciseProgram_FitnessGoalTable.programId, id));

    // Delete exercise associations
    await db
      .delete(exerciseProgram_ExerciseTable)
      .where(eq(exerciseProgram_ExerciseTable.programId, id));

    // Delete the program itself
    await db
      .delete(exerciseProgramTable)
      .where(eq(exerciseProgramTable.id, id));

    return true;
  },
};

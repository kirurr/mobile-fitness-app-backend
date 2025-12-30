import { db } from "../db/drizzle.js";
import {
  plannedExerciseProgramTable,
  plannedExerciseProgram_DateTable,
  exerciseProgramTable
} from "../db/schema.js";
import { eq, and, inArray, or, isNull } from "drizzle-orm";
import type {
  CreatePlannedExerciseProgram,
  UpdatePlannedExerciseProgram,
  CreatePlannedExerciseProgramDate,
  UpdatePlannedExerciseProgramDate
} from "./schema.js";

export const plannedExerciseProgramService = {
  // Get all planned exercise programs with their dates
  getAll: async (userId: number) => {
    // Get user's exercise programs and system exercise programs to ensure they have access
    const accessiblePrograms = await db
      .select({ id: exerciseProgramTable.id })
      .from(exerciseProgramTable)
      .where(
        or(
          eq(exerciseProgramTable.userId, userId), // User's own programs
          isNull(exerciseProgramTable.userId)      // System programs
        )
      );

    // Get all planned exercise programs for user's programs and system programs
    const plannedPrograms = await db
      .select()
      .from(plannedExerciseProgramTable)
      .where(
        inArray(
          plannedExerciseProgramTable.programId,
          accessiblePrograms.map(p => p.id)
        )
      );

    // For each planned program, get its dates
    const programsWithDates = await Promise.all(
      plannedPrograms.map(async (program) => {
        const dates = await db
          .select()
          .from(plannedExerciseProgram_DateTable)
          .where(eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, program.id));

        return {
          ...program,
          dates,
        };
      })
    );

    return programsWithDates;
  },

  // Get a specific planned exercise program by ID with its dates
  getById: async (id: number, userId: number) => {
    // First verify that the planned program is related to an exercise program that belongs to the user
    const plannedProgram = await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgramTable.id, id),
          eq(exerciseProgramTable.userId, userId) // User's own programs
        )
      );

    if (plannedProgram.length === 0) {
      // Also check system programs (where userId is null)
      const systemPlannedProgram = await db
        .select({
          planned: plannedExerciseProgramTable,
          program: exerciseProgramTable,
        })
        .from(plannedExerciseProgramTable)
        .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
        .where(
          and(
            eq(plannedExerciseProgramTable.id, id),
            isNull(exerciseProgramTable.userId) // System programs
          )
        );

      if (systemPlannedProgram.length === 0) {
        return null;
      }
    }

    const [programData] = plannedProgram.length > 0 ? plannedProgram : await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgramTable.id, id),
          isNull(exerciseProgramTable.userId)
        )
      );

    if (!programData) return null;

    // Get dates for this planned program
    const dates = await db
      .select()
      .from(plannedExerciseProgram_DateTable)
      .where(eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, programData.planned.id));

    return {
      ...programData.planned,
      dates,
    };
  },

  // Create a new planned exercise program with optional dates
  create: async (programData: CreatePlannedExerciseProgram, userId: number) => {
    // Verify that the exercise program belongs to the user or is a system program
    const [exerciseProgram] = await db
      .select()
      .from(exerciseProgramTable)
      .where(
        and(
          eq(exerciseProgramTable.id, programData.programId),
          or(eq(exerciseProgramTable.userId, userId), isNull(exerciseProgramTable.userId))
        )
      );

    if (!exerciseProgram) {
      throw new Error("Exercise program not found or access denied");
    }

    // Begin transaction to ensure data consistency
    return await db.transaction(async (trx) => {
      // Create the planned exercise program
      const [newProgram] = await trx
        .insert(plannedExerciseProgramTable)
        .values({
          ...(programData.id !== null && programData.id !== undefined
            ? { id: programData.id }
            : {}),
          programId: programData.programId,
        })
        .returning();

      // If dates are provided, add them to the planned program
      if (programData.dates && programData.dates.length > 0) {
        await trx.insert(plannedExerciseProgram_DateTable).values(
          programData.dates.map(dateStr => ({
            plannedExerciseProgramId: newProgram.id,
            date: new Date(dateStr),
          }))
        );
      }

      // Return the program with its dates
      const dates = await trx
        .select()
        .from(plannedExerciseProgram_DateTable)
        .where(eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, newProgram.id));

      return {
        ...newProgram,
        dates,
      };
    });
  },

  // Update an existing planned exercise program
  update: async (id: number, userId: number, programData: UpdatePlannedExerciseProgram) => {
    // Verify that the planned program is related to an exercise program that belongs to the user
    const plannedProgram = await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgramTable.id, id),
          eq(exerciseProgramTable.userId, userId) // User's own programs
        )
      );

    if (plannedProgram.length === 0) {
      // Also check system programs (where userId is null)
      const systemPlannedProgram = await db
        .select({
          planned: plannedExerciseProgramTable,
          program: exerciseProgramTable,
        })
        .from(plannedExerciseProgramTable)
        .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
        .where(
          and(
            eq(plannedExerciseProgramTable.id, id),
            isNull(exerciseProgramTable.userId) // System programs
          )
        );

      if (systemPlannedProgram.length === 0) {
        return null;
      }
    }

    const [existingProgram] = plannedProgram.length > 0 ? plannedProgram : await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgramTable.id, id),
          isNull(exerciseProgramTable.userId)
        )
      );

    if (!existingProgram) return null;

    // Begin transaction to ensure data consistency
    return await db.transaction(async (trx) => {
      // Update the planned exercise program
      const [updatedProgram] = await trx
        .update(plannedExerciseProgramTable)
        .set({
          programId: programData.programId ?? existingProgram.planned.programId,
        })
        .where(eq(plannedExerciseProgramTable.id, id))
        .returning();

      // If new dates are provided, replace existing ones
      if (programData.dates !== undefined) {
        // Delete existing dates for this planned program
        await trx
          .delete(plannedExerciseProgram_DateTable)
          .where(eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, updatedProgram.id));

        // Add new dates if provided
        if (programData.dates && programData.dates.length > 0) {
          await trx.insert(plannedExerciseProgram_DateTable).values(
            programData.dates.map(dateStr => ({
              plannedExerciseProgramId: updatedProgram.id,
              date: new Date(dateStr),
            }))
          );
        }
      }

      // Return the updated program with its dates
      const dates = await trx
        .select()
        .from(plannedExerciseProgram_DateTable)
        .where(eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, updatedProgram.id));

      return {
        ...updatedProgram,
        dates,
      };
    });
  },

  // Delete a planned exercise program (and its dates via cascade)
  delete: async (id: number, userId: number) => {
    // Verify that the planned program is related to an exercise program that belongs to the user
    const plannedProgram = await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgramTable.id, id),
          eq(exerciseProgramTable.userId, userId) // User's own programs
        )
      );

    if (plannedProgram.length === 0) {
      // Also check system programs (where userId is null)
      const systemPlannedProgram = await db
        .select({
          planned: plannedExerciseProgramTable,
          program: exerciseProgramTable,
        })
        .from(plannedExerciseProgramTable)
        .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
        .where(
          and(
            eq(plannedExerciseProgramTable.id, id),
            isNull(exerciseProgramTable.userId) // System programs
          )
        );

      if (systemPlannedProgram.length === 0) {
        return false;
      }
    }

    const [programToDelete] = plannedProgram.length > 0 ? plannedProgram : await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgramTable.id, id),
          isNull(exerciseProgramTable.userId)
        )
      );

    if (!programToDelete) return false;

    // Delete the planned exercise program (dates will be deleted via foreign key cascade)
    await db
      .delete(plannedExerciseProgramTable)
      .where(eq(plannedExerciseProgramTable.id, id));

    return true;
  },

  // Create a new planned exercise program date
  createDate: async (dateData: CreatePlannedExerciseProgramDate) => {
    // Verify that the planned exercise program exists and user has access to the parent exercise program
    const plannedProgram = await db
      .select({
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgramTable)
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(eq(plannedExerciseProgramTable.id, dateData.plannedExerciseProgramId));

    if (plannedProgram.length === 0) {
      throw new Error("Planned program not found");
    }

    // Create the planned date
    const [newDate] = await db
      .insert(plannedExerciseProgram_DateTable)
      .values({
        ...(dateData.id !== null && dateData.id !== undefined
          ? { id: dateData.id }
          : {}),
        plannedExerciseProgramId: dateData.plannedExerciseProgramId,
        date: new Date(dateData.date),
      })
      .returning();

    return newDate;
  },

  // Update an existing planned exercise program date
  updateDate: async (id: number, userId: number, dateData: UpdatePlannedExerciseProgramDate) => {
    // Check if the date exists and belongs to a program the user has access to
    const existingDate = await db
      .select({
        date: plannedExerciseProgram_DateTable,
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgram_DateTable)
      .innerJoin(plannedExerciseProgramTable, eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, plannedExerciseProgramTable.id))
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgram_DateTable.id, id),
          or(
            eq(exerciseProgramTable.userId, userId), // User's own programs
            isNull(exerciseProgramTable.userId)      // System programs
          )
        )
      );

    if (existingDate.length === 0) {
      return null;
    }

    // Update the planned date
    const [updatedDate] = await db
      .update(plannedExerciseProgram_DateTable)
      .set({
        date: dateData.date ? new Date(dateData.date) : existingDate[0].date.date,
      })
      .where(eq(plannedExerciseProgram_DateTable.id, id))
      .returning();

    return updatedDate;
  },

  // Delete a planned exercise program date
  deleteDate: async (id: number, userId: number) => {
    // Check if the date exists and belongs to a program the user has access to
    const existingDate = await db
      .select({
        date: plannedExerciseProgram_DateTable,
        planned: plannedExerciseProgramTable,
        program: exerciseProgramTable,
      })
      .from(plannedExerciseProgram_DateTable)
      .innerJoin(plannedExerciseProgramTable, eq(plannedExerciseProgram_DateTable.plannedExerciseProgramId, plannedExerciseProgramTable.id))
      .innerJoin(exerciseProgramTable, eq(plannedExerciseProgramTable.programId, exerciseProgramTable.id))
      .where(
        and(
          eq(plannedExerciseProgram_DateTable.id, id),
          or(
            eq(exerciseProgramTable.userId, userId), // User's own programs
            isNull(exerciseProgramTable.userId)      // System programs
          )
        )
      );

    if (existingDate.length === 0) {
      return false;
    }

    // Delete the planned date
    await db
      .delete(plannedExerciseProgram_DateTable)
      .where(eq(plannedExerciseProgram_DateTable.id, id));

    return true;
  },
};

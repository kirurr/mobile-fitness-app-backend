import { z } from "zod";
import { 
  userCompletedExerciseTable,
  exerciseTable,
  exerciseProgram_ExerciseTable
} from "../db/schema";
import { createSelectSchema } from "drizzle-zod";

// Base schema for user completed exercise
export const userCompletedExerciseSchema = createSelectSchema(userCompletedExerciseTable);

export type UserCompletedExercise = z.infer<typeof userCompletedExerciseSchema>;

// Extended schema with joined exercise details
export const userCompletedExerciseWithDetailsSchema = createSelectSchema(userCompletedExerciseTable).extend({
  exercise: createSelectSchema(exerciseTable).optional().nullable(),
  programExercise: createSelectSchema(exerciseProgram_ExerciseTable).optional().nullable(),
});

export type UserCompletedExerciseWithDetails = z.infer<typeof userCompletedExerciseWithDetailsSchema>;

// Schema for creating user completed exercise
export const createUserCompletedExerciseSchema = z.object({
  completedProgramId: z.number(),
  programExerciseId: z.number().optional().nullable(),
  exerciseId: z.number().optional().nullable(),
  sets: z.number().default(1),
  reps: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  restDuration: z.number().optional().nullable(),
});

export type CreateUserCompletedExercise = z.infer<typeof createUserCompletedExerciseSchema>;

// Schema for updating user completed exercise
export const updateUserCompletedExerciseSchema = z.object({
  programExerciseId: z.number().optional().nullable(),
  exerciseId: z.number().optional().nullable(),
  sets: z.number().optional().nullable(),
  reps: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  restDuration: z.number().optional().nullable(),
}).partial();

export type UpdateUserCompletedExercise = z.infer<typeof updateUserCompletedExerciseSchema>;
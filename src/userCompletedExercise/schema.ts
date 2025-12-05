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
  exercise: createSelectSchema(exerciseTable).optional(),
  programExercise: createSelectSchema(exerciseProgram_ExerciseTable).optional(),
});

export type UserCompletedExerciseWithDetails = z.infer<typeof userCompletedExerciseWithDetailsSchema>;

// Schema for creating user completed exercise
export const createUserCompletedExerciseSchema = z.object({
  completedProgramId: z.number(),
  programExerciseId: z.number().optional().nullable(),
  exerciseId: z.number().optional().nullable(),
  sets: z.number().default(1),
  reps: z.number().optional(),
  duration: z.number().optional(),
  weight: z.number().optional(),
  restDuration: z.number().optional(),
});

export type CreateUserCompletedExercise = z.infer<typeof createUserCompletedExerciseSchema>;

// Schema for updating user completed exercise
export const updateUserCompletedExerciseSchema = z.object({
  programExerciseId: z.number().optional().nullable(),
  exerciseId: z.number().optional().nullable(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  duration: z.number().optional(),
  weight: z.number().optional(),
  restDuration: z.number().optional(),
}).partial();

export type UpdateUserCompletedExercise = z.infer<typeof updateUserCompletedExerciseSchema>;
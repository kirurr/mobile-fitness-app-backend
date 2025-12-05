import { z } from "zod";
import { 
  userCompletedProgramTable,
  userCompletedExerciseTable,
  exerciseTable,
  exerciseProgram_ExerciseTable
} from "../db/schema";
import { createSelectSchema } from "drizzle-zod";

// Base schema for user completed program
export const userCompletedProgramSchema = createSelectSchema(userCompletedProgramTable);

// Extended schema with joined completed exercises
export type UserCompletedProgram = z.infer<typeof userCompletedProgramSchema>;

// Schema for completed exercise in program
export const userCompletedExerciseSchema = createSelectSchema(userCompletedExerciseTable).extend({
  exercise: createSelectSchema(exerciseTable).optional(),
  programExercise: createSelectSchema(exerciseProgram_ExerciseTable).optional(),
});

export type UserCompletedExercise = z.infer<typeof userCompletedExerciseSchema>;

// Schema for user completed program with exercises
export const userCompletedProgramWithExercisesSchema = userCompletedProgramSchema.extend({
  completedExercises: z.array(userCompletedExerciseSchema),
});

export type UserCompletedProgramWithExercises = z.infer<typeof userCompletedProgramWithExercisesSchema>;

// Schema for creating user completed program
export const createUserCompletedProgramSchema = z.object({
  userId: z.number(),
  programId: z.number(),
  startDate: z.string().datetime().optional(), // ISO string
  endDate: z.string().datetime().optional().nullable(), // ISO string or null
});

export type CreateUserCompletedProgram = z.infer<typeof createUserCompletedProgramSchema>;

// Schema for updating user completed program
export const updateUserCompletedProgramSchema = z.object({
  userId: z.number().optional(),
  programId: z.number().optional(),
  startDate: z.string().datetime().optional(), // ISO string
  endDate: z.string().datetime().optional().nullable(), // ISO string or null
}).partial();

export type UpdateUserCompletedProgram = z.infer<typeof updateUserCompletedProgramSchema>;

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

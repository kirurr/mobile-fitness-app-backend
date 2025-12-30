import { z } from "zod";
import {
  exerciseProgramTable,
  exerciseProgram_ExerciseTable,
  exerciseTable,
  fitnessGoalTable,
  difficultyLevelTable,
  subscriptionTable
} from "../db/schema";
import { createSelectSchema } from "drizzle-zod";

const exerciseProgramExerciseSchema = createSelectSchema(exerciseProgram_ExerciseTable);
const difficultyLevelSchema = createSelectSchema(difficultyLevelTable);
const subscriptionSchema = createSelectSchema(subscriptionTable);

// Base schema for exercise program (excluding user data)
export const exerciseProgramSchema = createSelectSchema(exerciseProgramTable);

// Extended schema with joined data
export type ExerciseProgram = z.infer<typeof exerciseProgramSchema>;

// Schema for exercise in program with additional details from join table
export const exerciseInProgramSchema = createSelectSchema(exerciseTable).extend({
  programExercise: exerciseProgramExerciseSchema,
});

export type ExerciseInProgram = z.infer<typeof exerciseInProgramSchema>;

// Schema for program with exercises and fitness goals
export const exerciseProgramWithDetailsSchema = exerciseProgramSchema.extend({
  difficultyLevel: difficultyLevelSchema,
  subscription: subscriptionSchema,
  exercises: z.array(exerciseInProgramSchema),
  fitnessGoals: z.array(createSelectSchema(fitnessGoalTable)),
});

export type ExerciseProgramWithDetails = z.infer<typeof exerciseProgramWithDetailsSchema>;

export const exerciseProgramWithExercisesSchema = exerciseProgramSchema.extend({
  exercises: z.array(exerciseInProgramSchema),
  fitnessGoals: z.array(createSelectSchema(fitnessGoalTable)),
});

export type ExerciseProgramWithExercises = z.infer<typeof exerciseProgramWithExercisesSchema>;

// Schema for query parameters for filtering
export const exerciseProgramFilterSchema = z.object({
  difficultyLevelId: z.string().optional().nullable(),
  subscriptionId: z.string().optional().nullable(),
  fitnessGoalId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(), // If provided, only return programs for this user
}).partial();

export type ExerciseProgramFilter = z.infer<typeof exerciseProgramFilterSchema>;

// Schema for creating exercise program
export const createExerciseProgramSchema = z.object({
  id: z.number().optional().nullable(),
  isUserAdded: z.boolean().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  difficultyLevelId: z.number(),
  subscriptionId: z.number().nullable().optional().nullable(), // Can be null for system programs
  userId: z.number().nullable().optional().nullable(), // Can be null for system programs
  fitnessGoalIds: z.array(z.number()).optional().nullable().default([]),
  exerciseIds: z.array(z.object({
		id: z.number().optional().nullable(),
    exerciseId: z.number(),
    order: z.number().optional().nullable(),
    sets: z.number(),
    reps: z.number().optional().nullable(),
    duration: z.number().optional().nullable(),
    restDuration: z.number(),
  })).optional().nullable().default([]),
});

export type CreateExerciseProgram = z.infer<typeof createExerciseProgramSchema>;

// Schema for updating exercise program
export const updateExerciseProgramSchema = z.object({
  isUserAdded: z.boolean().optional(),
  name: z.string().min(1).optional().nullable(),
  description: z.string().min(1).optional().nullable(),
  difficultyLevelId: z.number().optional().nullable(),
  subscriptionId: z.number().optional().nullable(),
  userId: z.number().nullable().optional().nullable(), // Can be null for system programs
  fitnessGoalIds: z.array(z.number()).optional().nullable(),
  exerciseIds: z.array(z.object({
    id: z.number().optional().nullable(),
    exerciseId: z.number(),
    order: z.number(),
    sets: z.number(),
    reps: z.number().optional().nullable(),
    duration: z.number().optional().nullable(),
    restDuration: z.number(),
  })).optional().nullable(),
}).partial(); // All fields are optional for updates

export type UpdateExerciseProgram = z.infer<typeof updateExerciseProgramSchema>;

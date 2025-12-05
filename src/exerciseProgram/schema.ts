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

// Base schema for exercise program (excluding user data)
export const exerciseProgramSchema = createSelectSchema(exerciseProgramTable);

// Extended schema with joined data
export type ExerciseProgram = z.infer<typeof exerciseProgramSchema>;

// Schema for exercise in program with additional details from join table
export const exerciseInProgramSchema = createSelectSchema(exerciseTable).extend({
  programExercise: exerciseProgram_ExerciseTable.$inferSelect,
});

export type ExerciseInProgram = z.infer<typeof exerciseInProgramSchema>;

// Schema for program with exercises and fitness goals
export const exerciseProgramWithDetailsSchema = exerciseProgramSchema.extend({
  difficultyLevel: difficultyLevelTable.$inferSelect,
  subscription: subscriptionTable.$inferSelect,
  exercises: z.array(exerciseInProgramSchema),
  fitnessGoals: z.array(createSelectSchema(fitnessGoalTable)),
});

export type ExerciseProgramWithDetails = z.infer<typeof exerciseProgramWithDetailsSchema>;

// Schema for query parameters for filtering
export const exerciseProgramFilterSchema = z.object({
  difficultyLevelId: z.string().optional(),
  subscriptionId: z.string().optional(),
  fitnessGoalId: z.string().optional(),
  userId: z.string().optional(), // If provided, only return programs for this user
}).partial();

export type ExerciseProgramFilter = z.infer<typeof exerciseProgramFilterSchema>;

// Schema for creating exercise program
export const createExerciseProgramSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  difficultyLevelId: z.number(),
  subscriptionId: z.number().nullable().optional(), // Can be null for system programs
  userId: z.number().nullable().optional(), // Can be null for system programs
  fitnessGoalIds: z.array(z.number()).optional().default([]),
  exerciseIds: z.array(z.object({
    exerciseId: z.number(),
    order: z.number().optional(),
    sets: z.number(),
    reps: z.number().optional(),
    duration: z.number().optional(),
    restDuration: z.number(),
  })).optional().default([]),
});

export type CreateExerciseProgram = z.infer<typeof createExerciseProgramSchema>;

// Schema for updating exercise program
export const updateExerciseProgramSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  difficultyLevelId: z.number().optional(),
  subscriptionId: z.number().optional(),
  userId: z.number().nullable().optional(), // Can be null for system programs
  fitnessGoalIds: z.array(z.number()).optional(),
  exerciseIds: z.array(z.object({
    exerciseId: z.number(),
    order: z.number(),
    sets: z.number(),
    reps: z.number().optional(),
    duration: z.number().optional(),
    restDuration: z.number(),
  })).optional(),
}).partial(); // All fields are optional for updates

export type UpdateExerciseProgram = z.infer<typeof updateExerciseProgramSchema>;

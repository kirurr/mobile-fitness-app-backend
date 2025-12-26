import { z } from "zod";
import { 
  plannedExerciseProgramTable,
  plannedExerciseProgram_DateTable
} from "../db/schema";
import { createSelectSchema } from "drizzle-zod";

// Base schema for planned exercise program
export const plannedExerciseProgramSchema = createSelectSchema(plannedExerciseProgramTable);

export type PlannedExerciseProgram = z.infer<typeof plannedExerciseProgramSchema>;

// Schema for planned exercise program date
export const plannedExerciseProgramDateSchema = createSelectSchema(plannedExerciseProgram_DateTable);

export type PlannedExerciseProgramDate = z.infer<typeof plannedExerciseProgramDateSchema>;

export const plannedExerciseProgramDateOpenApiSchema = plannedExerciseProgramDateSchema.extend({
  date: z.string().datetime(),
});

// Extended schema with dates
export const plannedExerciseProgramWithDatesSchema = plannedExerciseProgramSchema.extend({
  dates: z.array(plannedExerciseProgramDateSchema),
});

export type PlannedExerciseProgramWithDates = z.infer<typeof plannedExerciseProgramWithDatesSchema>;

export const plannedExerciseProgramWithDatesOpenApiSchema = plannedExerciseProgramSchema.extend({
  dates: z.array(plannedExerciseProgramDateOpenApiSchema),
});

// Schema for creating planned exercise program
export const createPlannedExerciseProgramSchema = z.object({
  programId: z.number(),
  dates: z.array(z.string().datetime()).optional().nullable().default([]), // Array of ISO date strings
});

export type CreatePlannedExerciseProgram = z.infer<typeof createPlannedExerciseProgramSchema>;

// Schema for updating planned exercise program
export const updatePlannedExerciseProgramSchema = z.object({
  programId: z.number().optional().nullable(),
  dates: z.array(z.string().datetime()).optional().nullable(), // Array of ISO date strings for new dates
}).partial();

export type UpdatePlannedExerciseProgram = z.infer<typeof updatePlannedExerciseProgramSchema>;

// Schema for creating planned exercise program date
export const createPlannedExerciseProgramDateSchema = z.object({
  plannedExerciseProgramId: z.number(),
  date: z.string().datetime(), // ISO date string
});

export type CreatePlannedExerciseProgramDate = z.infer<typeof createPlannedExerciseProgramDateSchema>;

// Schema for updating planned exercise program date
export const updatePlannedExerciseProgramDateSchema = z.object({
  date: z.string().datetime(), // ISO date string
}).partial();

export type UpdatePlannedExerciseProgramDate = z.infer<typeof updatePlannedExerciseProgramDateSchema>;

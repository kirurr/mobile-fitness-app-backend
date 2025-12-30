import { sql } from "drizzle-orm";
import { bigint, boolean, check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  email: text().notNull(),
  passwordHash: text().notNull(),
});

export const userDataTable = pgTable("user_data", {
  userId: bigint({ mode: "number" })
    .notNull()
    .primaryKey()
    .references(() => userTable.id),
  name: text().notNull(),
  age: integer().notNull(),
  weight: integer().notNull(),
  height: integer().notNull(),
  fitnessGoalId: bigint({ mode: "number" })
    .notNull()
    .references(() => fitnessGoalTable.id),
  trainingLevel: bigint({ mode: "number" })
    .notNull()
    .references(() => difficultyLevelTable.id),
});

export const fitnessGoalTable = pgTable("fitness_goal", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
});

export const difficultyLevelTable = pgTable("difficulty_level", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  description: text().notNull(),
});

export const subscriptionTable = pgTable("subscription", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  monthlyCost: integer().notNull(),
});

export const userPaymentTable = pgTable("user_payment", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint({ mode: "number" })
    .notNull()
    .references(() => userTable.id),
  createdAt: timestamp().notNull().defaultNow(),
  amount: integer().notNull(),
});

export const userSubscriptionTable = pgTable("user_subscription", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint({ mode: "number" })
    .notNull()
    .references(() => userTable.id),
  subscriptionId: bigint({ mode: "number" }).references(() => subscriptionTable.id),
  startDate: timestamp().notNull().defaultNow(),
  endDate: timestamp().notNull(),
});

export const exerciseCategoryTable = pgTable("exercise_category", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  description: text().notNull(),
});

export const muscleGroupTable = pgTable("muscle_group", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
});

export const exerciseTypeEnum = ["reps", "timed"] as const;

export const exerciseTable = pgTable("exercise", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  categoryId: bigint({ mode: "number" })
    .notNull()
    .references(() => exerciseCategoryTable.id),
  muscleGroupId: bigint({ mode: "number" })
    .notNull()
    .references(() => muscleGroupTable.id),
  difficultyLevelId: bigint({ mode: "number" })
    .notNull()
    .references(() => difficultyLevelTable.id),
  type: text({ enum: exerciseTypeEnum }).notNull(),
});

export const exerciseProgramTable = pgTable("exercise_program", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint({ mode: "number" }),
  isUserAdded: boolean().notNull().default(false),
  name: text().notNull(),
  description: text().notNull(),
  difficultyLevelId: bigint({ mode: "number" })
    .notNull()
    .references(() => difficultyLevelTable.id),
  subscriptionId: bigint({ mode: "number" }).references(() => subscriptionTable.id),
});

export const exerciseProgram_FitnessGoalTable = pgTable(
  "exercise_program_fitness_goal",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    programId: bigint({ mode: "number" })
      .notNull()
      .references(() => exerciseProgramTable.id),
    fitnessGoalId: bigint({ mode: "number" })
      .notNull()
      .references(() => fitnessGoalTable.id),
  },
);

export const exerciseProgram_ExerciseTable = pgTable(
  "exercise_program_exercise",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    programId: bigint({ mode: "number" })
      .notNull()
      .references(() => exerciseProgramTable.id),
    exerciseId: bigint({ mode: "number" })
      .notNull()
      .references(() => exerciseTable.id),
    order: integer().notNull().default(1),
    sets: integer().notNull(),
    reps: integer(),
    duration: integer(),
    restDuration: integer().notNull(),
  },
  (table) => [
    check(
      "reps_or_duration_check",
      sql`(${table.reps} IS NOT NULL OR ${table.duration} IS NOT NULL)`,
    ),
  ],
);

export const userCompletedProgramTable = pgTable("user_completed_program", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint({ mode: "number" })
    .notNull()
    .references(() => userTable.id),
  programId: bigint({ mode: "number" })
    .notNull()
    .references(() => exerciseProgramTable.id),
  startDate: timestamp().notNull().defaultNow(),
  endDate: timestamp(),
});

export const userCompletedExerciseTable = pgTable(
  "user_completed_exercise",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    completedProgramId: bigint({ mode: "number" })
      .notNull()
      .references(() => userCompletedProgramTable.id),
    programExerciseId: bigint({ mode: "number" }).references(
      () => exerciseProgram_ExerciseTable.id,
    ),
    exerciseId: bigint({ mode: "number" }).references(() => exerciseTable.id),
    sets: integer().notNull().default(1),
    reps: integer(),
    duration: integer(),
    weight: integer(),
    restDuration: integer(),
  },
  (table) => [
    check(
      "program_exercise_or_exercise_check",
      sql`(${table.programExerciseId} IS NOT NULL OR ${table.exerciseId} IS NOT NULL)`,
    ),
    check(
      "reps_or_duration_check",
      sql`(${table.reps} IS NOT NULL OR ${table.duration} IS NOT NULL)`,
    ),
  ],
);

export const plannedExerciseProgramTable = pgTable("planned_exercise_program", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  programId: bigint({ mode: "number" })
    .notNull()
    .references(() => exerciseProgramTable.id),
});
export const plannedExerciseProgram_DateTable = pgTable(
  "planned_exercise_program_date",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    plannedExerciseProgramId: bigint({ mode: "number" })
      .notNull()
      .references(() => plannedExerciseProgramTable.id),
    date: timestamp().notNull(),
  },
);

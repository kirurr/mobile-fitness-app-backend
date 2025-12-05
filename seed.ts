import "dotenv/config";
import { db } from "./src/db/drizzle";
import type { InferSelectModel } from "drizzle-orm";
import {
  difficultyLevelTable,
  fitnessGoalTable,
  muscleGroupTable,
  subscriptionTable,
  exerciseCategoryTable,
  exerciseTable,
  exerciseProgramTable,
  exerciseProgram_FitnessGoalTable,
  exerciseProgram_ExerciseTable,
} from "./src/db/schema";

async function seedDifficultyLevels() {
  const difficultyLevels: Array<InferSelectModel<typeof difficultyLevelTable>> =
    [
      {
        id: 1,
        name: "Beginner",
        description:
          "Suitable for newcomers. Low intensity, simple movements, and basic technique focus.",
      },
      {
        id: 2,
        name: "Intermediate",
        description:
          "Moderate intensity with more complex exercises. Requires foundational strength and coordination.",
      },
      {
        id: 3,
        name: "Advanced",
        description:
          "High-intensity workouts with challenging movements. Demands good technique and endurance.",
      },
      {
        id: 4,
        name: "Expert",
        description:
          "Very demanding routines designed for experienced athletes. Includes complex compound exercises and advanced progressions.",
      },
      {
        id: 5,
        name: "Master",
        description:
          "Extremely intense and technical training. Focused on peak performance, maximal strength, and discipline-heavy routines.",
      },
    ];

  console.log("Seeding difficulty levels...");
  console.table(difficultyLevels);
  await db
    .insert(difficultyLevelTable)
    .values(difficultyLevels)
    .onConflictDoNothing();
  console.log("Seeding difficulty levels complete.");
}

async function seedFitnessGoals() {
  const fitnessGoals: Array<InferSelectModel<typeof fitnessGoalTable>> = [
    {
      id: 1,
      name: "Weight loss",
    },
    {
      id: 2,
      name: "Muscle gain",
    },
    {
      id: 3,
      name: "Flexibility",
    },
    {
      id: 4,
      name: "Strength training",
    },
    {
      id: 5,
      name: "Endurance",
    },
  ];

  console.log("Seeding fitness goals...");
  console.table(fitnessGoals);
  await db.insert(fitnessGoalTable).values(fitnessGoals).onConflictDoNothing();
  console.log("Seeding fitness goals complete.");
}

async function seedMuscleGroups() {
  const muscleGroups: Array<InferSelectModel<typeof muscleGroupTable>> = [
    { id: 1, name: "Chest" },
    { id: 2, name: "Back" },
    { id: 3, name: "Legs" },
    { id: 4, name: "Shoulders" },
    { id: 5, name: "Core" },
  ];
  console.log("Seeding muscle groups...");
  console.table(muscleGroups);
  await db.insert(muscleGroupTable).values(muscleGroups).onConflictDoNothing();
  console.log("Seeding muscle groups complete.");
}

async function seedSubscriptions() {
  const subscriptions = [
    {
      id: 1,
      name: "Premium",
      monthlyCost: 1999, // $19.99 in cents
    },
    {
      id: 2,
      name: "Basic",
      monthlyCost: 999, // $9.99 in cents
    },
  ];
  
  console.log("Seeding subscriptions...");
  console.table(subscriptions);
  await db.insert(subscriptionTable).values(subscriptions).onConflictDoNothing();
  console.log("Seeding subscriptions complete.");
}

async function seedExerciseCategories() {
  const exerciseCategories = [
    {
      id: 1,
      name: "Strength",
      description: "Resistance exercises to build muscle strength"
    },
    {
      id: 2,
      name: "Cardio",
      description: "Cardiovascular exercises to improve heart health"
    },
    {
      id: 3,
      name: "Flexibility",
      description: "Exercises to improve flexibility and mobility"
    },
    {
      id: 4,
      name: "Balance",
      description: "Exercises to improve balance and stability"
    }
  ];
  
  console.log("Seeding exercise categories...");
  console.table(exerciseCategories);
  await db.insert(exerciseCategoryTable).values(exerciseCategories).onConflictDoNothing();
  console.log("Seeding exercise categories complete.");
}

async function seedExercises() {
  const exercises = [
    {
      id: 1,
      name: "Push-up",
      categoryId: 1, // Strength
      muscleGroupId: 1, // Chest
      difficultyLevelId: 2, // Intermediate
      type: "reps" as const
    },
    {
      id: 2,
      name: "Squat",
      categoryId: 1, // Strength
      muscleGroupId: 3, // Legs
      difficultyLevelId: 1, // Beginner
      type: "reps" as const
    },
    {
      id: 3,
      name: "Plank",
      categoryId: 1, // Strength
      muscleGroupId: 5, // Core
      difficultyLevelId: 2, // Intermediate
      type: "timed" as const
    },
    {
      id: 4,
      name: "Running",
      categoryId: 2, // Cardio
      muscleGroupId: 3, // Legs
      difficultyLevelId: 1, // Beginner
      type: "timed" as const
    },
    {
      id: 5,
      name: "Yoga Stretch",
      categoryId: 3, // Flexibility
      muscleGroupId: 5, // Core
      difficultyLevelId: 1, // Beginner
      type: "timed" as const
    }
  ];
  
  console.log("Seeding exercises...");
  console.table(exercises);
  await db.insert(exerciseTable).values(exercises).onConflictDoNothing();
  console.log("Seeding exercises complete.");
}

async function seedExercisePrograms() {
  // Seed system programs (userId = null for system programs)
  const systemPrograms = [
    {
      id: 1,
      name: "Beginner Full Body Workout",
      description: "A complete full body workout for beginners",
      difficultyLevelId: 1, // Beginner
      subscriptionId: null, // Free
      userId: null // System program
    },
    {
      id: 2,
      name: "Premium Strength Training",
      description: "Advanced strength training program for premium subscribers",
      difficultyLevelId: 3, // Advanced
      subscriptionId: 1, // Premium
      userId: null // System program
    }
  ];
  
  console.log("Seeding system exercise programs...");
  console.table(systemPrograms);
  await db.insert(exerciseProgramTable).values(systemPrograms).onConflictDoNothing();
  console.log("Seeding system exercise programs complete.");
  
  // Seed fitness goals for programs
  const programFitnessGoals = [
    { id: 1, programId: 1, fitnessGoalId: 1 }, // Beginner Full Body - Weight loss
    { id: 2, programId: 1, fitnessGoalId: 4 }, // Beginner Full Body - Strength training
    { id: 3, programId: 2, fitnessGoalId: 2 }, // Premium Strength - Muscle gain
    { id: 4, programId: 2, fitnessGoalId: 4 }, // Premium Strength - Strength training
  ];
  
  console.log("Seeding program fitness goals...");
  console.table(programFitnessGoals);
  await db.insert(exerciseProgram_FitnessGoalTable).values(programFitnessGoals).onConflictDoNothing();
  console.log("Seeding program fitness goals complete.");
  
  // Seed exercises for programs
  const programExercises = [
    { id: 1, programId: 1, exerciseId: 1, order: 1, sets: 3, reps: 10, restDuration: 60 }, // Push-up
    { id: 2, programId: 1, exerciseId: 2, order: 2, sets: 3, reps: 15, restDuration: 60 }, // Squat
    { id: 3, programId: 1, exerciseId: 3, order: 3, sets: 3, duration: 30, restDuration: 45 }, // Plank
    { id: 4, programId: 2, exerciseId: 1, order: 1, sets: 4, reps: 12, restDuration: 90 }, // Push-up
    { id: 5, programId: 2, exerciseId: 3, order: 2, sets: 4, duration: 45, restDuration: 60 }, // Plank
    { id: 6, programId: 2, exerciseId: 5, order: 3, sets: 3, duration: 60, restDuration: 30 }, // Yoga Stretch
  ];
  
  console.log("Seeding program exercises...");
  console.table(programExercises);
  await db.insert(exerciseProgram_ExerciseTable).values(programExercises).onConflictDoNothing();
  console.log("Seeding program exercises complete.");
}

async function main() {
  await seedDifficultyLevels();
  await seedFitnessGoals();
  await seedMuscleGroups();
  await seedSubscriptions();
  await seedExerciseCategories();
  await seedExercises();
  await seedExercisePrograms();
}

main();

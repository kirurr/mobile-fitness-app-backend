import "dotenv/config";
import { db } from "./src/db/drizzle";
import type { InferSelectModel } from "drizzle-orm";
import {
  difficultyLevelTable,
  fitnessGoalTable,
  muscleGroupTable,
} from "./src/db/schema";

async function seedDificultyLevels() {
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

async function main() {
  await seedDificultyLevels();
  await seedFitnessGoals();
  await seedMuscleGroups();
}

main();

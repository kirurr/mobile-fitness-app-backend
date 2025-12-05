import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt";
import { userCompletedExerciseService } from "./service";
import { 
  createUserCompletedExerciseSchema, 
  updateUserCompletedExerciseSchema 
} from "./schema";

export const userCompletedExerciseRouter = new Hono();

// GET /user-completed-exercise - Get all completed exercises for a specific program
userCompletedExerciseRouter.get("/", jwtMiddleware, async (c) => {
  try {
    // Get query parameter for program ID
    const completedProgramId = Number(c.req.query("completedProgramId"));
    if (!completedProgramId || isNaN(completedProgramId)) {
      return c.json({ error: "completedProgramId query parameter is required" }, 400);
    }
    
    const userId = c.var.user.id;
    const completedExercises = await userCompletedExerciseService.getAllByProgram(completedProgramId, userId);
    if (completedExercises === null) {
      return c.json({ error: "Completed program not found or access denied" }, 404);
    }
    
    return c.json(completedExercises);
  } catch (error) {
    console.error("Error getting user completed exercises:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /user-completed-exercise/:id - Get a specific completed exercise
userCompletedExerciseRouter.get("/:id", jwtMiddleware, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid exercise ID" }, 400);
    }
    
    const userId = c.var.user.id;
    const completedExercise = await userCompletedExerciseService.getById(id, userId);
    if (!completedExercise) {
      return c.json({ error: "Completed exercise not found or access denied" }, 404);
    }
    
    return c.json(completedExercise);
  } catch (error) {
    console.error("Error getting user completed exercise by ID:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /user-completed-exercise - Create a new user completed exercise
userCompletedExerciseRouter.post("/", jwtMiddleware, zValidator("json", createUserCompletedExerciseSchema), async (c) => {
  try {
    const userId = c.var.user.id;
    const exerciseData = c.req.valid("json");

    // Verify that the completed program belongs to the user by checking in the service
    // The service will handle the validation
    const completedExercise = await userCompletedExerciseService.create({ ...exerciseData, userId: userId });
    return c.json(completedExercise, 201);
  } catch (error) {
    console.error("Error creating user completed exercise:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request body", details: error.issues }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// PUT /user-completed-exercise/:id - Update an existing user completed exercise
userCompletedExerciseRouter.put("/:id", jwtMiddleware, zValidator("json", updateUserCompletedExerciseSchema), async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid exercise ID" }, 400);
    }
    
    const userId = c.var.user.id;
    const exerciseData = c.req.valid("json");
    
    const updatedExercise = await userCompletedExerciseService.update(id, userId, exerciseData);
    if (!updatedExercise) {
      return c.json({ error: "Completed exercise not found or access denied" }, 404);
    }
    
    return c.json(updatedExercise);
  } catch (error) {
    console.error("Error updating user completed exercise:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request body", details: error.issues }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /user-completed-exercise/:id - Delete a user completed exercise
userCompletedExerciseRouter.delete("/:id", jwtMiddleware, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid exercise ID" }, 400);
    }
    
    const userId = c.var.user.id;
    const deleted = await userCompletedExerciseService.delete(id, userId);
    if (!deleted) {
      return c.json({ error: "Completed exercise not found or access denied" }, 404);
    }
    
    return c.json({ message: "Completed exercise deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting user completed exercise:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

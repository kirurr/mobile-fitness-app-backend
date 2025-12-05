import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt";
import { exerciseProgramService } from "./service";
import { exerciseProgramFilterSchema, createExerciseProgramSchema, updateExerciseProgramSchema } from "./schema";

export const exerciseProgramRouter = new Hono();

// GET /exercise-program - Get all exercise programs with optional filtering
exerciseProgramRouter.get(
  "/",
  jwtMiddleware,
  zValidator("query", exerciseProgramFilterSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid query parameters" }, 400);
    }
  }),
  async (c) => {
    const userId = c.var.user.id;

    try {
      const filters = exerciseProgramFilterSchema.parse(c.req.query());

      const programs = await exerciseProgramService.getAll(userId, filters);
      return c.json(programs);
    } catch (error) {
      console.error("Error getting exercise programs:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// GET /exercise-program/:id - Get exercise program by ID
exerciseProgramRouter.get("/:id", jwtMiddleware, async (c) => {
  const userId = c.var.user.id;

  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid program ID" }, 400);
    }

    const program = await exerciseProgramService.getById(id, userId);
    if (!program) {
      return c.json(
        { error: "Exercise program not found or access denied" },
        404,
      );
    }

    return c.json(program);
  } catch (error) {
    console.error("Error getting exercise program by ID:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /exercise-program - Create a new exercise program
exerciseProgramRouter.post("/", jwtMiddleware, zValidator("json", createExerciseProgramSchema), async (c) => {
  const userId = c.var.user.id;
  try {
    const validatedData = c.req.valid("json");

    // Ensure user can only create programs for themselves (not system programs) unless they have special permissions
    // For now, we'll default to the current user's ID unless it's an admin operation
    const programForUser = validatedData.userId ?? userId;

    if (programForUser !== userId) {
      // User is trying to create a program for another user, which they're not allowed to do
      return c.json(
        { error: "Not authorized to create program for another user" },
        403,
      );
    }

    const newProgram = await exerciseProgramService.create({
      ...validatedData,
      userId: programForUser, // Use the validated user ID or current user ID
    });

    return c.json(newProgram, 201);
  } catch (error) {
    console.error("Error creating exercise program:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request body", details: error}, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// PUT /exercise-program/:id - Update an exercise program
exerciseProgramRouter.put("/:id", jwtMiddleware, zValidator("json", updateExerciseProgramSchema), async (c) => {
  const userId = c.var.user.id;
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid program ID" }, 400);
    }

    const validatedData = c.req.valid("json");

    const updatedProgram = await exerciseProgramService.update(
      id,
      userId,
      validatedData,
    );
    if (!updatedProgram) {
      return c.json(
        { error: "Exercise program not found or access denied" },
        404,
      );
    }

    return c.json(updatedProgram);
  } catch (error) {
    console.error("Error updating exercise program:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request body", details: error}, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /exercise-program/:id - Delete an exercise program
exerciseProgramRouter.delete("/:id", jwtMiddleware, async (c) => {
  const userId = c.var.user.id;
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid program ID" }, 400);
    }

    const deleted = await exerciseProgramService.delete(id, userId);
    if (!deleted) {
      return c.json(
        { error: "Exercise program not found or access denied" },
        404,
      );
    }

    return c.json({ message: "Exercise program deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting exercise program:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});


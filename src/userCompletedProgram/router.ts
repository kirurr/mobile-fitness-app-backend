import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt.js";
import { userCompletedProgramService } from "./service.js";
import { 
  createUserCompletedProgramSchema, 
  updateUserCompletedProgramSchema,
  userCompletedProgramWithExercisesOpenApiSchema,
} from "./schema.js";

export const userCompletedProgramRouter = new Hono();

const messageSchema = z.object({ message: z.string() });

// GET /user-completed-program - Get all user completed programs with exercises
userCompletedProgramRouter.get(
  "/",
  describeRoute({
    description: "Get all user completed programs with exercises",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(z.array(userCompletedProgramWithExercisesOpenApiSchema)),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const userId = c.var.user.id;
      const completedPrograms = await userCompletedProgramService.getAll(userId);
      return c.json(completedPrograms);
    } catch (error) {
      console.error("Error getting user completed programs:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// GET /user-completed-program/:id - Get a specific user completed program with exercises
userCompletedProgramRouter.get(
  "/:id",
  describeRoute({
    description: "Get a specific user completed program with exercises",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(userCompletedProgramWithExercisesOpenApiSchema),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ error: "Invalid program ID" }, 400);
      }
      
      const userId = c.var.user.id;
      const completedProgram = await userCompletedProgramService.getById(id, userId);
      if (!completedProgram) {
        return c.json({ error: "Completed program not found or access denied" }, 404);
      }
      
      return c.json(completedProgram);
    } catch (error) {
      console.error("Error getting user completed program by ID:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// POST /user-completed-program - Create a new user completed program
userCompletedProgramRouter.post(
  "/",
  describeRoute({
    description: "Create a new user completed program",
    responses: {
      201: {
        description: "Created",
        content: {
          "application/json": {
            schema: resolver(userCompletedProgramWithExercisesOpenApiSchema),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", createUserCompletedProgramSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    try {
      const userId = c.var.user.id;
      const programData = c.req.valid("json");
      
      // Override userId to ensure users can only create for themselves
      const completedProgram = await userCompletedProgramService.create({
        ...programData,
        userId: userId
      });
      
      return c.json(completedProgram, 201);
    } catch (error) {
      console.error("Error creating user completed program:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body", details: error}, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// PUT /user-completed-program/:id - Update an existing user completed program
userCompletedProgramRouter.put(
  "/:id",
  describeRoute({
    description: "Update an existing user completed program",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(userCompletedProgramWithExercisesOpenApiSchema),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", updateUserCompletedProgramSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ error: "Invalid program ID" }, 400);
      }
      
      const userId = c.var.user.id;
      const programData = c.req.valid("json");
      
      const updatedProgram = await userCompletedProgramService.update(id, userId, programData);
      if (!updatedProgram) {
        return c.json({ error: "Completed program not found or access denied" }, 404);
      }
      
      return c.json(updatedProgram);
    } catch (error) {
      console.error("Error updating user completed program:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body", details: error}, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// DELETE /user-completed-program/:id - Delete a user completed program
userCompletedProgramRouter.delete(
  "/:id",
  describeRoute({
    description: "Delete a user completed program",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(messageSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ error: "Invalid program ID" }, 400);
      }
      
      const userId = c.var.user.id;
      const deleted = await userCompletedProgramService.delete(id, userId);
      if (!deleted) {
        return c.json({ error: "Completed program not found or access denied" }, 404);
      }
      
      return c.json({ message: "Completed program deleted successfully" }, 200);
    } catch (error) {
      console.error("Error deleting user completed program:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

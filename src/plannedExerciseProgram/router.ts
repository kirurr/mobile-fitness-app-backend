import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt";
import { plannedExerciseProgramService } from "./service";
import {
  createPlannedExerciseProgramSchema,
  updatePlannedExerciseProgramSchema,
  createPlannedExerciseProgramDateSchema,
  updatePlannedExerciseProgramDateSchema,
  plannedExerciseProgramWithDatesOpenApiSchema,
  plannedExerciseProgramDateOpenApiSchema,
} from "./schema";

export const plannedExerciseProgramRouter = new Hono();

const messageSchema = z.object({ message: z.string() });

// GET /planned-exercise-program - Get all planned exercise programs with dates
plannedExerciseProgramRouter.get(
  "/",
  describeRoute({
    description: "Get all planned exercise programs with dates",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(z.array(plannedExerciseProgramWithDatesOpenApiSchema)),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const userId = c.var.user.id;
      const plannedPrograms = await plannedExerciseProgramService.getAll(userId);
      return c.json(plannedPrograms);
    } catch (error) {
      console.error("Error getting planned exercise programs:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// GET /planned-exercise-program/:id - Get a specific planned exercise program with dates
plannedExerciseProgramRouter.get(
  "/:id",
  describeRoute({
    description: "Get a specific planned exercise program with dates",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(plannedExerciseProgramWithDatesOpenApiSchema),
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
      const plannedProgram = await plannedExerciseProgramService.getById(id, userId);
      if (!plannedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }
      
      return c.json(plannedProgram);
    } catch (error) {
      console.error("Error getting planned exercise program by ID:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// POST /planned-exercise-program - Create a new planned exercise program
plannedExerciseProgramRouter.post(
  "/",
  describeRoute({
    description: "Create a new planned exercise program",
    responses: {
      201: {
        description: "Created",
        content: {
          "application/json": {
            schema: resolver(plannedExerciseProgramWithDatesOpenApiSchema),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", createPlannedExerciseProgramSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    try {
      const userId = c.var.user.id;
      const programData = c.req.valid("json");
      
      const plannedProgram = await plannedExerciseProgramService.create(programData, userId);
      return c.json(plannedProgram, 201);
    } catch (error) {
      console.error("Error creating planned exercise program:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body", details: error.issues }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// PUT /planned-exercise-program/:id - Update an existing planned exercise program
plannedExerciseProgramRouter.put(
  "/:id",
  describeRoute({
    description: "Update an existing planned exercise program",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(plannedExerciseProgramWithDatesOpenApiSchema),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", updatePlannedExerciseProgramSchema, (result, c) => {
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
      
      const updatedProgram = await plannedExerciseProgramService.update(id, userId, programData);
      if (!updatedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }
      
      return c.json(updatedProgram);
    } catch (error) {
      console.error("Error updating planned exercise program:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body", details: error.issues }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// DELETE /planned-exercise-program/:id - Delete a planned exercise program
plannedExerciseProgramRouter.delete(
  "/:id",
  describeRoute({
    description: "Delete a planned exercise program",
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
      const deleted = await plannedExerciseProgramService.delete(id, userId);
      if (!deleted) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }

      return c.json({ message: "Planned program deleted successfully" }, 200);
    } catch (error) {
      console.error("Error deleting planned exercise program:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Routes for planned exercise program dates
// GET /planned-exercise-program/:programId/dates - Get all dates for a planned exercise program
plannedExerciseProgramRouter.get(
  "/:programId/dates",
  describeRoute({
    description: "Get all dates for a planned exercise program",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(z.array(plannedExerciseProgramDateOpenApiSchema)),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const programId = Number(c.req.param("programId"));
      if (isNaN(programId)) {
        return c.json({ error: "Invalid program ID" }, 400);
      }

      const userId = c.var.user.id;

      // Verify access to the planned program
      const plannedProgram = await plannedExerciseProgramService.getById(programId, userId);
      if (!plannedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }

      // Return just the dates for this program
      return c.json(plannedProgram.dates);
    } catch (error) {
      console.error("Error getting planned program dates:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// POST /planned-exercise-program/:programId/dates - Add a date to a planned exercise program
plannedExerciseProgramRouter.post(
  "/:programId/dates",
  describeRoute({
    description: "Add a date to a planned exercise program",
    responses: {
      201: {
        description: "Created",
        content: {
          "application/json": { schema: resolver(plannedExerciseProgramDateOpenApiSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", createPlannedExerciseProgramDateSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    try {
      const programId = Number(c.req.param("programId"));
      if (isNaN(programId)) {
        return c.json({ error: "Invalid program ID" }, 400);
      }

      const userId = c.var.user.id;
      const dateData = c.req.valid("json");

      // Verify access to the planned program and check that the plannedExerciseProgramId in the payload matches the path parameter
      if (dateData.plannedExerciseProgramId !== programId) {
        return c.json({ error: "Program ID mismatch" }, 400);
      }

      const plannedProgram = await plannedExerciseProgramService.getById(programId, userId);
      if (!plannedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }

      const newDate = await plannedExerciseProgramService.createDate(dateData);
      return c.json(newDate, 201);
    } catch (error) {
      console.error("Error adding date to planned exercise program:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body", details: error.issues }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// GET /planned-exercise-program/:programId/dates/:dateId - Get a specific date for a planned exercise program
plannedExerciseProgramRouter.get(
  "/:programId/dates/:dateId",
  describeRoute({
    description: "Get a specific date for a planned exercise program",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(plannedExerciseProgramDateOpenApiSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const programId = Number(c.req.param("programId"));
      const dateId = Number(c.req.param("dateId"));
      if (isNaN(programId) || isNaN(dateId)) {
        return c.json({ error: "Invalid program ID or date ID" }, 400);
      }

      const userId = c.var.user.id;

      // Verify access to the planned program
      const plannedProgram = await plannedExerciseProgramService.getById(programId, userId);
      if (!plannedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }

      // Find the specific date in the program
      const plannedDate = plannedProgram.dates.find(d => d.id === dateId);
      if (!plannedDate) {
        return c.json({ error: "Planned date not found" }, 404);
      }

      return c.json(plannedDate);
    } catch (error) {
      console.error("Error getting specific planned program date:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// PUT /planned-exercise-program/:programId/dates/:dateId - Update a specific date
plannedExerciseProgramRouter.put(
  "/:programId/dates/:dateId",
  describeRoute({
    description: "Update a specific date in a planned exercise program",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(plannedExerciseProgramDateOpenApiSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("json", updatePlannedExerciseProgramDateSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    try {
      const programId = Number(c.req.param("programId"));
      const dateId = Number(c.req.param("dateId"));
      if (isNaN(programId) || isNaN(dateId)) {
        return c.json({ error: "Invalid program ID or date ID" }, 400);
      }

      const userId = c.var.user.id;
      const dateData = c.req.valid("json");

      // Verify access to the planned program
      const plannedProgram = await plannedExerciseProgramService.getById(programId, userId);
      if (!plannedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }

      const updatedDate = await plannedExerciseProgramService.updateDate(dateId, userId, dateData);
      if (!updatedDate) {
        return c.json({ error: "Planned date not found or access denied" }, 404);
      }

      return c.json(updatedDate);
    } catch (error) {
      console.error("Error updating planned program date:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body", details: error.issues }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// DELETE /planned-exercise-program/:programId/dates/:dateId - Delete a specific date
plannedExerciseProgramRouter.delete(
  "/:programId/dates/:dateId",
  describeRoute({
    description: "Delete a specific date from a planned exercise program",
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
      const programId = Number(c.req.param("programId"));
      const dateId = Number(c.req.param("dateId"));
      if (isNaN(programId) || isNaN(dateId)) {
        return c.json({ error: "Invalid program ID or date ID" }, 400);
      }

      const userId = c.var.user.id;

      // Verify access to the planned program
      const plannedProgram = await plannedExerciseProgramService.getById(programId, userId);
      if (!plannedProgram) {
        return c.json({ error: "Planned program not found or access denied" }, 404);
      }

      const deleted = await plannedExerciseProgramService.deleteDate(dateId, userId);
      if (!deleted) {
        return c.json({ error: "Planned date not found or access denied" }, 404);
      }

      return c.json({ message: "Planned date deleted successfully" }, 200);
    } catch (error) {
      console.error("Error deleting planned program date:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

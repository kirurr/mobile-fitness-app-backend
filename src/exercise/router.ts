import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt.js";
import { exerciseService } from "./service.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { exerciseFilterSchema, exerciseSchema } from "./schema.js";
import z from "zod";

const router = new Hono();

// GET /exercise - Get all exercises with optional filtering
router.get(
  "/",
  describeRoute({
    description: "Get all exercises with optional filtering",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(z.array(exerciseSchema)) },
        },
      },
    },
  }),
  jwtMiddleware,
  validator("query", exerciseFilterSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid query parameters" }, 400);
    }
  }),
  async (c) => {
    try {
      const filters = c.req.valid("query");
      const exercises = await exerciseService.getAll(filters);
      return c.json(exercises);
    } catch (error) {
      console.error("Error getting exercises:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// GET /exercise/:id - Get exercise by ID
router.get(
  "/:id",
  describeRoute({
    description: "Get exercise by ID",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(exerciseSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ error: "Invalid exercise ID" }, 400);
      }

      const exercise = await exerciseService.getById(id);
      if (!exercise) {
        return c.json({ error: "Exercise not found" }, 404);
      }

      return c.json(exercise);
    } catch (error) {
      console.error("Error getting exercise by ID:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export const exerciseRouter = router;

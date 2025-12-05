import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { jwtMiddleware } from "../middleware/jwt";
import { exerciseService } from "./service";
import { exerciseFilterSchema } from "./schema";

const router = new Hono();

// GET /exercise - Get all exercises with optional filtering
router.get("/", jwtMiddleware, zValidator(
  "query",
  exerciseFilterSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid query parameters" }, 400);
    }
  }
), async (c) => {
  try {
    const filters = exerciseFilterSchema.parse(c.req.query());
    const exercises = await exerciseService.getAll(filters);
    return c.json(exercises);
  } catch (error) {
    console.error("Error getting exercises:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /exercise/:id - Get exercise by ID
router.get("/:id", jwtMiddleware, async (c) => {
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
});

export const exerciseRouter = router;

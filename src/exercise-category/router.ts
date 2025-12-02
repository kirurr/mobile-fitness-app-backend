import { Hono } from "hono";
import { exerciseCategoryService } from "./service";

export const exerciseCategoryRouter = new Hono();

// Get all exercise categories
exerciseCategoryRouter.get("/", async (c) => {
  const exerciseCategories = await exerciseCategoryService.getAll();
  return c.json(exerciseCategories);
});

// Get exercise category by ID
exerciseCategoryRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const exerciseCategory = await exerciseCategoryService.getById(id);

  if (!exerciseCategory) {
    return c.json({ error: "Exercise category not found" }, 404);
  }

  return c.json(exerciseCategory);
});
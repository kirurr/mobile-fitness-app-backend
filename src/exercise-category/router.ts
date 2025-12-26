import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { exerciseCategoryService } from "./service";
import { jwtMiddleware } from "../middleware/jwt";
import { exerciseCategorySchema } from "./schema";

export const exerciseCategoryRouter = new Hono();

// Get all exercise categories
exerciseCategoryRouter.get(
  "/",
  describeRoute({
    description: "Get all exercise categories",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(exerciseCategorySchema.array()),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const exerciseCategories = await exerciseCategoryService.getAll();
    return c.json(exerciseCategories);
  },
);

// Get exercise category by ID
exerciseCategoryRouter.get(
  "/:id",
  describeRoute({
    description: "Get exercise category by ID",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(exerciseCategorySchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const id = Number(c.req.param("id"));

    const exerciseCategory = await exerciseCategoryService.getById(id);

    if (!exerciseCategory) {
      return c.json({ error: "Exercise category not found" }, 404);
    }

    return c.json(exerciseCategory);
  },
);

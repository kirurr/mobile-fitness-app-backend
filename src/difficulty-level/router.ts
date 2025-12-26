import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { jwtMiddleware } from "../middleware/jwt";
import { difficultyLevelService } from "./service";
import { difficultyLevelSchema } from "./schema";

export const difficultyLevelRouter = new Hono();

// Get all difficulty levels
difficultyLevelRouter.get(
  "/",
  describeRoute({
    description: "Get all difficulty levels",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(difficultyLevelSchema.array()) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const difficultyLevels = await difficultyLevelService.getAll();
    return c.json(difficultyLevels);
  },
);

// Get difficulty level by ID
difficultyLevelRouter.get(
  "/:id",
  describeRoute({
    description: "Get difficulty level by ID",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(difficultyLevelSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const id = Number(c.req.param("id"));

    const difficultyLevel = await difficultyLevelService.getById(id);

    if (!difficultyLevel) {
      return c.json({ error: "Difficulty level not found" }, 404);
    }

    return c.json(difficultyLevel);
  },
);

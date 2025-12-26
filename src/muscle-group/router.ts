import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { muscleGroupService } from "./service";
import { jwtMiddleware } from "../middleware/jwt";
import { muscleGroupSchema } from "./schema";

export const muscleGroupRouter = new Hono();

// Get all muscle groups
muscleGroupRouter.get(
  "/",
  describeRoute({
    description: "Get all muscle groups",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(muscleGroupSchema.array()) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const muscleGroups = await muscleGroupService.getAll();
    return c.json(muscleGroups);
  },
);

// Get muscle group by ID
muscleGroupRouter.get(
  "/:id",
  describeRoute({
    description: "Get muscle group by ID",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(muscleGroupSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const id = Number(c.req.param("id"));

    const muscleGroup = await muscleGroupService.getById(id);

    if (!muscleGroup) {
      return c.json({ error: "Muscle group not found" }, 404);
    }

    return c.json(muscleGroup);
  },
);

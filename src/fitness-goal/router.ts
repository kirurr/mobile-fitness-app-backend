import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { jwtMiddleware } from "../middleware/jwt";
import { fitnessGoalService } from "./service";
import { fitnessGoalSchema } from "./schema";

export const fitnessGoalRouter = new Hono();

// Get all fitness goals
fitnessGoalRouter.get(
  "/",
  describeRoute({
    description: "Get all fitness goals",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(fitnessGoalSchema.array()) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const fitnessGoals = await fitnessGoalService.getAll();
    return c.json(fitnessGoals);
  },
);

// Get fitness goal by ID
fitnessGoalRouter.get(
  "/:id",
  describeRoute({
    description: "Get fitness goal by ID",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(fitnessGoalSchema) },
        },
      },
    },
  }),
  jwtMiddleware,
  async (c) => {
    const id = Number(c.req.param("id"));

    const fitnessGoal = await fitnessGoalService.getById(id);

    if (!fitnessGoal) {
      return c.json({ error: "Fitness goal not found" }, 404);
    }

    return c.json(fitnessGoal);
  },
);

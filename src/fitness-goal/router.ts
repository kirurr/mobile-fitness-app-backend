import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { fitnessGoalService } from "./service";

export const fitnessGoalRouter = new Hono();

// Get all fitness goals
fitnessGoalRouter.get("/", jwtMiddleware, async (c) => {
  const fitnessGoals = await fitnessGoalService.getAll();
  return c.json(fitnessGoals);
});

// Get fitness goal by ID
fitnessGoalRouter.get("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  
  const fitnessGoal = await fitnessGoalService.getById(id);
  
  if (!fitnessGoal) {
    return c.json({ error: "Fitness goal not found" }, 404);
  }
  
  return c.json(fitnessGoal);
});
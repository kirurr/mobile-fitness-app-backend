import { Hono } from "hono";
import { muscleGroupService } from "./service";
import { jwtMiddleware } from "../middleware/jwt";

export const muscleGroupRouter = new Hono();

// Get all muscle groups
muscleGroupRouter.get("/", jwtMiddleware, async (c) => {
  const muscleGroups = await muscleGroupService.getAll();
  return c.json(muscleGroups);
});

// Get muscle group by ID
muscleGroupRouter.get("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));

  const muscleGroup = await muscleGroupService.getById(id);

  if (!muscleGroup) {
    return c.json({ error: "Muscle group not found" }, 404);
  }

  return c.json(muscleGroup);
});

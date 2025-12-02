import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { difficultyLevelService } from "./service";

export const difficultyLevelRouter = new Hono();

// Get all difficulty levels
difficultyLevelRouter.get("/", jwtMiddleware, async (c) => {
  const difficultyLevels = await difficultyLevelService.getAll();
  return c.json(difficultyLevels);
});

// Get difficulty level by ID
difficultyLevelRouter.get("/:id", jwtMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  
  const difficultyLevel = await difficultyLevelService.getById(id);
  
  if (!difficultyLevel) {
    return c.json({ error: "Difficulty level not found" }, 404);
  }
  
  return c.json(difficultyLevel);
});
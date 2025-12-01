import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createUserInputSchema } from "./user/schema.js";
import { userService } from "./user/service.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/signup", zValidator("json", createUserInputSchema), async (c) => {
  const data = c.req.valid("json");
  const user = await userService.createUser(data);

  return c.json(user);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

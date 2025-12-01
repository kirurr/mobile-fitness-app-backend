import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRouter } from "./auth/router";
import { jwtMiddleware } from "./middleware/jwt";

const app = new Hono();

app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/test", jwtMiddleware, (c) => {
  return c.json({ message: c.var.user.id });
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

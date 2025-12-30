import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRouter } from "./auth/router.js";
import { userDataRouter } from "./user-data/router.js";
import { fitnessGoalRouter } from "./fitness-goal/router.js";
import { difficultyLevelRouter } from "./difficulty-level/router.js";
import { subscriptionRouter } from "./subscription/router.js";
import { userSubscriptionRouter } from "./user-subscription/router.js";
import { userPaymentRouter } from "./user-payment/router.js";
import { exerciseCategoryRouter } from "./exercise-category/router.js";
import { muscleGroupRouter } from "./muscle-group/router.js";
import { exerciseRouter } from "./exercise/router.js";
import { exerciseProgramRouter } from "./exerciseProgram/router.js";
import { userCompletedProgramRouter } from "./userCompletedProgram/router.js";
import { userCompletedExerciseRouter } from "./userCompletedExercise/router.js";
import { plannedExerciseProgramRouter } from "./plannedExerciseProgram/router.js";
import { logger } from "hono/logger";
import { openAPIRouteHandler } from "hono-openapi";

const app = new Hono();

app.use(logger());

app.route("/auth", authRouter);
app.route("/user-data", userDataRouter);
app.route("/fitness-goal", fitnessGoalRouter);
app.route("/difficulty-level", difficultyLevelRouter);
app.route("/subscription", subscriptionRouter);
app.route("/user-subscription", userSubscriptionRouter);
app.route("/user-payment", userPaymentRouter);
app.route("/exercise-category", exerciseCategoryRouter);
app.route("/muscle-group", muscleGroupRouter);
app.route("/exercise", exerciseRouter);
app.route("/exercise-program", exerciseProgramRouter);
app.route("/user-completed-program", userCompletedProgramRouter);
app.route("/user-completed-exercise", userCompletedExerciseRouter);
app.route("/planned-exercise-program", plannedExerciseProgramRouter);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  }),
);

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 3000),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

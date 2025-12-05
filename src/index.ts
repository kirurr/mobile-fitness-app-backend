import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRouter } from "./auth/router";
import { userDataRouter } from "./user-data/router";
import { fitnessGoalRouter } from "./fitness-goal/router";
import { difficultyLevelRouter } from "./difficulty-level/router";
import { subscriptionRouter } from "./subscription/router";
import { userSubscriptionRouter } from "./user-subscription/router";
import { userPaymentRouter } from "./user-payment/router";
import { exerciseCategoryRouter } from "./exercise-category/router";
import { muscleGroupRouter } from "./muscle-group/router";
import { exerciseRouter } from "./exercise/router";
import { exerciseProgramRouter } from "./exerciseProgram/router";
import { userCompletedProgramRouter } from "./userCompletedProgram/router";
import { userCompletedExerciseRouter } from "./userCompletedExercise/router";
import { plannedExerciseProgramRouter } from "./plannedExerciseProgram/router";
import { logger } from 'hono/logger'

const app = new Hono();

app.use(logger())

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

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 3000),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

import { createSelectSchema } from "drizzle-zod";
import { subscriptionTable } from "../db/schema.js";
import { z } from "zod";

export const subscriptionSchema = createSelectSchema(subscriptionTable);

export type Subscription = z.infer<typeof subscriptionSchema>;
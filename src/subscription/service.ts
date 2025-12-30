import { eq } from "drizzle-orm";
import { db } from "../db/drizzle.js";
import { subscriptionTable } from "../db/schema.js";
import type { Subscription } from "./schema.js";

export const subscriptionService = {
  getAll: async (): Promise<Subscription[]> => {
    const subscriptions = await db.select().from(subscriptionTable);
    return subscriptions;
  },

  getById: async (id: number): Promise<Subscription | null> => {
    const subscription = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, id));

    if (subscription.length === 0) {
      return null;
    }

    return subscription[0];
  },
};
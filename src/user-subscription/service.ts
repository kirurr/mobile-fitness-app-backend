import { eq, and } from "drizzle-orm";
import { db } from "../db/drizzle";
import { userSubscriptionTable } from "../db/schema";
import type { UserSubscription, CreateUserSubscriptionInput, UpdateUserSubscriptionInput } from "./schema";

export const userSubscriptionService = {
  getByUserId: async (userId: number): Promise<UserSubscription[]> => {
    const userSubscriptions = await db
      .select()
      .from(userSubscriptionTable)
      .where(eq(userSubscriptionTable.userId, userId));

    return userSubscriptions;
  },

  getById: async (id: number): Promise<UserSubscription | null> => {
    const userSubscription = await db
      .select()
      .from(userSubscriptionTable)
      .where(eq(userSubscriptionTable.id, id));

    if (userSubscription.length === 0) {
      return null;
    }

    return userSubscription[0];
  },

  create: async (data: CreateUserSubscriptionInput): Promise<UserSubscription> => {
    // Check if user already has the same subscription active
    const existingUserSubscriptions = await db
      .select()
      .from(userSubscriptionTable)
      .where(
        and(
          eq(userSubscriptionTable.userId, data.userId),
          eq(userSubscriptionTable.subscriptionId, data.subscriptionId)
        )
      );

    // If user already has the same subscription and it's still active (endDate in the future), don't allow
    if (existingUserSubscriptions.length > 0) {
      const activeSubscription = existingUserSubscriptions.find(sub => new Date(sub.endDate) > new Date());
      if (activeSubscription) {
        throw new Error("User already has an active subscription of this type");
      }
    }

    const [insertedUserSubscription] = await db
      .insert(userSubscriptionTable)
      .values(data)
      .returning();

    return insertedUserSubscription;
  },

  update: async (id: number, data: UpdateUserSubscriptionInput): Promise<UserSubscription | null> => {
    const updatedUserSubscription = await db
      .update(userSubscriptionTable)
      .set(data)
      .where(eq(userSubscriptionTable.id, id))
      .returning();

    if (updatedUserSubscription.length === 0) {
      return null;
    }

    return updatedUserSubscription[0];
  },

  delete: async (id: number): Promise<boolean> => {
    const deletedUserSubscription = await db
      .delete(userSubscriptionTable)
      .where(eq(userSubscriptionTable.id, id))
      .returning();

    return deletedUserSubscription.length > 0;
  },
};
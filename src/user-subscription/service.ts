import { eq, and } from "drizzle-orm";
import { db } from "../db/drizzle.js";
import { userSubscriptionTable } from "../db/schema.js";
import type {
  UserSubscription,
  CreateUserSubscriptionInput,
  UpdateUserSubscriptionInput,
  UpdateUserSubscription,
} from "./schema.js";

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

  create: async (
    data: CreateUserSubscriptionInput,
  ): Promise<UserSubscription> => {
    // Validate required date fields
    if (!data.startDate) {
      throw new Error("startDate is required");
    }
    if (!data.endDate) {
      throw new Error("endDate is required");
    }

    // Validate date strings
    let startDate: Date;
    let endDate: Date;

    try {
      startDate = new Date(data.startDate);
      endDate = new Date(data.endDate);

      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch {
      throw new Error("Invalid date format");
    }

    // Check if user already has the same subscription active
    const existingUserSubscriptions = await db
      .select()
      .from(userSubscriptionTable)
      .where(
        and(
          eq(userSubscriptionTable.userId, data.userId),
          eq(userSubscriptionTable.subscriptionId, data.subscriptionId),
        ),
      );

    // If user already has the same subscription and it's still active (endDate in the future), don't allow
    if (existingUserSubscriptions.length > 0) {
      const activeSubscription = existingUserSubscriptions.find(
        (sub) => new Date(sub.endDate) > new Date(),
      );
      if (activeSubscription) {
        throw new Error("User already has an active subscription of this type");
      }
    }

    const [insertedUserSubscription] = await db
      .insert(userSubscriptionTable)
      .values({
        ...(data.id !== null && data.id !== undefined ? { id: data.id } : {}),
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        startDate: startDate,
        endDate: endDate,
      })
      .returning();

    return insertedUserSubscription;
  },

  update: async (
    id: number,
    data: UpdateUserSubscriptionInput,
  ): Promise<UserSubscription | null> => {
    // Convert string dates to Date objects for database operations
    const updateData: UpdateUserSubscription = {} as UpdateUserSubscription;

    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.subscriptionId !== undefined)
      updateData.subscriptionId = data.subscriptionId;
    if (data.startDate !== undefined) {
      if (!data.startDate) {
        throw new Error("startDate cannot be empty");
      }
      try {
        updateData.startDate = new Date(data.startDate);
        if (isNaN(updateData.startDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch {
        throw new Error("Invalid date format for startDate");
      }
    }
    if (data.endDate !== undefined) {
      if (!data.endDate) {
        throw new Error("endDate cannot be empty");
      }
      try {
        updateData.endDate = new Date(data.endDate);
        if (isNaN(updateData.endDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch {
        throw new Error("Invalid date format for endDate");
      }
    }

    const updatedUserSubscription = await db
      .update(userSubscriptionTable)
      .set(updateData)
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

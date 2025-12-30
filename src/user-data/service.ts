import { eq } from "drizzle-orm";
import { db } from "../db/drizzle.js";
import { userDataTable } from "../db/schema.js";
import type { UserData, CreateUserDataInput, UpdateUserDataInput } from "./schema.js";

export const userDataService = {
  getByUserId: async (userId: number): Promise<UserData | null> => {
    const userData = await db
      .select()
      .from(userDataTable)
      .where(eq(userDataTable.userId, userId));

    if (userData.length === 0) {
      return null;
    }

    return userData[0];
  },

  create: async (data: CreateUserDataInput): Promise<UserData> => {
    const existingUserData = await userDataService.getByUserId(data.userId);
    if (existingUserData) {
      throw new Error("User data already exists for this user");
    }

    const [insertedUserData] = await db
      .insert(userDataTable)
      .values(data)
      .returning();

    return insertedUserData;
  },

  update: async (userId: number, data: UpdateUserDataInput): Promise<UserData | null> => {
    const updatedUserData = await db
      .update(userDataTable)
      .set(data)
      .where(eq(userDataTable.userId, userId))
      .returning();

    if (updatedUserData.length === 0) {
      return null;
    }

    return updatedUserData[0];
  },

  delete: async (userId: number): Promise<boolean> => {
    const deletedUserData = await db
      .delete(userDataTable)
      .where(eq(userDataTable.userId, userId))
      .returning();

    return deletedUserData.length > 0;
  },
};

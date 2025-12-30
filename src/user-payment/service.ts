import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { userPaymentTable } from "../db/schema";
import type { UserPayment, CreateUserPaymentInput, UpdateUserPaymentInput } from "./schema";

export const userPaymentService = {
  getByUserId: async (userId: number): Promise<UserPayment[]> => {
    const userPayments = await db
      .select()
      .from(userPaymentTable)
      .where(eq(userPaymentTable.userId, userId));

    return userPayments;
  },

  getById: async (id: number): Promise<UserPayment | null> => {
    const userPayment = await db
      .select()
      .from(userPaymentTable)
      .where(eq(userPaymentTable.id, id));

    if (userPayment.length === 0) {
      return null;
    }

    return userPayment[0];
  },

  create: async (data: CreateUserPaymentInput): Promise<UserPayment> => {
    const [insertedUserPayment] = await db
      .insert(userPaymentTable)
      .values({
        ...(data.id !== null && data.id !== undefined ? { id: data.id } : {}),
        userId: data.userId,
        amount: data.amount,
      })
      .returning();

    return insertedUserPayment;
  },

  update: async (id: number, data: UpdateUserPaymentInput): Promise<UserPayment | null> => {
    const updatedUserPayment = await db
      .update(userPaymentTable)
      .set(data)
      .where(eq(userPaymentTable.id, id))
      .returning();

    if (updatedUserPayment.length === 0) {
      return null;
    }

    return updatedUserPayment[0];
  },

  delete: async (id: number): Promise<boolean> => {
    const deletedUserPayment = await db
      .delete(userPaymentTable)
      .where(eq(userPaymentTable.id, id))
      .returning();

    return deletedUserPayment.length > 0;
  },
};

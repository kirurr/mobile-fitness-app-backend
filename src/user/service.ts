import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { userTable } from "../db/schema";
import { hashPassword, verifyPassword } from "../lib/utils";
import type { User, AuthUserInput } from "./schema";

export const userService = {
  getByEmail: async (email: string): Promise<User | null> => {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (user.length === 0) {
      return null;
    }

    return user[0];
  },

  create: async (data: AuthUserInput): Promise<User> => {
    const user = await userService.getByEmail(data.email);

    if (user) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const insertedUser = (
      await db
        .insert(userTable)
        .values({ email: data.email, passwordHash: passwordHash })
        .returning()
    )[0];

    return insertedUser;
  },

  authenticate: async (data: AuthUserInput): Promise<User | null> => {
    const user = await userService.getByEmail(data.email);
    if (!user) {
      return null;
    }

    const isPasswordCorrect = await verifyPassword(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    return user;
  },
};

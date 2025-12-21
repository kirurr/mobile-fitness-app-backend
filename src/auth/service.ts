import { HTTPException } from "hono/http-exception";
import { signToken } from "../lib/jwt";
import type { AuthUserInput } from "../user/schema";
import { userService } from "../user/service";

type AuthResponse = {
  userId: number;
  token: string;
};
export const authService = {
  signin: async (data: AuthUserInput): Promise<AuthResponse> => {
    const user = await userService.authenticate(data);
    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const token = await signToken({ id: user.id });
    return { token, userId: user.id };
  },

  signup: async (data: AuthUserInput): Promise<AuthResponse> => {
    const user = await userService.create(data);

    const token = await signToken({ id: user.id });
    return { token, userId: user.id };
  },
};

import { signToken } from "../lib/jwt";
import type { AuthUserInput } from "../user/schema";
import { userService } from "../user/service";

export const authService = {
  signin: async (data: AuthUserInput): Promise<string> => {
    const user = await userService.authenticate(data);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = await signToken({ id: user.id });
    return token;
  },

	signup: async (data: AuthUserInput): Promise<string> => {
		const user = await userService.create(data);

		const token = await signToken({ id: user.id });
		return token;
	}
};

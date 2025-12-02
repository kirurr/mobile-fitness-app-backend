import argon2id from "argon2";

export async function hashPassword(password: string): Promise<string> {
  return await argon2id.hash(password);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await argon2id.verify(hash, password);
}

export function generateDBString(): string {
	const host = process.env.DB_HOST;
	if (!host) {
		throw new Error("DB_HOST environment variable is not set");
	}
	const port = Number(process.env.DB_PORT);
	if (isNaN(port)) {
		throw new Error("DB_PORT environment variable is not a number");
	}
	const database = process.env.DB_NAME;
	if (!database) {
		throw new Error("DB_NAME environment variable is not set");
	}
	const user = process.env.DB_USER;
	if (!user) {
		throw new Error("DB_USER environment variable is not set");
	}
	const password = process.env.DB_PASSWORD;
	if (!password) {
		throw new Error("DB_PASSWORD environment variable is not set");
	}

	return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

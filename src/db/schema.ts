import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const userTable = pgTable('user', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	email: text().notNull(),
	passwordHash: text().notNull(),
})

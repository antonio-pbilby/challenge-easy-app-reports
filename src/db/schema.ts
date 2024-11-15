import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, decimal } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	cpf: varchar({ length: 11 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
	account: one(accounts),
}));

export const accounts = pgTable("user_accounts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer("user_id").references(() => users.id),
	balance: decimal().notNull().default("0"),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

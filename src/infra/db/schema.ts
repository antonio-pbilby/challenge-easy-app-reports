import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	varchar,
	decimal,
	timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	cpf: varchar({ length: 11 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
});

export const accounts = pgTable("user_accounts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
	balance: decimal().notNull().default("0"),
});

export const transactions = pgTable("transactions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	accountId: integer("account_id")
		.references(() => accounts.id)
		.notNull(),
	targetAccountId: integer("target_account_id").references(() => accounts.id),
	transactionType: varchar({
		enum: ["deposit", "withdraw", "transfer"],
	}).notNull(),
	amount: decimal().notNull(),
	transactionDate: timestamp().notNull().defaultNow(),
});

export type InsertTransaction = typeof transactions.$inferInsert;

export const usersRelations = relations(users, ({ one }) => ({
	account: one(accounts),
}));
export const accountsRelations = relations(accounts, ({ one, many }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
	transactions: many(transactions),
}));
export const transactionsRelations = relations(transactions, ({ one }) => ({
	account: one(accounts, {
		fields: [transactions.accountId],
		references: [accounts.id],
	}),
	targetAccount: one(accounts, {
		fields: [transactions.accountId],
		references: [accounts.id],
	}),
}));

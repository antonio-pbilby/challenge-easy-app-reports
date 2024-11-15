import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  cpf: varchar({ length: 11 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  salt: varchar({ length: 255 }).notNull()
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InserUser = typeof usersTable.$inferInsert;
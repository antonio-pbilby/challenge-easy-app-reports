import { db } from "../../db";
import { type InsertTransaction, transactions } from "../../db/schema";

export class TransactionRepository {
	private readonly dbClient = db;

	async create(transaction: InsertTransaction) {
		return this.dbClient.insert(transactions).values(transaction).returning();
	}
}

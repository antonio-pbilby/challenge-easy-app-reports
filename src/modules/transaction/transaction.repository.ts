import { db } from "../../db";
import { type InsertTransaction, transactions } from "../../db/schema";

export class TransactionRepository {
	private readonly dbClient = db;

	async create(transaction: InsertTransaction) {
		return this.dbClient.insert(transactions).values(transaction).returning();
	}

	async getUserTransactionHistory(accountId: number) {
		return this.dbClient.query.transactions.findMany({
			where: (transactions, { eq, or }) =>
				or(
					eq(transactions.accountId, accountId),
					eq(transactions.targetAccountId, accountId),
				),
		});
	}
}

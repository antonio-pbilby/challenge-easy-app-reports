import { inject, injectable } from "tsyringe";
import { InjectionTokens } from "../../app/utils/injection-tokens";
import type { DrizzleDB } from "../../infra/db/register-db";
import { type InsertTransaction, transactions } from "../../infra/db/schema";

@injectable()
export class TransactionRepository {
	constructor(
		@inject(InjectionTokens.DB_CLIENT)
		private readonly dbClient: DrizzleDB,
	) {}

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

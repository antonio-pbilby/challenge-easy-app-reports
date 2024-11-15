import { injectable } from "tsyringe";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { accounts } from "../../db/schema";

@injectable()
export class AccountRepository {
	dbClient = db;

	async getAccountByUserId(userId: number) {
		return this.dbClient.query.accounts.findFirst({
			where: (accounts, { eq }) => eq(accounts.userId, userId),
		});
	}

	async updateBalance(id: number, balance: string) {
		const account = await this.dbClient
			.update(accounts)
			.set({ balance: balance })
			.where(eq(accounts.id, id))
			.returning();

		return account[0];
	}
}

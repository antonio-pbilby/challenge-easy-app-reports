import { injectable } from "tsyringe";
import { db } from "../../db";

@injectable()
export class AccountRepository {
	dbClient = db;

	async getBalance(userId: number) {
		return this.dbClient.query.accounts.findFirst({
			where: (accounts, { eq }) => eq(accounts.userId, userId),
		});
	}
}

import { injectable } from "tsyringe";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { accounts } from "../../db/schema";
import Decimal from "decimal.js";
import { withdrawSchema } from "./schemas/withdraw.schema";
import { BadRequestException } from "../../exceptions/badrequest.exception";

@injectable()
export class AccountRepository {
	private readonly dbClient = db;

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

	async deposit({
		userId,
		amount,
		time,
	}: { userId: number; amount: Decimal; time?: number }) {
		const result = await this.dbClient.transaction(async (tx) => {
			const account = await tx
				.select()
				.from(accounts)
				.where(eq(accounts.userId, userId))
				.for("update");
			const newAmount = new Decimal(account[0].balance).plus(amount).toString();

			if (time) {
				await tx.execute(`SELECT pg_sleep(${time})`);
			}

			const response = await tx
				.update(accounts)
				.set({ balance: newAmount })
				.where(eq(accounts.userId, userId))
				.returning();
			return response[0];
		});

		return result;
	}

	async withdraw({
		amount,
		userId,
		time,
	}: { userId: number; amount: Decimal; time?: number }) {
		const result = await this.dbClient.transaction(async (tx) => {
			const account = await tx
				.select()
				.from(accounts)
				.where(eq(accounts.userId, userId))
				.for("update");
			const balance = new Decimal(account[0].balance);

			if (time) {
				await tx.execute(`SELECT pg_sleep(${time})`);
			}

			const hasFunds = balance.gte(amount);
			if (!hasFunds) {
				throw new BadRequestException("Insuficient funds");
			}

			const newAmount = balance.minus(amount).toString();
			const response = await tx
				.update(accounts)
				.set({ balance: newAmount })
				.where(eq(accounts.userId, userId))
				.returning();
			return response[0];
		});

		return result;
	}

	async transfer({
		amount,
		recipientId,
		senderId,
		time,
	}: {
		senderId: number;
		recipientId: number;
		amount: Decimal;
		time?: number;
	}) {
		const response = await this.dbClient.transaction(async (tx) => {
			const senderAccount = (
				await tx
					.select()
					.from(accounts)
					.where(eq(accounts.userId, senderId))
					.for("update")
			)[0];
			const recipientAccount = (
				await tx
					.select()
					.from(accounts)
					.where(eq(accounts.userId, recipientId))
					.for("update")
			)[0];

			if (time) {
				await tx.execute(`SELECT pg_sleep(${time})`);
			}

			const senderBalance = new Decimal(senderAccount.balance);
			const recipientBalance = new Decimal(recipientAccount.balance);
			const senderHasFunds = senderBalance.gte(amount);

			if (!senderHasFunds) {
				throw new BadRequestException("Insuficient funds");
			}

			const recipient = await tx
				.update(accounts)
				.set({ balance: recipientBalance.plus(amount).toString() })
				.where(eq(accounts.id, recipientAccount.id))
				.returning();
			const sender = await tx
				.update(accounts)
				.set({ balance: senderBalance.minus(amount).toString() })
				.where(eq(accounts.id, senderAccount.id))
				.returning();

			return {
				recipient: recipient[0],
				sender: sender[0],
			};
		});

		return response;
	}
}

import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../utils/injection-tokens";
import type { AccountRepository } from "./account.repository";
import Decimal from "decimal.js";
import { BadRequestException } from "../../exceptions/badrequest.exception";
import { errorAsValue } from "../../utils/error-as-value";
import type { TransactionRepository } from "../transaction/transaction.repository";
import { envConfig } from "../../config";

@singleton()
export class AccountService {
	constructor(
		@inject(InjectionTokens.ACCOUNT_REPOSITORY)
		private accountRepository: AccountRepository,
		@inject(InjectionTokens.TRANSACTION_REPOSITORY)
		private transactionRepository: TransactionRepository,
	) {}

	async getBalance(id: number) {
		const account = await this.accountRepository.getAccountByUserId(id);

		return account;
	}

	async deposit({
		amount,
		userId,
		time,
	}: { userId: number; amount: string | number; time?: number }) {
		const [error, decimalAmount] = errorAsValue(() =>
			new Decimal(amount).abs(),
		);
		if (error) throw new BadRequestException("Invalid amount");

		const account = await this.accountRepository.getAccountByUserId(userId);
		if (!account) {
			throw new BadRequestException("Account not found.");
		}

		const response = await this.accountRepository.deposit({
			amount: decimalAmount,
			userId: account.userId,
			time: envConfig.NODE_ENV !== "prod" ? time : undefined,
		});

		await this.transactionRepository.create({
			accountId: account.id,
			amount: decimalAmount.toString(),
			transactionType: "deposit",
		});
		return response;
	}

	async withdraw({
		amount,
		userId,
		time,
	}: { amount: string | number; userId: number; time?: number }) {
		const [error, decimalAmount] = errorAsValue(() =>
			new Decimal(amount).abs(),
		);
		if (error) throw new BadRequestException("Invalid amount");

		const account = await this.accountRepository.getAccountByUserId(userId);
		if (!account) {
			throw new BadRequestException("Account not found");
		}

		const response = await this.accountRepository.withdraw({
			amount: decimalAmount,
			userId: account.userId,
			time: envConfig.NODE_ENV !== "prod" ? time : undefined,
		});
		await this.transactionRepository.create({
			accountId: account.id,
			amount: decimalAmount.toString(),
			transactionType: "withdraw",
		});

		return response;
	}

	async transfer({
		amount,
		recipientId,
		senderId,
		time,
	}: {
		senderId: number;
		recipientId: number;
		amount: string | number;
		time?: number;
	}) {
		const [error, decimalAmount] = errorAsValue(() =>
			new Decimal(amount).abs(),
		);
		if (error) throw new BadRequestException("Invalid amount");

		const response = await this.accountRepository.transfer({
			amount: decimalAmount,
			recipientId: recipientId,
			senderId: senderId,
			time: envConfig.NODE_ENV !== "prod" ? time : undefined,
		});

		await this.transactionRepository.create({
			accountId: response.sender.id,
			amount: decimalAmount.toString(),
			transactionType: "transfer",
			targetAccountId: response.recipient.id,
		});

		return response.sender;
	}
}

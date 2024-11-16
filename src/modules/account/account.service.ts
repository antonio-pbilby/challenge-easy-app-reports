import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../utils/injection-tokens";
import type { AccountRepository } from "./account.repository";
import Decimal from "decimal.js";
import { BadRequestException } from "../../exceptions/badrequest.exception";
import { errorAsValue } from "../../utils/error-as-value";
import type { TransactionRepository } from "../transaction/transaction.repository";

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
	}: { userId: number; amount: string | number }) {
		const [error, decimalAmount] = errorAsValue(() =>
			new Decimal(amount).abs(),
		);

		if (error) throw new BadRequestException("Invalid amount");

		const account = await this.accountRepository.getAccountByUserId(userId);

		if (!account) {
			throw new BadRequestException("Account not found.");
		}

		const newAmount = new Decimal(account.balance)
			.plus(decimalAmount)
			.toString();

		const response = await this.accountRepository.updateBalance(
			account.id,
			newAmount,
		);
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
	}: { amount: string | number; userId: number }) {
		// TODO use transaction to lock row level
		const [error, decimalAmount] = errorAsValue(() =>
			new Decimal(amount).abs(),
		);
		if (error) throw new BadRequestException("Invalid amount");

		const account = await this.accountRepository.getAccountByUserId(userId);
		if (!account) {
			throw new BadRequestException("Account not found");
		}

		const hasFunds = new Decimal(account.balance).gte(decimalAmount);
		if (!hasFunds) throw new BadRequestException("Insuficient funds");

		const newAmount = new Decimal(account.balance).minus(amount);

		const response = await this.accountRepository.updateBalance(
			account.id,
			newAmount.toString(),
		);
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
	}: { senderId: number; recipientId: number; amount: string | number }) {
		const [error, decimalAmount] = errorAsValue(() =>
			new Decimal(amount).abs(),
		);
		if (error) throw new BadRequestException("Invalid amount");

		const senderAccount =
			await this.accountRepository.getAccountByUserId(senderId);
		if (!senderAccount)
			throw new BadRequestException("Sender account not found");

		const recipientAccount =
			await this.accountRepository.getAccountByUserId(recipientId);
		if (!recipientAccount)
			throw new BadRequestException("Recipient account not found");

		const senderHasFunds = new Decimal(senderAccount.balance).gte(
			decimalAmount,
		);
		if (!senderHasFunds) throw new BadRequestException("Insuficient funds");

		const senderNewAmount = new Decimal(senderAccount.balance).minus(
			decimalAmount,
		);
		const recipientNewAmount = new Decimal(recipientAccount.balance).plus(
			decimalAmount,
		);

		await this.transactionRepository.create({
			accountId: senderAccount.id,
			amount: decimalAmount.toString(),
			transactionType: "transfer",
			targetAccountId: recipientAccount.id,
		});

		return {
			sender: await this.accountRepository.updateBalance(
				senderAccount.id,
				senderNewAmount.toString(),
			),
			recipient: await this.accountRepository.updateBalance(
				recipientAccount.id,
				recipientNewAmount.toString(),
			),
		};
	}
}

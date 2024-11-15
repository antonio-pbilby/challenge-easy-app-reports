import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../utils/injection-tokens";
import type { AccountRepository } from "./account.repository";
import Decimal from "decimal.js";
import { BadRequestException } from "../../exceptions/badrequest.exception";
import { errorAsValue } from "../../utils/error-as-value";

@singleton()
export class AccountService {
	constructor(
		@inject(InjectionTokens.ACCOUNT_REPOSITORY)
		private accountRepository: AccountRepository,
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

		return this.accountRepository.updateBalance(account.id, newAmount);
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

		return this.accountRepository.updateBalance(
			account.id,
			newAmount.toString(),
		);
	}
}

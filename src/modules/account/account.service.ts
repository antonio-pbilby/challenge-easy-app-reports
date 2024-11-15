import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../utils/injection-tokens";
import type { AccountRepository } from "./account.repository";
import Decimal from "decimal.js";
import { BadRequestException } from "../../exceptions/badrequest.exception";

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
		const decimalAmount = new Decimal(amount).abs();

		const account = await this.accountRepository.getAccountByUserId(userId);

		if (!account) {
			throw new BadRequestException("Account not found.");
		}

		const newAmount = new Decimal(account.balance)
			.plus(decimalAmount)
			.toString();

		return this.accountRepository.updateBalance(account.id, newAmount);
	}
}

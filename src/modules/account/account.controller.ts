import type { Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../app/utils/injection-tokens";
import type { AccountService } from "./account.service";
import type { RequestWithUser } from "../../app/types/request-with-user";

@singleton()
export class AccountController {
	constructor(
		@inject(InjectionTokens.ACCOUNT_SERVICE)
		private accountService: AccountService,
	) {}

	async getBalance(req: Request, res: Response) {
		const { id } = (req as RequestWithUser).user;
		const account = await this.accountService.getBalance(id);
		res.send({ account });
	}

	async deposit(req: Request, res: Response) {
		const { id } = (req as RequestWithUser).user;
		const { amount, time } = req.body;

		res.send(await this.accountService.deposit({ userId: id, amount, time }));
	}

	async withdraw(req: Request, res: Response) {
		const { id } = (req as RequestWithUser).user;
		const { amount, time } = req.body;

		res.send(await this.accountService.withdraw({ userId: id, amount, time }));
	}

	async transfer(req: Request, res: Response) {
		const { id } = (req as RequestWithUser).user;
		const { amount, recipientId, time } = req.body;

		res.send(
			await this.accountService.transfer({
				senderId: id,
				amount,
				recipientId,
				time,
			}),
		);
	}

	async getTransactionHistory(req: Request, res: Response) {
		const { id } = (req as RequestWithUser).user;

		res.send(await this.accountService.accountHistory(id));
	}
}

import type { Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../utils/injection-tokens";
import type { AccountService } from "./account.service";
import type { RequestWithUser } from "../../types/request-with-user";

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
}

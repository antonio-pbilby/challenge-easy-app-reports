import type { Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../app/utils/injection-tokens";
import type { UserService } from "./user.service";

@singleton()
export class UserController {
	constructor(
		@inject(InjectionTokens.USER_SERVICE)
		private userService: UserService,
	) {}

	async create(req: Request, res: Response) {
		const userData = req.body;
		await this.userService.create(userData);
		res.status(201).send();
	}

	async login(req: Request, res: Response) {
		const loginData = req.body;
		const token = await this.userService.login(loginData);
		res.send({ token });
	}
}

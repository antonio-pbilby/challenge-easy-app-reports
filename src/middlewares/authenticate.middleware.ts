import type { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import { InjectionTokens } from "../utils/injection-tokens";
import type { UserService } from "../modules/users/user.service";

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userService = container.resolve<UserService>(
			InjectionTokens.USER_SERVICE,
		);

		const bearerToken = req.headers.authorization;
		if (!bearerToken)
			throw new UnauthorizedException([
				{ error: "Missing authentication token" },
			]);

		const token = bearerToken.split(" ")[1];
		if (!token) {
			throw new UnauthorizedException([
				{ error: "Missing authentication token" },
			]);
		}

		const user = await userService.authenticate(token);
		Object.assign(req, { user });
		next();
	} catch (err) {
		next(err);
	}
};

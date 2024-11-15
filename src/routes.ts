import { Router } from "express";
import { container } from "tsyringe";
import type { UserController } from "./modules/users/users.controller";
import { InjectionTokens } from "./utils/injection-tokens";
import { validateRequest } from "./middlewares/validation.middleware";
import { createUserSchema } from "./modules/users/schemas/create-user.schema";
import { loginSchema } from "./modules/users/schemas/login.schema";
import { authenticate } from "./middlewares/authenticate.middleware";
import type { AccountController } from "./modules/account/account.controller";
import { depositSchema } from "./modules/account/schemas/deposit.schema";

export const router = Router();

const userController = container.resolve<UserController>(
	InjectionTokens.USER_CONTROLLER,
);
const accountController = container.resolve<AccountController>(
	InjectionTokens.ACCOUNT_CONTROLLER,
);

router.post(
	"/users",
	validateRequest(createUserSchema),
	userController.create.bind(userController),
);

router.post(
	"/login",
	validateRequest(loginSchema),
	userController.login.bind(userController),
);

router.get(
	"/balance",
	authenticate,
	accountController.getBalance.bind(accountController),
);

router.post(
	"/balance",
	authenticate,
	validateRequest(depositSchema),
	accountController.deposit.bind(accountController),
);

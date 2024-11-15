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
import { withdrawSchema } from "./modules/account/schemas/withdraw.schema";

const userController = container.resolve<UserController>(
	InjectionTokens.USER_CONTROLLER,
);
const accountController = container.resolve<AccountController>(
	InjectionTokens.ACCOUNT_CONTROLLER,
);

export const usersRouter = Router();
export const authRouter = Router();
export const accountRouter = Router();

usersRouter.post(
	"/",
	validateRequest(createUserSchema),
	userController.create.bind(userController),
);

authRouter.post(
	"/login",
	validateRequest(loginSchema),
	userController.login.bind(userController),
);

accountRouter.get(
	"/balance",
	authenticate,
	accountController.getBalance.bind(accountController),
);

accountRouter.post(
	"/deposit",
	authenticate,
	validateRequest(depositSchema),
	accountController.deposit.bind(accountController),
);

accountRouter.post(
	"/withdraw",
	authenticate,
	validateRequest(withdrawSchema),
	accountController.withdraw.bind(accountController),
);

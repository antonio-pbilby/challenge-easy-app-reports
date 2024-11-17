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
import { transferSchema } from "./modules/account/schemas/transfer.schema";
import { app } from "./app";

export const initializeRoutes = () => {
	const userController = container.resolve<UserController>(
		InjectionTokens.USER_CONTROLLER,
	);
	const accountController = container.resolve<AccountController>(
		InjectionTokens.ACCOUNT_CONTROLLER,
	);

	const usersRouter = Router();
	usersRouter.post(
		"/",
		validateRequest(createUserSchema),
		userController.create.bind(userController),
	);

	const authRouter = Router();
	authRouter.post(
		"/login",
		validateRequest(loginSchema),
		userController.login.bind(userController),
	);

	const accountRouter = Router();
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
	accountRouter.post(
		"/transfer",
		authenticate,
		validateRequest(transferSchema),
		accountController.transfer.bind(accountController),
	);
	accountRouter.get(
		"/history",
		authenticate,
		accountController.getTransactionHistory.bind(accountController),
	);

	app.use("/auth", authRouter);
	app.use("/users", usersRouter);
	app.use("/account", accountRouter);
};

import { container } from "tsyringe";
import { InjectionTokens } from "./utils/injection-tokens";
import { UserRepository } from "./modules/users/user.repository";
import { UserService } from "./modules/users/user.service";
import { UserController } from "./modules/users/users.controller";
import { AccountRepository } from "./modules/account/account.repository";
import { AccountService } from "./modules/account/account.service";
import { AccountController } from "./modules/account/account.controller";

container.register(InjectionTokens.USER_REPOSITORY, {
	useClass: UserRepository,
});
container.register(InjectionTokens.USER_SERVICE, {
	useClass: UserService,
});
container.register(InjectionTokens.USER_CONTROLLER, {
	useClass: UserController,
});

container.register(InjectionTokens.ACCOUNT_REPOSITORY, {
	useClass: AccountRepository,
});
container.register(InjectionTokens.ACCOUNT_SERVICE, {
	useClass: AccountService,
});
container.register(InjectionTokens.ACCOUNT_CONTROLLER, {
	useClass: AccountController,
});

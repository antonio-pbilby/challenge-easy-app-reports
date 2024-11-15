import { container } from "tsyringe";
import { InjectionTokens } from "./utils/injection-tokens";
import { UserRepository } from "./modules/users/user.repository";
import { UserService } from "./modules/users/user.service";
import { UserController } from "./modules/users/users.controller";

container.register(InjectionTokens.USER_REPOSITORY, {
	useClass: UserRepository,
});
container.register(InjectionTokens.USER_SERVICE, {
	useClass: UserService,
});
container.register(InjectionTokens.USER_CONTROLLER, {
	useClass: UserController,
});

import { NextFunction, Request, Response, Router } from "express";
import { container } from "tsyringe";
import { UserController } from "./modules/users/users.controller";
import { InjectionTokens } from "./utils/injection-tokens";
import { validateRequest } from "./middlewares/validation.middleware";
import { createUserSchema } from "./modules/users/schemas/create-user.schema";

export const router = Router();

const userController = container.resolve<UserController>(InjectionTokens.USER_CONTROLLER);

router.post("/users", validateRequest(createUserSchema), userController.create.bind(userController));
import { NextFunction, Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { InjectionTokens } from "../../utils/injection-tokens";
import { UserService } from "./user.service";

@singleton()
export class UserController {
  constructor(
    @inject(InjectionTokens.USER_SERVICE)
    private userService: UserService,
  ) { }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      await this.userService.create(userData);
      res.status(201).send();
    } catch (err) {
      next(err);
    }
  }
}

import bcrypt from "bcrypt";
import { inject, singleton } from "tsyringe";
import { AppException } from "../../exceptions/app.exception";
import type { UserRepository } from "./user.repository";
import { InjectionTokens } from "../../utils/injection-tokens";
import { CreateUserDTO } from "./schemas/create-user.schema";

@singleton()
export class UserService {
	constructor(
		@inject(InjectionTokens.USER_REPOSITORY)
		private userRepository: UserRepository,
	) { }

	async create(user: CreateUserDTO) {
		const existsUserWithEmailOrCpf = await this.userRepository.findByEmailOrCpf(
			user.email,
			user.cpf
		);

		if (existsUserWithEmailOrCpf) {
			if (existsUserWithEmailOrCpf.cpf === user.cpf) throw new AppException(400, "A user already exists with this CPF");
			if (existsUserWithEmailOrCpf.email === user.email) throw new AppException(400, "A user already exists with this email");
		}

		const salt = await bcrypt.genSalt();
		const encryptedPassword = await bcrypt.hash(user.password, salt);

		await this.userRepository.create({
			...user,
			password: encryptedPassword,
			salt: salt
		});
	}
}

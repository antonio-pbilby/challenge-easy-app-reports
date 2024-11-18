import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { inject, singleton } from "tsyringe";
import { AppException } from "../../app/exceptions/app.exception";
import type { UserRepository } from "./user.repository";
import { InjectionTokens } from "../../app/utils/injection-tokens";
import type { CreateUserDTO } from "./schemas/create-user.schema";
import { LoginException } from "../../app/exceptions/login.exception";
import { envConfig } from "../../app/config";
import { UnauthorizedException } from "../../app/exceptions/unauthorized.exception";

@singleton()
export class UserService {
	constructor(
		@inject(InjectionTokens.USER_REPOSITORY)
		private userRepository: UserRepository,
	) {}

	async create(user: CreateUserDTO) {
		const existsUserWithEmailOrCpf = await this.userRepository.findByEmailOrCpf(
			{
				email: user.email,
				cpf: user.cpf,
			},
		);

		if (existsUserWithEmailOrCpf) {
			if (existsUserWithEmailOrCpf.cpf === user.cpf)
				throw new AppException(400, "A user already exists with this CPF");
			if (existsUserWithEmailOrCpf.email === user.email)
				throw new AppException(400, "A user already exists with this email");
		}

		const encryptedPassword = await bcrypt.hash(user.password, 10);

		await this.userRepository.create({
			...user,
			password: encryptedPassword,
		});
	}

	async login({ email, password }: { email: string; password: string }) {
		const user = await this.userRepository.findByEmailOrCpf({ email, cpf: "" });

		if (!user) {
			throw new LoginException();
		}

		const passwordsMatch = await bcrypt.compare(password, user.password);
		if (!passwordsMatch) throw new LoginException();

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
			},
			envConfig.API_SECRET,
		);

		return token;
	}

	async authenticate(token: string) {
		try {
			const data = jwt.verify(token, envConfig.API_SECRET);
			return data;
		} catch (err) {
			throw new UnauthorizedException([{ error: "Invalid token" }]);
		}
	}
}

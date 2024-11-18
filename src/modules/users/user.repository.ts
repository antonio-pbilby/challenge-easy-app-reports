import { inject, injectable } from "tsyringe";
import type { User } from "./user.entity";
import { InjectionTokens } from "../../app/utils/injection-tokens";
import type { DrizzleDB } from "../../infra/db/register-db";
import { accounts, users } from "../../infra/db/schema";

@injectable()
export class UserRepository {
	constructor(
		@inject(InjectionTokens.DB_CLIENT)
		private readonly dbClient: DrizzleDB,
	) {}
	async create(user: User) {
		const createdUser = await this.dbClient
			.insert(users)
			.values(user)
			.returning({ id: users.id });
		await this.dbClient.insert(accounts).values({
			userId: createdUser[0].id,
		});

		return createdUser;
	}

	async findByEmailOrCpf({ cpf, email }: { email: string; cpf: string }) {
		const user = await this.dbClient.query.users.findFirst({
			where: (users, { eq, or }) =>
				or(eq(users.email, email), eq(users.cpf, cpf)),
		});

		return user;
	}
}

import { injectable } from "tsyringe";
import type { User } from "./user.entity";
import { accounts, users } from "../../db/schema";
import { db } from "../../db";

@injectable()
export class UserRepository {
	dbClient = db;
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
		const user = await db.query.users.findFirst({
			where: (users, { eq, or }) =>
				or(eq(users.email, email), eq(users.cpf, cpf)),
		});

		return user;
	}
}

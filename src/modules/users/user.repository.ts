import { injectable } from "tsyringe";
import { User } from "../../entities/user.entity";
import { usersTable } from "../../db/schema";
import { db } from "../../db";

@injectable()
export class UserRepository {
	dbClient = db;
	async create(user: User) {
		const createdUser = await this.dbClient.insert(usersTable).values(user);

		return createdUser;
	}

	async findByEmailOrCpf(email: string, cpf: string) {
		const user = await db.query.usersTable.findFirst({
			where: (users, { eq, or }) => or(
				eq(users.email, email),
				eq(users.cpf, cpf)
			)
		});

		return user;
	}
}

import { drizzle } from "drizzle-orm/node-postgres";
import { container } from "tsyringe";
import * as schema from "./schema";
import { InjectionTokens } from "../../app/utils/injection-tokens";

export function registerDb(connectionString: string) {
	const db = drizzle(connectionString, {
		logger: true,
		schema,
	});

	container.register(InjectionTokens.DB_CLIENT, {
		useValue: db,
	});

	return db;
}

export type DrizzleDB = ReturnType<typeof registerDb>;

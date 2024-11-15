import { drizzle } from "drizzle-orm/node-postgres";
import { envConfig } from "../config";
import * as schema from "./schema";

export const db = drizzle(envConfig.DATABASE_URL, {
	logger: true,
	schema,
});

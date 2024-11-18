import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { envConfig } from "./src/app/config";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/infra/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: envConfig.DATABASE_URL,
	},
});

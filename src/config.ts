import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().int().default(3000),
	DATABASE_URL: z.string(),
	API_SECRET: z.string(),
});

export const envConfig = envSchema.parse(process.env);

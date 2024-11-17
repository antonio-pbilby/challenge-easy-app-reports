import "reflect-metadata";
import "./container";
import { json } from "express";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { app } from "./app";
import { envConfig } from "./config";
import { initContainer } from "./container";
import { registerDb } from "./db/register-db";
import { initializeRoutes } from "./routes";

export const startServer = (testDatabaseUrl?: string) => {
	registerDb(testDatabaseUrl || envConfig.DATABASE_URL);
	initContainer();
	app.use(json());

	app.get("/healthcheck", (req, res) => {
		res.send("ok");
	});

	initializeRoutes();

	app.use(errorHandler);

	app.listen(envConfig.PORT, () => {
		console.log(`Server is running on port ${envConfig.PORT}`);
	});
};

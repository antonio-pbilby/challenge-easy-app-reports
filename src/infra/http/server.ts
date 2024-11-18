import "reflect-metadata";
import "../../app/container";
import { json } from "express";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { app } from "./app";
import { envConfig } from "../../app/config";
import { initContainer } from "../../app/container";
import { initializeRoutes } from "./routes";
import { registerDb } from "../db/register-db";

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

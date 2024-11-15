import "reflect-metadata";
import "./container";
import express, { json } from "express";
import { router } from "./routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

const start = async () => {
	const app = express();

	app.use(json());

	app.use("/v1", router);

	app.use(errorHandler);

	app.listen(3000, () => {
		console.log(`Server is running on port ${3000}`);
	});
};

start();

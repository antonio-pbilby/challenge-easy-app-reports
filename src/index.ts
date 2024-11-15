import "reflect-metadata";
import "./container";
import express, { json } from "express";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { accountRouter, authRouter, usersRouter } from "./routes";

const start = async () => {
	const app = express();

	app.use(json());

	app.use("/auth", authRouter);
	app.use("/users", usersRouter);
	app.use("/account", accountRouter);

	app.use(errorHandler);

	app.listen(3000, () => {
		console.log(`Server is running on port ${3000}`);
	});
};

start();

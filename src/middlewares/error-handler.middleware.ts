import type { NextFunction, Request, Response } from "express";
import { AppException } from "../exceptions/app.exception";

export const errorHandler = (
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	console.error(error);
	if (error instanceof AppException) {
		res.status(error.statusCode).json({
			message: error.message,
			errors: error.errors,
		});
		return next();
	}
	res.status(500).json("Internal Server Error");
	return next();
};

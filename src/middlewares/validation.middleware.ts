import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { AppException } from "../exceptions/app.exception";
import { ValidationException } from "../exceptions/validation.exception";

export const validateRequest = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const newParams = schema.parse({
				body: req.body,
				headers: req.headers,
				params: req.params,
				query: req.query,
			});
			Object.assign(req, newParams);
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				throw new ValidationException(err);
			}
			throw new AppException();
		}
	};
};

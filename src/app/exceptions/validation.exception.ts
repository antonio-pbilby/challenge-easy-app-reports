import type { ZodError } from "zod";
import { AppException } from "./app.exception";

export class ValidationException extends AppException {
	constructor(errors: ZodError) {
		super(400, "Validation Error", errors.issues);
	}
}

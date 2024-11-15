import { AppException } from "./app.exception";

export class UnauthorizedException extends AppException {
	constructor(errors?: object[]) {
		super(401, "Unauthorized", errors);
	}
}

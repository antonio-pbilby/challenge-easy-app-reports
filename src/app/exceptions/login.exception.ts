import { AppException } from "./app.exception";

export class LoginException extends AppException {
	constructor() {
		super(401, "Invalid email or password");
	}
}

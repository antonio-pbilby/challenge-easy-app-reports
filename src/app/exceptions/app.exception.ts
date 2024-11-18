export class AppException extends Error {
	public statusCode: number;
	public errors?: object[];

	constructor(statusCode?: number, message?: string, errors?: object[]) {
		super(message || "Internal Server Error");
		this.statusCode = statusCode || 500;
		this.errors = errors;
	}
}

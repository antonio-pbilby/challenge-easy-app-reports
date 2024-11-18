import "reflect-metadata";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/infra/http/app";
import type { z } from "zod";
import type { createUserSchema } from "../../src/modules/users/schemas/create-user.schema";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { startServer } from "../../src/infra/http/server";
import { execSync } from "node:child_process";
import { container } from "tsyringe";
import { InjectionTokens } from "../../src/app/utils/injection-tokens";
import type { DrizzleDB } from "../../src/infra/db/register-db";
import { schemasPath } from "../schema-path";

beforeAll(async () => {
	const dbContainer = await new PostgreSqlContainer().start();
	execSync(
		`npx drizzle-kit push --dialect=postgresql --schema=${schemasPath} --url=${dbContainer.getConnectionUri()}`,
	);
	startServer(dbContainer.getConnectionUri());
});

describe("Create user", () => {
	const validBody: z.infer<typeof createUserSchema>["body"] = {
		name: "user",
		email: "user@email.com",
		cpf: "12345678901",
		password: "123qwe@ASD",
		confirmPassword: "123qwe@ASD",
	};

	it("Should health check", async () => {
		await request(app).get("/healthcheck").expect(200);
	});

	it("should select from database", async () => {
		const db = container.resolve<DrizzleDB>(InjectionTokens.DB_CLIENT);
		await db.execute("SELECT * FROM users");
	});

	describe("Validation", async () => {
		it("Should throw an error if a name is not given", async () => {
			await request(app)
				.post("/users")
				.send({ ...validBody, name: "" })
				.expect(400);
		});

		it("Should throw an error if a email is not given", async () => {
			await request(app)
				.post("/users")
				.send({ ...validBody, email: "" })
				.expect(400);
		});

		it("Should throw an error if a cpf is not given", async () => {
			await request(app)
				.post("/users")
				.send({ ...validBody, cpf: "" })
				.expect(400);
		});

		it("Should throw an error if cpf is invalid", async () => {
			await request(app)
				.post("/users")
				.send({ ...validBody, cpf: "1234" })
				.expect(400);
		});

		it("Should throw an error if passwords don't match", async () => {
			await request(app)
				.post("/users")
				.send({ ...validBody, confirmPassword: "1234" })
				.expect(400);
		});

		it("should throw an error if a user with the same CPF already exists", async () => {
			const newUser = {
				...validBody,
				cpf: "12345678902",
				email: "newuser@email.com",
			};
			const newUser2 = {
				...validBody,
				cpf: "12345678902",
				email: "newuser2@email.com",
			};

			await request(app)
				.post("/users")
				.send(newUser)
				.set("Accept", "application/json");

			await request(app)
				.post("/users")
				.send(newUser2)
				.set("Accept", "application/json")
				.expect(400);
		});

		it("should throw an error if a user with the same email already exists", async () => {
			const newUser = {
				...validBody,
				cpf: "12345678903",
				email: "newuser@email.com",
			};
			const newUser2 = {
				...validBody,
				cpf: "12345678904",
				email: "newuser@email.com",
			};

			await request(app)
				.post("/users")
				.send(newUser)
				.set("Accept", "application/json");

			await request(app)
				.post("/users")
				.send(newUser2)
				.set("Accept", "application/json")
				.expect(400);
		});
	});

	it("Should be able to create a user", async () => {
		await request(app)
			.post("/users")
			.send(validBody)
			.set("Accept", "application/json")
			.expect(201);
	});

	it("Should be able to login", async () => {
		const loginbody = {
			email: validBody.email,
			password: validBody.password,
		};
		const response = await request(app)
			.post("/auth/login")
			.send(loginbody)
			.set("Accept", "application/json")
			.expect(200);

		expect(response.body.token).toBeDefined();
	});

	it("Should fail login if password or email is invalid", async () => {
		await request(app)
			.post("/auth/login")
			.send({ email: validBody.email, password: "1234" })
			.set("Accept", "application/json")
			.expect(401);
		await request(app)
			.post("/auth/login")
			.send({ email: "invalidemail@email.com", password: "1234" })
			.set("Accept", "application/json")
			.expect(401);
	});
});

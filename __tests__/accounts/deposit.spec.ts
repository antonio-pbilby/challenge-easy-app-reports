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

describe("Deposit", async () => {
	const validBody: z.infer<typeof createUserSchema>["body"] = {
		name: "user",
		email: "user@email.com",
		cpf: "12345678901",
		password: "123qwe@ASD",
		confirmPassword: "123qwe@ASD",
	};
	let token: string;

	let balance = 0;

	beforeAll(async () => {
		await request(app)
			.post("/users")
			.send(validBody)
			.set("Accept", "application/json");
		const response = await request(app)
			.post("/auth/login")
			.send({ email: validBody.email, password: validBody.password })
			.set("Accept", "application/json")
			.expect(200);
		console.log(response.body);
		token = response.body.token;
	});

	it("Should health check", async () => {
		await request(app).get("/healthcheck").expect(200);
	});

	it("should select from database", async () => {
		const db = container.resolve<DrizzleDB>(InjectionTokens.DB_CLIENT);
		await db.execute("SELECT * FROM users");
	});

	it("Should throw an error if user is not authenticated", async () => {
		await request(app)
			.post("/account/deposit")
			.send({ amount: "10" })
			.set("Accept", "application/json")
			.expect(401);
	});

	it("Should throw an error if amount is not given", async () => {
		await request(app)
			.post("/account/deposit")
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token}`)
			.expect(400);
	});

	it("Should be able to deposit", async () => {
		const amount = "10";
		await request(app)
			.post("/account/deposit")
			.send({ amount })
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		const response = await request(app)
			.get("/account/balance")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		balance += Number(amount);
		expect(response.body.account.balance).toBe(`${balance}`);
	});

	it("Should be able to deposit concurrently", async () => {
		const amount = "10";
		const [firstDeposit, secondDeposit] = await Promise.all([
			request(app)
				.post("/account/deposit")
				.send({ amount, time: 1 }) // time is used only in test environments, to make the database wait
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token}`),
			request(app)
				.post("/account/deposit")
				.send({ amount }) // time is used only in test environments, to make the database wait
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token}`)
				.expect(200),
		]);

		balance += Number(amount) * 2;
		expect(secondDeposit.body.balance).toBe(String(balance));
	});
});

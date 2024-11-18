import "reflect-metadata";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import type { z } from "zod";
import type { createUserSchema } from "../../src/modules/users/schemas/create-user.schema";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { startServer } from "../../src/server";
import { execSync } from "node:child_process";
import { container } from "tsyringe";
import { InjectionTokens } from "../../src/utils/injection-tokens";
import type { DrizzleDB } from "../../src/db/register-db";

beforeAll(async () => {
	const dbContainer = await new PostgreSqlContainer().start();
	const schemasPath = "./src/db/schema.ts";
	execSync(
		`npx drizzle-kit push --dialect=postgresql --schema=${schemasPath} --url=${dbContainer.getConnectionUri()}`,
	);
	startServer(dbContainer.getConnectionUri());
});

describe("Transfer", async () => {
	const user1: z.infer<typeof createUserSchema>["body"] = {
		name: "user",
		email: "user@email.com",
		cpf: "12345678901",
		password: "123qwe@ASD",
		confirmPassword: "123qwe@ASD",
	};
	const user2: z.infer<typeof createUserSchema>["body"] = {
		name: "user",
		email: "user2@email.com",
		cpf: "12345678902",
		password: "123qwe@ASD",
		confirmPassword: "123qwe@ASD",
	};
	let token1: string;
	let token2: string;
	let senderId: string;
	let recipientId: string;

	beforeEach(async () => {
		const db = container.resolve<DrizzleDB>(InjectionTokens.DB_CLIENT);
		await db.execute("DELETE FROM transactions");
		await db.execute("DELETE FROM user_accounts");
		await db.execute("DELETE FROM users");

		await Promise.all([
			request(app).post("/users").send(user1).set("Accept", "application/json"),
			request(app).post("/users").send(user2).set("Accept", "application/json"),
		]);
		const [response1, response2] = await Promise.all([
			request(app)
				.post("/auth/login")
				.send({ email: user1.email, password: user1.password })
				.set("Accept", "application/json"),
			request(app)
				.post("/auth/login")
				.send({ email: user2.email, password: user2.password })
				.set("Accept", "application/json"),
		]);
		token1 = response1.body.token;
		token2 = response2.body.token;

		const sender = await request(app)
			.get("/account/balance")
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`);
		const recipient = await request(app)
			.get("/account/balance")
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token2}`);
		senderId = sender.body.account.userId;
		recipientId = recipient.body.account.userId;
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
			.post("/account/transfer")
			.send({ amount: "10", recipientId })
			.set("Accept", "application/json")
			.expect(401);
	});

	it("Should throw an error if amount is not given", async () => {
		await request(app)
			.post("/account/withdraw")
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(400);
	});

	it("Should be able to transfer", async () => {
		const amount = "10";

		await request(app)
			.post("/account/deposit")
			.send({ amount })
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`);

		await request(app)
			.post("/account/transfer")
			.send({ amount, recipientId })
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(200);

		const [response1, response2] = await Promise.all([
			request(app)
				.get("/account/balance")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token1}`),
			request(app)
				.get("/account/balance")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token2}`),
		]);

		expect(response1.body.account.balance).toBe("0");
		expect(response2.body.account.balance).toBe("10");
	});

	it("Should be able to transfer concurrently", async () => {
		const amount = "10";

		await request(app)
			.post("/account/deposit")
			.send({ amount })
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(200);

		const [firstTransfer, secondTransfer] = await Promise.all([
			request(app)
				.post("/account/transfer")
				.send({ amount: "5", time: 1, recipientId }) // time is used only in test environments, to make the database wait
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token1}`),
			request(app)
				.post("/account/transfer")
				.send({ amount: "5", recipientId }) // time is used only in test environments, to make the database wait
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token1}`)
				.expect(200),
		]);

		const user2Balance = await request(app)
			.get("/account/balance")
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token2}`);

		expect(secondTransfer.body.balance).toBe("0");
		expect(user2Balance.body.account.balance).toBe("10");
	});

	it("Should throw an error if account has insuficient funds", async () => {
		await request(app)
			.post("/account/transfer")
			.send({ amount: "5000", recipientId }) // time is used only in test environments, to make the database wait
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(400);
	});

	it("Should throw an error if account has insuficient funds in concurrent requests", async () => {
		const amount = "10";

		await request(app)
			.post("/account/deposit")
			.send({ amount, recipientId })
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(200);

		await Promise.all([
			request(app)
				.post("/account/transfer")
				.send({ amount: "10", recipientId, time: 1 }) // time is used only in test environments, to make the database wait
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token1}`),
			request(app)
				.post("/account/transfer")
				.send({ amount: "10", recipientId }) // time is used only in test environments, to make the database wait
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token1}`)
				.expect(400),
		]);

		const [response1, response2] = await Promise.all([
			request(app)
				.get("/account/balance")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token1}`),
			request(app)
				.get("/account/balance")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${token2}`),
		]);

		expect(response1.body.account.balance).toBe("0");
		expect(response2.body.account.balance).toBe("10");
	});

	it("Should throw an error if a user makes a trasnfer to themself", async () => {
		const amount = "10";

		await request(app)
			.post("/account/deposit")
			.send({ amount, recipientId })
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(200);

		await request(app)
			.post("/account/transfer")
			.send({
				amount,
				recipientId: senderId,
			})
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token1}`)
			.expect(400);
	});
});

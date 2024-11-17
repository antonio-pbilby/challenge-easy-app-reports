import "reflect-metadata";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import type { z } from "zod";
import type { createUserSchema } from "../../src/modules/users/schemas/create-user.schema";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { startServer } from "../../src/server";

beforeAll(async () => {
	const dbContainer = await new PostgreSqlContainer().start();
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
	/*
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
	});
  */

	it("Should be able to create a user", async () => {
		const response = await request(app)
			.post("/users")
			.send(validBody)
			.set("Accept", "application/json");

		console.log(response.body.errors);

		expect(1).toBe(0);
	});

	it("Should health check", async () => {
		await request(app).get("/healthcheck").expect(200);
	});
});

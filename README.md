# Executing the project

### Instaling dependencies

Required: Node v20.

```
npm install

```

### Configure your environment

Use the `.env.example` as reference to create your `.env` file.

### Creating a database instance

The project uses a Postgres v15 image in a docker container, to execute it, you must have docker installed

```
docker compose up postgres
```

This project uses drizzleORM, and to setup the database, you can run the npx command, don't forget to setup your `.env`:

```
npx drizzle-kit push
```

### Run a dev server

```
npm run dev
```

### Build to production

Before building to production, don't forget to update your `.env` file. Since your application will be running inside docker, the `localhost` of the application container won't be the same as your machine `localhost`. So a valid `DATABASE_URL` would be `DATABASE_URL=postgresql://myuser:mypassword@postgres/mydatabase`

```
npm run build
```

### Run the production build

```
docker compose up app
```

### Run the production build and the database

```
docker compose up
```

# API Documentation

Alternatively, you can use the `api-docs.json` in the root folder to import into your Postman client.

## Users

### Create User

- Endpoint: POST {{host}}/users
- Description: Creates a new user and its account
- Request body (JSON):

```json
{
  "name": "john",
  "email": "john@doe.com",
  "cpf": "12345678906",
  "password": "123qwe@ASD",
  "confirmPassword": "123qwe@ASD"
}
```

### Login

- Endpoint: POST {{url}}/auth/login
- Description: Logs in a user and retrieves a token.
- Request Body (JSON):

```json
{
  "email": "novo4@email.com",
  "password": "123qwe@ASD"
}
```

### Get account balance

- Endpoint: GET {{url}}/account/balance
- Description: Retrieves the account balance.
- Headers:
  - `Authorization`: "Bearer {{token}}"

### Deposit

- Endpoint: POST {{url}}/account/deposit
- Description: Deposits an amount into the account.
- Headers:
  - `Authorization`: "Bearer {{token}}"
- Request Body (JSON):

```json
{
  "amount": "300"
}
```

### Withdraw

- Endpoint: POST {{url}}/account/withdraw
- Description: Withdraws an amount from the account.
- Headers:
  - `Authorization`: "Bearer {{token}}"
- Request Body (JSON):

```json
{
  "amount": "1"
}
```

### Transfer

- Endpoint: POST {{url}}/account/transfer
- Description: Transfers an amount to another user.
- Headers:
  - `Authorization`: "Bearer {{token}}"
- Request Body (JSON):

```json
{
  "amount": "0",
  "recipientId": 9
}
```

### Transaction History

- Endpoint: GET {{url}}/account/history
- Description: Retrieves the transaction history for the account.
- Headers:
  - `Authorization`: "Bearer {{token}}"

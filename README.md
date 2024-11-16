# Executing the project

### Instaling dependencies

Required: Node v20.

```
npm install
```

### Creating a database instance

O projeto usa uma imagem do Postgres v15 num container docker, para executar é necessário ter o docker instalado na máquina:

The project uses a Postgres v15 image in a docker container, to execute it, you must have docker installed

```
docker compose up
```

### Run a dev server

```
npm run dev
```

### Build to production

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

### Configure your environment

Use de exemplo o arquivo na raiz do projeto `.env.example`

# API Documentation

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

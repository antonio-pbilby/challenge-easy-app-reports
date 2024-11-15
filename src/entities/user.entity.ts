export interface User {
  name: string;
  email: string;
  cpf: string;
  password: string;
  salt: string;
  // TODO adicionar createdAt/updatedAt/deletedAt
}
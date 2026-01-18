import axios from "axios";
import pgp from "pg-promise";

axios.defaults.validateStatus = () => true;

const connection = pgp()("postgresql://postgres:postgres@localhost:5433/app");

beforeAll(async () => {
  await connection.query("delete from trading_platform.account");
});

afterAll(async () => {
  await connection.$pool.end();
});

test("Deve criar uma conta com dados válidos", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@email.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const responseSignUp = await axios.post(
    "http://localhost:3000/signup",
    input
  );
  expect(responseSignUp.status).toBe(200);
  const outputSignUp = responseSignUp.data;
  expect(outputSignUp).toBeDefined();
  const responseGetAccount = await axios.get(
    `http://localhost:3000/accounts/${outputSignUp.accountId}`
  );
  expect(responseGetAccount.status).toBe(200);
  const outputGetAccount = responseGetAccount.data;
  expect(outputGetAccount.account_id).toBe(outputSignUp.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
  expect(outputGetAccount.password).toBe(input.password);
});

test("Não deve criar uma conta com nome sem sobrenome", async () => {
  const input = {
    name: "John",
    email: "john.doe@email.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const responseSignUp = await axios.post(
    "http://localhost:3000/signup",
    input
  );
  expect(responseSignUp.status).toBe(400);
});

test("Não deve criar uma conta com email inválido", async () => {
  const input = {
    name: "John Doe",
    email: "johndoeemail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const responseSignUp = await axios.post(
    "http://localhost:3000/signup",
    input
  );
  expect(responseSignUp.status).toBe(400);
});

test("Não deve criar uma conta com email repetido", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@email.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const responseSignUp1 = await axios.post(
    "http://localhost:3000/signup",
    input
  );
  expect(responseSignUp1.status).toBe(400);
});

test("Não deve criar uma conta com cpf inválido", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe.cpf@email.com",
    document: "07456321555",
    password: "asdQWE123",
  };

  const responseSignUp = await axios.post(
    "http://localhost:3000/signup",
    input
  );
  expect(responseSignUp.status).toBe(400);
});

test("Não deve criar uma conta com senha de menos 8 caracteres e sem letra maiúscula e número", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe.password@email.com",
    document: "97456321558",
    password: "asdQWE",
  };

  const responseSignUp = await axios.post(
    "http://localhost:3000/signup",
    input
  );
  expect(responseSignUp.status).toBe(400);
});
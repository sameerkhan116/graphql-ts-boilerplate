import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/testClient";

const email = "mom@mom.com";
const password = "masdsjadk";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
});

afterAll(async () => {
  conn.close();
});

const loginExpectError = async (
  client: any,
  e: string,
  p: string,
  errMsg: string,
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg,
      },
    ],
  });
};

describe("Login", () => {
  const client = new TestClient(process.env.TEST_HOST as string);

  test("Email not found.", async () => {
    await loginExpectError(
      client,
      "sophiya@soph.com",
      "sophiya",
      "Invalid login.",
    );
  });

  test("Email not confirmed.", async () => {
    await client.register(email, password);

    await loginExpectError(
      client,
      email,
      password,
      "Please confirm your email.",
    );
    await User.update({ email }, { confirmed: true });
    await loginExpectError(client, email, "aksdjkasj", "Invalid login.");

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});

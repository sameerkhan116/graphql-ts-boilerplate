import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/testClient";
import { confirmEmail, invalidLogin } from "../../errorMessages";

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
  test("Email not found.", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(client, "sophiya@soph.com", "sophiya", invalidLogin);
  });

  test("Email not confirmed.", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);
    await loginExpectError(client, email, password, confirmEmail);

    await User.update({ email }, { confirmed: true });
    await loginExpectError(client, email, "aksdjkasj", invalidLogin);

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});

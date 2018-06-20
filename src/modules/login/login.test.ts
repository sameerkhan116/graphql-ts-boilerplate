import { request } from "graphql-request";
import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";

const email = "mom@mom.com";
const password = "masdsjadk";

const registerMutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
});

afterAll(async () => {
  conn.close();
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p),
  );

  expect(response).toEqual({
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
    await loginExpectError("sophiya@soph.com", "sophiya", "Invalid login.");
  });

  test("Email not confirmed.", async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password),
    );

    await loginExpectError(email, password, "Please confirm your email.");
    await User.update({ email }, { confirmed: true });
    await loginExpectError(email, "aksdjkasj", "Invalid login.");

    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password),
    );

    expect(response).toEqual({ login: null });
  });
});

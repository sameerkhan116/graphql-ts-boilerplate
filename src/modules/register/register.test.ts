import { request } from "graphql-request";
import { Connection } from "typeorm";

import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLong,
  invalidEmail,
  passwordNotLong,
} from "./errorMessages";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
});

afterAll(async () => {
  conn.close();
});

const email = "sophiya@soph.com";
const password = "sophiya";

const mutation = (e: any, p: any) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

describe("Register user", async () => {
  test("Check for duplicate emails", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(email, password),
    );
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    const response2: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password),
    );
    expect(response2.register).toHaveLength(1);
    expect(response2.register).toEqual([
      {
        path: "email",
        message: duplicateEmail,
      },
    ]);
  });

  test("Check bad email", async () => {
    const response3: any = await request(
      process.env.TEST_HOST as string,
      mutation("b", password),
    );
    expect(response3).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLong,
        },
        {
          path: "email",
          message: invalidEmail,
        },
      ],
    });
  });

  test("Check bad password", async () => {
    const response4: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, "ad"),
    );
    expect(response4).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLong,
        },
      ],
    });
  });

  test("Check bad email and password", async () => {
    const response5: any = await request(
      process.env.TEST_HOST as string,
      mutation("df", "ad"),
    );
    expect(response5).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLong,
        },
        {
          path: "email",
          message: invalidEmail,
        },
        {
          path: "password",
          message: passwordNotLong,
        },
      ],
    });
  });
});

import { Connection } from "typeorm";

import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLong,
  invalidEmail,
  passwordNotLong,
} from "./errorMessages";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/testClient";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
});

afterAll(async () => {
  conn.close();
});

const email = "sophiya@soph.com";
const password = "sophiya";

describe("Register user", async () => {
  const client = new TestClient(process.env.TEST_HOST as string);

  test("Check for duplicate emails", async () => {
    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    const response2: any = await client.register(email, password);
    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register).toEqual([
      {
        path: "email",
        message: duplicateEmail,
      },
    ]);
  });

  test("Check bad email", async () => {
    const response3: any = await client.register("b", password);
    expect(response3.data).toEqual({
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
    const response4: any = await client.register(email, "ad");
    expect(response4.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLong,
        },
      ],
    });
  });

  test("Check bad email and password", async () => {
    const response5: any = await client.register("df", "ad");
    expect(response5.data).toEqual({
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

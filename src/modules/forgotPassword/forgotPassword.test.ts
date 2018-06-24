import Redis from "ioredis";
import { Connection } from "typeorm";

import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/testClient";
import { createForgotPassword } from "../../utils/createForgotPassword";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import {
  passwordNotLong,
  lockedAccount,
  expiredKey,
} from "../../errorMessages";

const email = "dad@dad.com";
const password = "daddy";
const newPassword = "somethingelse";

let userId: string;
const redis = new Redis();
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("Forgot password", () => {
  const client = new TestClient(process.env.TEST_HOST as string);

  test("Make sure it works", async () => {
    await forgotPasswordLockAccount(userId, redis);
    const url = await createForgotPassword("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: "email",
            message: lockedAccount,
          },
        ],
      },
    });

    expect(await client.forgotPasswordChange("a", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "newPassword",
            message: passwordNotLong,
          },
        ],
      },
    });

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null,
    });

    expect(await client.forgotPasswordChange("jsdjkashdkjkjs", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "key",
            message: expiredKey,
          },
        ],
      },
    });

    const response2 = await client.login(email, newPassword);
    expect(response2.data.login).toBeNull();
  });
});

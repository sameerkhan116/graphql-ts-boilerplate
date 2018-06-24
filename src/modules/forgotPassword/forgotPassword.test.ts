import Redis from "ioredis";
import { Connection } from "typeorm";

import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/testClient";
import { createForgotPassword } from "../../utils/createForgotPassword";

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
    const url = await createForgotPassword("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null,
    });

    const response2 = await client.login(email, newPassword);
    expect(response2.data.login).toBeNull();
  });
});

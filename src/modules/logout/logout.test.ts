import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/testClient";

const email = "sophiya@soph.com";
const password = "sophiya";
let userId: string;
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

describe("logout", () => {
  const client = new TestClient(process.env.TEST_HOST as string);

  test("Logging out a user", async () => {
    await client.login(email, password);
    const response = await client.me();
    expect(response.data.me).toEqual({
      id: userId,
      email,
    });

    await client.logout();
    const response2 = await client.me();
    expect(response2.data.me).toBeNull();
  });
});

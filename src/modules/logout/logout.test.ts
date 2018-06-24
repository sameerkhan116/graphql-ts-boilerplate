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
  test("Logging out from multiple sessions", async () => {
    const session1 = new TestClient(process.env.TEST_HOST as string);
    const session2 = new TestClient(process.env.TEST_HOST as string);

    await session1.login(email, password);
    await session2.login(email, password);

    expect(await session1.me()).toEqual(await session2.me());

    await session1.logout();
    expect(await session1.me()).toEqual(await session2.me());
  });

  test("Logging out a user in single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
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

import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/testClient";

let userId: string;
const email = "sophiya@soph.com";
const password = "sophiya";
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

describe("Me query.", () => {
  const client = new TestClient(process.env.TEST_HOST as string);

  test("Return null for no cookie.", async () => {
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });

  test("Get current user.", async () => {
    await client.login(email, password);
    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});

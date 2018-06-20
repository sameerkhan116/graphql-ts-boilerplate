import Redis from "ioredis";
import fetch from "node-fetch";
import { Connection } from "typeorm";

import { createConfirmEmail } from "./createConfirmEmail";
import { createTypeORMConnection } from "./createTypeORMConnection";
import { User } from "../entity/User";

let userId = "";
const redis = new Redis();
let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
  const user = await User.create({
    email: "mom@mom.com",
    password: "asikdjaksd",
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

test("Make sure it confirms user and clears key in redis.", async () => {
  const url = await createConfirmEmail(
    process.env.TEST_HOST as string,
    userId,
    redis,
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual("ok");

  const user = await User.findOne({ where: { id: userId } });
  expect((user as User).confirmed).toBeTruthy();

  const arr = url.split("/");
  const key = arr[arr.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});

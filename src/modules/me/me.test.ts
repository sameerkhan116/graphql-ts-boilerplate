import axios from "axios";
import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";

let userId = "";
const email = "sophiya@soph.com";
const password = "sophiya";

let conn: Connection;

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const meQuery = `
  {
    me {
      id
      email
    }
  }
`;

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
  // test("Can't get user if not logged in.", async () => {
  //   // later
  // });

  test("Get current user.", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password),
      },
      {
        withCredentials: true,
      },
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      },
    );

    expect(response.data.data.me).toEqual({
      id: userId,
      email,
    });
  });
});

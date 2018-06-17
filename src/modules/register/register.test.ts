import { request } from "graphql-request";

import { User } from "../../entity/User";
import { startServer } from "../../startServer";
import {
  duplicateEmail,
  emailNotLong,
  invalidEmail,
  passwordNotLong,
} from "./errorMessages";

let host = "";

beforeAll(async () => {
  const app = await startServer();
  const { port }: any = app.address();
  host = `http://127.0.0.1:${port}`;
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

test("Register user", async () => {
  const response = await request(host, mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  // test for duplicate emails
  const response2: any = await request(host, mutation(email, password));
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual({
    path: "email",
    message: duplicateEmail,
  });

  // catch bad email
  const response3: any = await request(host, mutation("b", password));
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

  // catch bad password
  const response4: any = await request(host, mutation(email, "ad"));
  expect(response4).toEqual({
    register: [
      {
        path: "password",
        message: passwordNotLong,
      },
    ],
  });

  // catch bad password and email
  const response5: any = await request(host, mutation("df", "ad"));
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

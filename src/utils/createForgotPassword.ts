import { v4 } from "uuid";
import { forgotPasswordPrefix } from "../constants";

export const createForgotPassword = async (
  url: string,
  userId: string,
  redis: any,
) => {
  const id = v4();
  await redis.set(`${forgotPasswordPrefix}${id}`, userId, "ex", 60 * 20);
  return `${url}/change-password/${id}`;
};

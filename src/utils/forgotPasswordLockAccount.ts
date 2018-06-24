import { Redis } from "ioredis";

import { removeUserSessions } from "./removeUserSessions";
import { User } from "../entity/User";

export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis,
) => {
  // prevent login
  await User.update({ id: userId }, { forgotPasswordLocked: true });
  // remove all sessions
  await removeUserSessions(userId, redis);
};

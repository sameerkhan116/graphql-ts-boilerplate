import { Redis } from "ioredis";
import { userSessionIDPrefix, sessionPrefix } from "../constants";

export const removeUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIDPrefix}${userId}`,
    0,
    -1,
  );

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < sessionIds.length; i++) {
    await redis.del(`${sessionPrefix}${sessionIds[i]}`);
  }
};

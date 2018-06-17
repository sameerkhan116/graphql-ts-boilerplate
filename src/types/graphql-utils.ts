import { Redis } from "../../node_modules/@types/ioredis";

export interface ResolverMap {
  [key: string]: {
    [key: string]: (
      parent: any,
      args: any,
      context: {
        redis: Redis;
        url: string;
      },
      info: any,
    ) => any;
  };
}

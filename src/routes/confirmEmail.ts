import { Request, Response } from "express";

import { User } from "../entity/User";
import { redis } from "../constants";

export const confirmEmail = async (req: Request, res: Response) => {
  const { uuid } = req.params;
  const id = await redis.get(uuid);
  if (id) {
    await User.update({ id }, { confirmed: true });
    await redis.del(uuid);
    res.send("ok");
  } else {
    res.send("invalid");
  }
};

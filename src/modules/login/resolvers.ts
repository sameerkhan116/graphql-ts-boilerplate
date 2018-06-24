import * as bcrypt from "bcryptjs";

import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { userSessionIDPrefix } from "../../constants";
import { confirmEmail } from "../../routes/confirmEmail";
import { lockedAccount, invalidLogin } from "../../errorMessages";

const errorResponse = [
  {
    path: "email",
    message: invalidLogin,
  },
];

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye",
  },
  Mutation: {
    login: async (_, { email, password }, { session, redis, req }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmail,
          },
        ];
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: lockedAccount,
          },
        ];
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse;
      }

      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${userSessionIDPrefix}${user.id}`, req.sessionID);
      }
      return null;
    },
  },
};

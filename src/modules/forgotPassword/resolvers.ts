import * as yup from "yup";
import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { User } from "../../entity/User";
import { createForgotPassword } from "../../utils/createForgotPassword";
import { noUser, expiredKey } from "../../errorMessages";
import { forgotPasswordPrefix } from "../../constants";
import { registerPasswordValidation } from "../../yupSchema";
import { formatYupError } from "../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    bye4: () => "Bye",
  },
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }, { redis }) => {
      const user = await User.findOne({ where: { email } });
      if (user) {
        await forgotPasswordLockAccount(user.id, redis);
        await createForgotPassword("", user.id, redis);
        return true;
      }
      return [
        {
          path: "email",
          message: noUser,
        },
      ];
    },
    forgotPasswordChange: async (_, { newPassword, key }, { redis }) => {
      const userId = await redis.get(`${forgotPasswordPrefix}${key}`);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKey,
          },
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const password = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password,
        },
      );

      const deleteKeyPromise = redis.del(`${forgotPasswordPrefix}${key}`);
      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    },
  },
};

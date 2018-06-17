import * as bcrypt from "bcryptjs";
import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import {
  duplicateEmail,
  emailNotLong,
  invalidEmail,
  passwordNotLong,
} from "./errorMessages";
import { createConfirmEmail } from "../../utils/createConfirmEmail";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLong)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(5, passwordNotLong)
    .max(255),
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url },
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail,
          },
        ];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword,
      });
      await user.save();

      await createConfirmEmail(url, user.id, redis);

      return null;
    },
  },
};

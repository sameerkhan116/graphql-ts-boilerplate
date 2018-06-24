import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import {
  duplicateEmail,
  emailNotLong,
  invalidEmail,
} from "../../errorMessages";
import { createConfirmEmail } from "../../utils/createConfirmEmail";
import { sendEmail } from "../../utils/sendEmail";
import { registerPasswordValidation } from "../../yupSchema";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLong)
    .max(255)
    .email(invalidEmail),
  password: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (_, args, { redis, url }) => {
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

      const user = User.create({
        email,
        password,
      });
      await user.save();

      await sendEmail(email, await createConfirmEmail(url, user.id, redis));

      return null;
    },
  },
};

import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    bye4: () => "Bye",
  },
  Mutation: {
    sendForgotPasswordEmail: (_, { email }, context) => {
      return;
    },
  },
};

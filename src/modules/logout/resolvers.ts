import { ResolverMap } from "../../types/graphql-utils";
import { removeUserSessions } from "../../utils/removeUserSessions";

export const resolvers: ResolverMap = {
  Query: {
    bye3: () => "bye",
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;
      if (userId) {
        removeUserSessions(userId, redis);
        return true;
      }
      return false;
    },
  },
};

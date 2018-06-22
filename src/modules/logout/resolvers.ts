import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    bye3: () => "bye",
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise(res =>
        session.destroy(err => {
          if (err) {
            console.log(err);
          }
          res(true);
        }),
      ),
  },
};

import { Resolver, GraphQLMiddleWareFunction } from "../types/graphql-utils";

export const createMiddleware = (
  middlewareFunc: GraphQLMiddleWareFunction,
  resolverFunc: Resolver,
) => (parent: any, args: any, context: any, info: any) =>
  middlewareFunc(resolverFunc, parent, args, context, info);

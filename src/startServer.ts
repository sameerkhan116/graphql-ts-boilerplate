import { GraphQLServer } from "graphql-yoga";

import { redis } from "./redis";

import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
    }),
  });

  server.express.get("/confirm/:uuid", confirmEmail);

  await createTypeORMConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log(`Server is running on http://localhost:4000`);

  return app;
};

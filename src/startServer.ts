import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";

import { redis } from "./redis";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";

const SESSION_SECRET = "asdjkalsdj";
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
      session: request.session,
    }),
  });

  server.express.use(
    session({
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: redis as any,
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_NEV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : process.env.FRONTEND_HOST,
  };

  server.express.get("/confirm/:uuid", confirmEmail);

  await createTypeORMConnection();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log(`Server is running on http://localhost:4000`);

  return app;
};

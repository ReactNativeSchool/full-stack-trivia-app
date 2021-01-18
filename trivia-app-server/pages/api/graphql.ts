import { ApolloServer } from "apollo-server-micro";
import jwt from "jsonwebtoken";

import { typeDefs } from "../../graphql/schemas";
import { resolvers } from "../../graphql/resolvers";

interface IContext {
  userId?: string;
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const context: IContext = {};

    if (req?.headers?.authorization) {
      const [, token] = req.headers.authorization.split("Bearer ");

      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      context.userId = decoded._id;
    }

    return context;
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });

import { AuthenticationError, ApolloServer } from "apollo-server-micro";
import jwt from "jsonwebtoken";

import { typeDefs } from "../../graphql/schemas";
import { resolvers } from "../../graphql/resolvers";
import { User } from "../../models/User";
import { connectMongo } from "../../util/dbConnect";

interface IContext {
  user?: {
    username: string;
    roles: [string];
  };
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Is this the right place to do this?
    await connectMongo();

    const context: IContext = {};

    if (req?.headers?.authorization) {
      const [, token] = req.headers.authorization.split("Bearer ");

      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findOne({ _id: decoded._id });

      if (!user) {
        throw new AuthenticationError("Invalid user.");
      }

      context.user = user;
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

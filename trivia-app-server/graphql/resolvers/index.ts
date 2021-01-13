import { connectMongo } from "../../util/dbConnect";
import { User } from "../../models/User";

export const resolvers = {
  Query: {
    quiz: () => {
      return fetch("https://opentdb.com/api.php?amount=10")
        .then((res) => res.json())
        .then((res) => res.results);
    },
  },

  Mutation: {
    register: async (parent, args) => {
      await connectMongo();

      try {
        const user = await new User({ username: args.username }).save();

        return {
          user,
          errors: [],
        };
      } catch (error) {
        return {
          user: null,
          errors: [{ message: "Something went wrong..." }], // TODO: handle errors
        };
      }
    },
  },
};

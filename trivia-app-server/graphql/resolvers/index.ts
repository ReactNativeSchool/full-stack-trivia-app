import jwt from "jsonwebtoken";

import { connectMongo } from "../../util/dbConnect";
import { User } from "../../models/User";

export const resolvers = {
  Query: {
    quiz: (parent, args, context) => {
      let url = "https://opentdb.com/api.php?amount=10";
      if (!context.userId) {
        url = "https://opentdb.com/api.php?amount=1";
      }

      return fetch(url)
        .then((res) => res.json())
        .then((res) => res.results);
    },
  },

  Mutation: {
    register: async (parent, args) => {
      await connectMongo();

      const { username, password } = args;

      const user = await new User({ username, password }).save();

      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

      return {
        username: user.username,
        token,
        errors: [],
      };
    },
    signin: async (parent, args) => {
      await connectMongo();

      const { username, password } = args;

      const user = await User.findOne({ username }).exec();

      if (!user) {
        throw new Error("No user exists with that username.");
      }

      const { isMatch } = await user.comparePasswords(password);

      let token = null;
      if (isMatch) {
        token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      }

      if (!isMatch) {
        throw new Error("Invalid password.");
      }

      return {
        username: username,
        token,
        errors: [],
      };
    },
  },
};

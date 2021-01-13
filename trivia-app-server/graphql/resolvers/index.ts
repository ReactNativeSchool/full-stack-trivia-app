import jwt from "jsonwebtoken";

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
        const { username, password } = args;

        const user = await new User({ username, password }).save();

        const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        return {
          username: user.username,
          token,
          errors: [],
        };
      } catch (error) {
        return {
          username: null,
          token: null,
          errors: [{ message: error.message || "Something went wrong..." }],
        };
      }
    },
    signin: async (parent, args) => {
      await connectMongo();

      try {
        const { username, password } = args;

        const user = await User.findOne({ username }).exec();

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
      } catch (error) {
        return {
          username: null,
          token: null,
          errors: [{ message: error.message || "Something went wrong..." }],
        };
      }
    },
  },
};

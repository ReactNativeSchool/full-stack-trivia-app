import jwt from "jsonwebtoken";

import { connectMongo } from "../../util/dbConnect";
import { User } from "../../models/User";
import { Question } from "../../models/Question";

const requireAuth = (context) => {
  if (!context.userId) {
    throw new Error("Authentication required.");
  }

  return;
};

export const resolvers = {
  Query: {
    quiz: async (parent, args, context) => {
      await connectMongo();

      const questions = await Question.find({}, null, { limit: 3 }).exec();

      return questions;
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

    fetchQuestions: async (parent, args, context) => {
      await connectMongo();

      requireAuth(context);

      // TODO: this should be limited to people with an admin role

      const res = await fetch("https://opentdb.com/api.php?amount=50");
      const { results } = await res.json();

      const formattedResults = results.map((result) => {
        return {
          ...result,
          question: unescape(result.question),
          answers: [
            {
              answer: result.correct_answer,
              correct: true,
            },
            ...result.incorrect_answers.map((ans) => ({
              answer: ans,
              correct: false,
            })),
          ],
        };
      });

      const inserRes = await Question.insertMany(formattedResults);

      return { questionsSaved: inserRes.length };
    },
  },
};

import jwt from "jsonwebtoken";
import { isBoolean, shuffle, unescape } from "lodash";
import mongoose from "mongoose";
import {
  AuthenticationError,
  UserInputError,
  ApolloError,
} from "apollo-server-micro";

import { User } from "../../models/User";
import { Question } from "../../models/Question";

const requireAuth = async (context) => {
  if (!context.user) {
    throw new AuthenticationError("Authentication required.");
  }

  return;
};

const ROLES = {
  admin: "admin",
};

export const resolvers = {
  Query: {
    question: async (parent, args, context) => {
      // If an authenticated user get a question they haven't answered before.
      let questionsAlreadyAsked = [];
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id });
        if (user) {
          questionsAlreadyAsked = [
            ...user.correctQuestions.map((_id) => mongoose.Types.ObjectId(_id)),
            ...user.incorrectQuestions.map((_id) =>
              mongoose.Types.ObjectId(_id)
            ),
          ];
        }
      }

      const questions = await Question.aggregate([
        {
          $match: { _id: { $nin: questionsAlreadyAsked } },
        },
        {
          $sample: { size: 1 },
        },
      ]);

      if (questions.length === 0) {
        throw new ApolloError("Sorry, you've answered all of the questions.");
      }

      const question = {
        ...questions[0],
        answers: shuffle(questions[0].answers),
      };

      return question;
    },

    me: async (parent, args, context) => {
      requireAuth(context);

      const user = await User.findOne({ _id: context.user._id });

      const questionsAnsweredCorrectly = user.correctQuestions?.length || 0;
      const questionsAnswered =
        questionsAnsweredCorrectly + user.incorrectQuestions?.length || 0;

      return {
        username: user.username,
        stats: {
          questionsAnswered,
          questionsAnsweredCorrectly,
        },
      };
    },
  },

  Mutation: {
    register: async (parent, args) => {
      const { username, password } = args;

      const user = await new User({ username, password }).save();

      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

      return {
        username: user.username,
        token,
      };
    },
    signin: async (parent, args) => {
      const { username, password } = args;

      const user = await User.findOne({ username }).exec();

      if (!user) {
        throw new UserInputError("Invalid username.");
      }

      const { isMatch } = await user.comparePasswords(password);

      let token = null;
      if (isMatch) {
        token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      }

      if (!isMatch) {
        throw new UserInputError("Invalid password.");
      }

      return {
        username: username,
        token,
      };
    },

    fetchQuestions: async (parent, args, context) => {
      requireAuth(context);

      if (!context.user.roles.includes(ROLES.admin)) {
        throw new AuthenticationError("You're not authorized to do that.");
      }

      const res = await fetch("https://opentdb.com/api.php?amount=3");
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

    completeQuestion: async (parent, args, context) => {
      requireAuth(context);

      if (!args.questionId) {
        throw new UserInputError("No question specified.");
      }

      if (!isBoolean(args.correct)) {
        throw new UserInputError("Invalid input for correct.");
      }

      const question = await Question.findOne({ _id: args.questionId });
      if (!question) {
        throw new UserInputError("Invalid question ID.");
      }

      let modifier;

      if (args.correct) {
        modifier = { correctQuestions: args.questionId };
      } else {
        modifier = { incorrectQuestions: args.questionId };
      }

      const response = await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          // Use $addToSet over $push to avoid duplicates
          $addToSet: modifier,
        },
        {
          new: true,
        }
      );

      const questionsAnsweredCorrectly = response.correctQuestions?.length || 0;
      const questionsAnswered =
        questionsAnsweredCorrectly + response.incorrectQuestions?.length || 0;

      return {
        questionsAnswered,
        questionsAnsweredCorrectly,
      };
    },
  },
};

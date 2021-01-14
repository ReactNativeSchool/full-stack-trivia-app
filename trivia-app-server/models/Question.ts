import * as mongoose from "mongoose";

type Answer = {
  answer: string;
  correct: boolean;
};

interface IQuestion extends mongoose.Document {
  question: string;
  category: string;
  difficulty: string;
  answers: Array<Answer>;
}

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    unique: true,
  },
  category: String,
  difficulty: String,
  answers: [
    {
      answer: String,
      correct: Boolean,
    },
  ],
});

export const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

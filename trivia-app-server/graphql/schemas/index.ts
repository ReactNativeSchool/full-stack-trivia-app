import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  type Question {
    category: String
    type: String
    difficulty: String
    question: String
    correct_answer: String
    incorrect_answers: [String]
  }

  type Query {
    quiz: [Question]
  }
`;

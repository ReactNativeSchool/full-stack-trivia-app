import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  type Query {
    quiz: [Question]
  }

  type Mutation {
    register(username: String!, password: String!): UserResponse
    signin(username: String!, password: String!): UserResponse
    fetchQuestions: FetchQuestionResponse
  }

  type FetchQuestionResponse {
    questionsSaved: Int
  }

  type Question {
    category: String
    type: String
    difficulty: String
    question: String
    answers: [QuestionAnswer]
  }

  type QuestionAnswer {
    correct: Boolean
    answer: String
  }

  type UserResponse {
    username: String
    token: String
    errors: [Error]
  }

  type Error {
    message: String
  }
`;

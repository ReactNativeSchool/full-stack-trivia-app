import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  type Query {
    quiz: [Question]
  }

  type Mutation {
    register(username: String!): UserResponse
  }

  type Question {
    category: String
    type: String
    difficulty: String
    question: String
    correct_answer: String
    incorrect_answers: [String]
  }

  type User {
    _id: ID
    username: String
  }

  type UserResponse {
    user: User
    errors: [Error]
  }

  type Error {
    message: String
  }
`;

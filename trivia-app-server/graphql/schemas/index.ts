import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  type Query {
    question: Question # a random question. If authed one they haven't answered before
    me: User # the current user's profile info and stats. Requires auth.
    # NOT MVP
    # quiz: [Question] # defined collection of questions. Requires auth
  }

  type Mutation {
    register(user: NewUser): AuthResponse
    signin(username: String!, password: String!): AuthResponse
    fetchQuestions: FetchQuestionResponse
    completeQuestion(questionId: String!, correct: Boolean): Stats # call when answering a random question so it isn't displayed again (if authorized). Returns user's latest stats
    # Not MVP
    # completeQuiz: Stats # call when a quiz is completed so it isn't displayed again. Returns user's latest stats
  }

  input NewUser {
    username: String
    password: String!
  }

  type FetchQuestionResponse {
    questionsSaved: Int
  }

  type Question {
    _id: String
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

  type AuthResponse {
    username: String
    token: String
  }

  type User {
    username: String
    stats: Stats
  }

  type Stats {
    questionsAnswered: Int
    questionsAnsweredCorrectly: Int
  }
`;

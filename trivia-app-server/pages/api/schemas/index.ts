import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  type ExampleResponse {
    message: String
  }

  type Query {
    greet: ExampleResponse
  }
`;

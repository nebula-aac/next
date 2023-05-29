import gql from 'graphql-tag';

export const typeDefs = gql`
    type User @exclude(operations: [CREATE, UPDATE, DELETE]) {
        username: String
        created: DateTime
        karma: Int
        about: String
        avatar: String
        articles: [Article!]! @relationship(type: "SUBMITTED", direction: OUT)
        invited: [User!]! @relationship(type: "INVITED_BY", direction: IN)
        invited_by: [User!]! @relationship(type: "INVITED_BY", direction: OUT)
    }

    type Article @exclude(operations: [CREATE, UPDATE, DELETE]) {
        id: ID
        url: String
        score: Int
        title: String
        comments: String
        created: DateTime
        user: User @relationship(type: "SUBMITTED", direction: IN)
        tags: [Tag!]! @relationship(type: "HAS_TAG", direction: OUT)
    }

    type Tag @exclude(operations: [CREATE, UPDATE, DELETE]) {
        name: String
        articles: [Article!]! @relationship(type: "HAS_TAG", direction: IN)
    }
`;
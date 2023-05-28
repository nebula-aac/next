import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Neo4jGraphQL } from "@neo4j/graphql";
import gql from "graphql-tag";
import neo4j from "neo4j-driver";

const typeDefs = gql`
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

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const neoSchema = new Neo4jGraphQL({typeDefs, driver});

const resolvers = {
    Query: {
        getUser: () => {
            return {
                id: "Foo",
            };
        },
    },
};

const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
    introspection: true,
});

export default startServerAndCreateNextHandler(server);
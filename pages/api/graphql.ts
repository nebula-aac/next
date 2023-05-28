import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Neo4jGraphQL } from "@neo4j/graphql";
import gql from "graphql-tag";
import neo4j from "neo4j-driver";
import allowCors from "@/utils/cors";

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

const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
    introspection: true,
    plugins: [
        process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({
            footer: false,
        }) : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ],
    formatError: (formattedError, error) => {
        if (
            formattedError.extensions?.code ===
            ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
        ) {
            return {
                ...formattedError,
                message: "Your query doesn't match the scehma. Try double-checking it!",
            };
        }
        return formattedError;
    }
});

const handler = startServerAndCreateNextHandler(server, {
    context: async (req, res) => ({ req, res }),
});

export default allowCors(handler);
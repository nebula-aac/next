import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import gql from "graphql-tag";

const typeDefs = gql`
    type User {
        id: ID
    }

    type Query {
        getUser: User
    }
`;

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
    resolvers,
    typeDefs,
    plugins: []
});
// await server.start();

export default startServerAndCreateNextHandler(server);
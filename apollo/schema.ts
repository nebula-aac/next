import getDriver from "@/utils/neo4j";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { typeDefs } from "./type-defs";

const driver = getDriver();

export const neoSchema = new Neo4jGraphQL({
    typeDefs,
    driver
})
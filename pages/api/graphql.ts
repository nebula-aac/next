import {ApolloServer} from '@apollo/server';
import {ApolloServerErrorCode} from '@apollo/server/errors';
import {ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault} from '@apollo/server/plugin/landingPage/default';
import {startServerAndCreateNextHandler} from '@as-integrations/next';
import {type NextApiRequest, type NextApiResponse} from 'next';

import {neoSchema} from '@/apollo/schema';
import allowCors from '@/utils/cors';

const server = new ApolloServer({
	schema: await neoSchema.getSchema(),
	introspection: true,
	plugins: [
		process.env.NODE_ENV === 'production'
			? ApolloServerPluginLandingPageProductionDefault({
				footer: false,
			}) : ApolloServerPluginLandingPageLocalDefault({footer: false}),
	],
	formatError(formattedError, error) {
		if (
			formattedError.extensions?.code
            === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
		) {
			return {
				...formattedError,
				message: 'Your query doesn\'t match the scehma. Try double-checking it!',
			};
		}

		return formattedError;
	},
});

const nextHandler = startServerAndCreateNextHandler(server, {
	context: async (req: NextApiRequest, res: NextApiResponse) => ({req, res}),
});

const handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> = async (
	req: NextApiRequest,
	res: NextApiResponse,
) => {
	await nextHandler(req, res);
};

export default allowCors(handler);

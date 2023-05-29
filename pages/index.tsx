import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import dynamic from 'next/dynamic';
import {uniqBy} from 'rambda';
import {useState} from 'react';

const NoSsrForceGraph = dynamic(async () => import('../lib/NoSsrForceGraph'), {
	ssr: false,
});

const mostRecentQuery = gql`
  {
    articles(options: { limit: 30, sort: { created: DESC } }) {
      __typename
      id
      url
      title
      created
      tags {
        __typename
        name
      }
      user {
        username
        avatar
        __typename
      }
    }
  }
`;

export type Article = {
	id: string;
	url: string;
	__typename: string;
	title: string;
	user: User;
	tags: Tag[];
};

type User = {
	id: string;
	username: string;
	avatar: string;
	__typename: string;
};

type Tag = {
	id: string;
	name: string;
	__typename: string;
};

type Node = Article | User | Tag;
type Link = {source: string; target: string};

type FormattedData = {
	// Nodes: Array<User | Tag | Article | Tag[]>;
	// links: Array<{source: string; target: string}>;
	nodes: Node[];
	links: Link[];
};

const formatData = (data: {articles?: Article[] | undefined}): FormattedData | undefined => {
	// Const nodes: Array<Article | User | Tag> = [];
	// const links: Array<{source: string; target: string}> = [];
	const nodes: Node[] = [];
	const links: Link[] = [];

	if (!data.articles) {
		return {nodes, links};
	}

	data.articles.forEach((a: Article) => {
		const {id, url, __typename, title, user, tags} = a;
		nodes.push({
			id,
			url,
			__typename,
			title,
			user,
			tags,
		});

		links.push({
			source: user.username,
			target: id,
		});

		tags.forEach((t: Tag) => {
			const {name, __typename} = t;
			nodes.push({
				id: name,
				url,
				title,
				__typename,
				user,
				tags,
			});
			links.push({
				source: id,
				target: name,
			});
		});

		const {username, avatar, __typename: userTypename} = user;
		nodes.push({
			id: username,
			url,
			title,
			avatar,
			__typename: userTypename,
			user,
			tags,
		});
	});

	const uniqueNodes = uniqBy((item: Node) => item.id, nodes);

	return {
		nodes: uniqueNodes,
		links,
	};
};

type QueryData = {
	articles?: Article[];
};

export default function Home() {
	const [graphData, setGraphData] = useState<FormattedData | undefined>({
		nodes: [],
		links: [],
	});

	const {data} = useQuery<QueryData>(mostRecentQuery, {
		onCompleted(data): void {
			setGraphData(formatData(data));
		},
	});

	return (
		<NoSsrForceGraph
			graphData={graphData ?? {nodes: [], links: []}}
			linkTarget=''
			nodeLabel={node => String(node.id)}
			nodeAutoColorBy={'__typename'}
			nodeRelSize={8}
		/>
	);
}


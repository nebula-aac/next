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
	id?: string;
	url: string;
	__typename: string;
	title: string;
	user: User;
	tags: Tag[];
};

type User = {
	id?: string;
	username: string;
	avatar?: string;
	__typename: string;
};

type Tag = {
	id?: string;
	name: string;
	__typename: string;
};

type Node = Article | User | Tag;
type Link = {source: string; target: string};

type FormattedData = {
	nodes: Node[];
	links: Link[];
};

const formatData = (data: {articles?: Article[] | undefined}): FormattedData | undefined => {
	const nodes: Node[] = [];
	const links: Link[] = [];

	if (!data.articles) {
		return {nodes, links};
	}

	data.articles.forEach((a: Article) => {
		console.log('Processing article:', a);

		const {url, __typename, title, user, tags} = a;
		const id = a?.id ?? url;
		console.log('ID assigned:', id);

		if (!nodes.some(node => node.id === id)) {
			nodes.push({
				id,
				url,
				__typename,
				title,
				user,
				tags,
			});
		}

		console.log('Link being created with source:', user?.username, 'and target:', id);

		links.push({
			source: user.username,
			target: id,
		});
		console.log('Link created:', {source: user.username, target: id});

		tags.forEach((t: Tag) => {
			console.log('Processing tag:', t);

			const {name, __typename} = t;
			console.log('Tag name assigned as id:', name);

			if (!nodes.some(node => node.id === name)) {
				nodes.push({
					id: name,
					url,
					title,
					__typename,
					user,
					tags,
				});
			}

			console.log('Link being created with source:', id, 'and target:', name);

			links.push({
				source: id,
				target: name,
			});
			console.log('Link created:', {source: id, target: name});
		});

		const {username, avatar, __typename: userTypename} = user;
		console.log('User username assigned as id:', username);

		if (!nodes.some(node => node.id === username)) {
			nodes.push({
				id: username,
				url,
				title,
				avatar,
				__typename: userTypename,
				user,
				tags,
			});
		}
	});

	console.log('Final nodes:', nodes);
	console.log('Final links:', links);

	const uniqueNodes = uniqBy((item: Node) => item.id, nodes);

	// Find orphaned links
	const nodeIds = new Set(uniqueNodes.map(node => node.id));
	const orphanedLinks = links.filter(link => !nodeIds.has(link.source) || !nodeIds.has(link.target));
	if (orphanedLinks.length > 0) {
		console.error('Orphaned links found:', orphanedLinks);
	}

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
			nodeLabel={'id'}
			nodeAutoColorBy={'__typename'}
			nodeRelSize={8}
		/>
	);
}


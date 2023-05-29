import {type LazyQueryResult, useLazyQuery, useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import dynamic from 'next/dynamic';
import {uniqBy} from 'rambda';
import {useState} from 'react';

import {type Article, type FormattedData, type Link, type Node, type QueryData, type Tag} from '@/types';

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

const moreArticlesQuery = gql`
	query articlesByTag($tag: String) {
		articles(
		where: { tags_SOME: { name: $tag } }
		options: { limit: 10, sort: { created: DESC } }
		) {
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
				id: a.id,
				url: a.url,
				__typename: a.__typename,
				title: a.title,
				user: a.user,
				tags: a.tags,
			});
		}

		console.log('Link being created with source:', a.user?.username, 'and target:', a.id);

		links.push({
			source: a.user?.username,
			target: a.id,
		});
		console.log('Link created:', {source: a.user?.username, target: a.id});

		tags.forEach((t: Tag) => {
			console.log('Processing tag:', t);

			const {name, __typename} = t;
			console.log('Tag name assigned as id:', t.name);

			if (!nodes.some(node => node.id === name)) {
				nodes.push({
					id: t.name,
					url: a.url,
					__typename: t.__typename,
					title: a.title,
					user: a.user,
					tags: a.tags,
				});
			}

			console.log('Link being created with source:', a?.id, 'and target:', t.name);

			links.push({
				source: a.id,
				target: t.name,
			});
			console.log('Link created:', {source: a?.id, target: t.name});
		});

		const {username, avatar, __typename: userTypename} = user;
		console.log('User username assigned as id:', username);

		if (!nodes.some(node => node.id === username)) {
			nodes.push({
				id: a.user.username,
				url: a.url,
				title: a.title,
				avatar: a.user.avatar,
				__typename: a.user.__typename,
				user: a.user,
				tags: a.tags,
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

export default function Home() {
	const [graphData, setGraphData] = useState<FormattedData | undefined>({
		nodes: [],
		links: [],
	});

	const {error, loading, data} = useQuery<QueryData>(mostRecentQuery, {
		onCompleted(data): void {
			setGraphData(formatData(data));
		},
	});

	/*
	Const [
		loadMoreArticles,
		{called, loading, data: newData},
	]: [
		(variables?: {tag: string} | undefined) => void,
		{called: boolean; loading: boolean; data?: any},
	] = useLazyQuery<any, {tag: string}>(
		moreArticlesQuery,
		{
			variables: {tag: ''},
			onCompleted(data) {
				const newSubgraph = formatData(data);
				setGraphData(prevData => {
					if (prevData) {
						return {
							nodes: uniqBy((node: Node) => node.id, [
								...(prevData?.nodes ?? []),
								...(newSubgraph?.nodes ?? []),
							]),
							links: [
								...(prevData.links ?? []),
								...(newSubgraph?.links ?? []),
							],
						};
					}

					return prevData;
				});
			},
		},
	);
	*/
	const [loadMoreArticles] = useLazyQuery(moreArticlesQuery);

	if (loading) {
		return 'Loading...';
	}

	if (error) {
		return `Error! ${error.message}`;
	}

	return (
		<NoSsrForceGraph
			graphData={graphData}
			linkTarget=''
			nodeLabel={'id'}
			nodeAutoColorBy={'__typename'}
			nodeRelSize={8}
			onNodeClick={(node, event) => {
				console.log('You cliked me!');
				console.log(node);
				if (node.__typename === 'Tag') {
					console.log('Load more articles');
					void loadMoreArticles({variables: {tag: node.id}});
				} else if (node.__typename === 'Article') {
					window.open(node.url as string, '_blank');
				}
			}}
		/>
	);
}

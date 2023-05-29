export type Article = {
	id: string;
	url: string;
	__typename: string;
	title: string;
	user: User;
	tags: Tag[];
};

export type User = {
	id: string;
	username: string;
	avatar?: string;
	__typename: string;
};

export type Tag = {
	id: string;
	name: string;
	__typename: string;
};

export type Node = Article | User | Tag;
export type Link = {source: string; target: string};

export type FormattedData = {
	nodes: Node[];
	links: Link[];
};

export type QueryData = {
	articles?: Article[];
};
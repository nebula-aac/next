module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	settings: {
		'import/resolver': {
			typescript: {
				project: './tsconfig.json',
			},
		},
	},
	extends: [
		'plugin:react/recommended',
		'plugin:import/typescript',
		'xo',
		'next/core-web-vitals'
	],
	overrides: [
		{
			extends: [
				'xo-typescript',
			],
			files: [
				'*.ts',
				'*.tsx',
			],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: [
		'react',
	],
	rules: {
		'new-cap': [0],
		'@typescript-eslint/no-unsafe-assignment': [1],
		'@typescript-eslint/no-unsafe-argument': [1],
		'import/no-unresolved': [2],
		'import/order': [
			'error',
			{
				groups: [
					'builtin',
					'external',
					'internal',
					['sibling', 'parent'],
					'index',
					'unknown',
				],
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
		'sort-imports': [
			'error',
			{
				ignoreCase: false,
				ignoreDeclarationSort: true, // don"t want to sort import lines, use eslint-plugin-import instead
				ignoreMemberSort: false,
				memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
				allowSeparatedGroups: true,
			}
		]
	},
};

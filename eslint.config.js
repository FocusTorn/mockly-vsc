/* eslint-disable import/newline-after-import */
/* eslint-disable antfu/consistent-list-newline */

// import tf from './.eslint/eslint-torn-focus/index.js'
// import eslintPluginPrettier from 'eslint-plugin-prettier'
// import prettierConfig from 'eslint-config-prettier'; // Import the config
// import eslintTornFocus from './.eslint/eslint-torn-focus/index.js' // Import your plugin

import { //>
	combine,
	comments,
	ignores,
	imports,
	javascript,
	jsdoc,
	// jsonc,
	// markdown,
	node,
	// sortPackageJson,
	// sortTsconfig,
	stylistic,
	toml,
	typescript,
	unicorn,
	// vue,
	yaml,
} from '@antfu/eslint-config' //<

const focusTornConfig = {
	name: 'focus-torn',
	rules: {
		//= BASE ============================================================================================== 
		'comma-spacing': ['error', { before: false, after: true }],
		'no-extra-semi': 'error',
		'space-in-parens': ['warn', 'never'],
		//- OFF ------------------------------------
		'license-header/header': 'off',
		'license/unknown': 'off',
		'no-console': 'off',
		'no-unused-vars': 'off',
		'require-resolve-not-external': 'off',

        
        
        
		//= ANTFU =============================================================================================
		'antfu/curly': 'off',

		//= ESLINT-PLUGIN-IMPORT ==============================================================================
		// 'import/newline-after-import': ['error', { count: 1, exactCount: true, considerComments: true }],

		//= JSONC ============================================================================================= 
		// 'jsonc/indent': ['warn', 4],
        
		//= STYLISTIC =========================================================================================
		'style/indent': ['warn', 'tab'], // For spaces ['warn', 4],
		'style/no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'style/no-multiple-empty-lines': ['warn', { max: 10, maxBOF: 1 }],
		
		'style/no-trailing-spaces': ['warn', { skipBlankLines: true, ignoreComments: true }],
		'style/padded-blocks': ['error', { blocks: 'end', classes: 'always' }, { allowSingleLineBlocks: true }],
		'style/semi': ['error', 'never'],
        
		//- STYLE / JS -----------------------------
		'operator-linebreak': ['error', 'before'],
		//- OFF ------------------------------------
		'style/lines-between-class-members': 'off',
		'style/max-statements-per-line': 'off',
		'style/no-tabs': 'off',
		'style/spaced-comment': 'off',
        
		//= UNICORN ===========================================================================================
		'unicorn/prefer-node-protocol': 'off',

		//= ESLINT-PLUGIN-UNUSED-IMPORTS ====================================================================== 
		'unused-imports/no-unused-imports': 'off',
		'unused-imports/no-unused-vars': ['warn', //>
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		], //<

		//= TORN-FOCUS ======================================================================================== 
		// 'tf/max-len-autofix': [ 'error', { code: 115, }, ],
		// 'torn/padding-between': [ 0, //'warn', //>

		//     { blankLine: ['always', 2], prev: '*', next: '' },
		//     { blankLine: ['always', 0], prev: 'import', next: '' },

		//     { blankLine: ['always', 0], prev: 'import', next: 'import' },

		// //     // Imports
		// //     { blankLine: ['always', 1], prev: 'import', next: '*' },
		// //     { blankLine: ['always', 1], prev: '*', next: 'import' },
		// //     { blankLine: ['always', 0], prev: 'import', next: 'import' },

		// //     // Exports
		// //     { blankLine: ['always', 3], prev: 'export', next: '*' },
		// //     { blankLine: ['always', 3], prev: '*', next: 'export' },
		// //     { blankLine: ['always', 3], prev: 'singleline-export', next: 'singleline-export' },

		// //     // Constants
		// //     { blankLine: ['always', 1], prev: '*', next: 'const' },
		// //     { blankLine: ['always', 1], prev: 'const', next: '*' },
		// //     { blankLine: ['always', 0], prev: 'const', next: 'const' },
		// //     // { blankLine: ['always', 0], prev: 'singleline-const', next: 'singleline-const' },

		// //     { blankLine: ['always', 1], prev: '*', next: 'export const' },
		// //     { blankLine: ['always', 1], prev: 'export const', next: '*' },
		// //     // { blankLine: ['always', 0], prev: 'singleline-export const', next: 'singleline-export const' },

		// //     // Let
		// //     { blankLine: ['always', 1], prev: '*', next: 'let' },
		// //     { blankLine: ['always', 1], prev: 'let', next: '*' },
		// //     { blankLine: ['always', 0], prev: 'let', next: 'const' },
		// //     { blankLine: ['always', 0], prev: 'const', next: 'let' },
		// //     { blankLine: ['always', 0], prev: 'let', next: 'let' },

		// ],

		// // // Type
		// // { blankLine: "always", prev: "*", next: "type" },
		// // { blankLine: "always", prev: "type", next: "*" },
		// // { blankLine: "always", prev: "type", next: "type" },
		// // { blankLine: "always", prev: "export type", next: "*" },
		// // { blankLine: "always", prev: "*", next: "export type" },
		// // // Enums
		// // { blankLine: "always", prev: "*", next: "export const enum" },
		// // { blankLine: "always", prev: "export const enum", next: "*" },
		// // // Interface
		// // { blankLine: "always", prev: "export interface", next: "*" },
		// // { blankLine: "always", prev: "*", next: "export interface" },
		// // // Function
		// // { blankLine: "always", prev: "*", next: "function" },
		// // { blankLine: "always", prev: "function", next: "*" },
		// // // If
		// // { blankLine: "always", prev: "*", next: "if" },
		// // { blankLine: "always", prev: "if", next: "*" },
		// // { blankLine: "never", prev: "singleline-if", next: "singleline-if" },
		// // // For
		// // { blankLine: "always", prev: "*", next: "for" },
		// // { blankLine: "always", prev: "for", next: "*" },
		// // // Switch
		// // { blankLine: "always", prev: "*", next: "switch" },
		// // // Returns
		// // { blankLine: "always", prev: "*", next: "return" },
		// // { blankLine: "never", prev: "return", next: "case" },

		// // //<
        
	},

	plugins: {
		// 'tf': eslintTornFocus,
		// prettier: eslintPluginPrettier,
		// torn: tf
	},

	ignores: [
		'**/node_modules/**/*',
		'**/out/**/*',
		'**/dist/**/*',
		'**/**/*.md',

		'**/*test*/**/*',
		'**/**/*.model.*',

		'**/*removed*/**/*',

		'**/*X_____*.*',
		'**/*X_____*/*.*',
		'**/*_____X*.*',
		'**/*_____X*/*.*',
	],

}
const focusTornRules = focusTornConfig.rules

export default combine(
	//> COMBOS
	ignores(),
	javascript(),
	comments(),
	node(),
	jsdoc(),
	imports(),
	unicorn(),
	typescript(),
	stylistic(),
	// vue(),
	// jsonc(),
	yaml(),
	toml(),
	// markdown(),

	//<

	{ name: 'focus-torn',
		rules: {
			...focusTornRules,

			// 'torn/rule-wrap': [ //>
			//     'warn',
			//     {
			//         groups: {
			//             testScenario: { //>
			//                 rules: {
			//                     'no-console': 'off',
			//                     'comma-spacing': 'off',
			//                 },
			//             }, //<
			//             otherWrapper: { //>
			//                 rules: {
			//                     'style/no-multi-spaces': 'off',
			//                     'antfu/consistent-list-newline': 'off',
			//                 },
			//             }, //<
			//         },
			//     },
			// ], //<
			// 'torn/tsd': [ //>
			//     'error', [
			//         'comma-spacing',
			//         // 'antfu/consistent-list-newline',
			//         // 'style/no-multi-spaces',
			//         // 'style/comma-spacing',
			//     ],

			// ], //<
		},

		plugins: {
			// torn: tf,
		},

	},

	// { name: 'typescript-stylistic-rules', //>
	//     files: ['**/*.ts', '**/*.tsx'], // Apply only to TypeScript files
	//     ...typescript({ stylistic: true }),
	//     rules: {
	//         "@typescript-eslint/prefer-for-of": "error"
	//     },
	//     // {
	//     //     name: 'otherWrapper'
	//     //     rules:{
	//     //         'style/no-multi-spaces': 'off',
	//     //         'antfu/consistent-list-newline': 'off',
	//     //     }
	//     // }
	// }, //<

	// {   name: 'focus-torn',

	//     rules: {

	//         // 'tf/max-len-autofix': [ 'error', { code: 115, }, ],

	//         "no-console": "off",

	//         'indent': ['warn', 4],

	//         'unused-imports/no-unused-imports': 'warn',
	//         'unused-imports/no-unused-vars': 'warn',
	//         'no-unused-vars': 'off',

	//         'import/newline-after-import': 'off',

	//         'unicorn/prefer-node-protocol': 'off',

	//         'require-resolve-not-external': 'off',

	//         'license-header/header': 'off',

	//         // 'jsonc/indent': ['warn', 4],

	//         // 'style/no-trailing-spaces': ['warn', { skipBlankLines: true, ignoreComments: true }],
	//         // 'style/no-multiple-empty-lines': ['warn', { max: 5, maxBOF: 1 }],
	//         // 'style/max-statements-per-line': 'off',
	//         // 'style/spaced-comment': 'off',
	//         // 'style/lines-between-class-members': 'off',
	//         // 'style/padded-blocks': 'off', // ["error", { "blocks": "always" }]

	//         // 'function-paren-newline': ['error', 'multiline'],

	//         // 'operator-linebreak': ['error', 'before'],

	//         // 'prettier/prettier': 'off',

	//         // "prettier/prettier": [
	//         //     "error",
	//         //     {
	//         //         printWidth: 100,
	//         //         endOfLine: "lf",
	//         //     },

	//         // ],

	//         // 'no-unused-vars': ['warn',  //>
	//         //     {
	//         //         argsIgnorePattern: '^_[^_].*$|^_$',
	//         //         varsIgnorePattern: '^_[^_].*$|^_$',
	//         //         caughtErrorsIgnorePattern: '^_[^_].*$|^_$',

	//         //     },
	//         // ], //<
	//         // 'torn/padding-between': [ 0, //'warn', //>

	//         //     { blankLine: ['always', 2], prev: '*', next: '' },
	//         //     { blankLine: ['always', 0], prev: 'import', next: '' },

	//         //     { blankLine: ['always', 0], prev: 'import', next: 'import' },

	//         // //     // Imports
	//         // //     { blankLine: ['always', 1], prev: 'import', next: '*' },
	//         // //     { blankLine: ['always', 1], prev: '*', next: 'import' },
	//         // //     { blankLine: ['always', 0], prev: 'import', next: 'import' },

	//         // //     // Exports
	//         // //     { blankLine: ['always', 3], prev: 'export', next: '*' },
	//         // //     { blankLine: ['always', 3], prev: '*', next: 'export' },
	//         // //     { blankLine: ['always', 3], prev: 'singleline-export', next: 'singleline-export' },

	//         // //     // Constants
	//         // //     { blankLine: ['always', 1], prev: '*', next: 'const' },
	//         // //     { blankLine: ['always', 1], prev: 'const', next: '*' },
	//         // //     { blankLine: ['always', 0], prev: 'const', next: 'const' },
	//         // //     // { blankLine: ['always', 0], prev: 'singleline-const', next: 'singleline-const' },

	//         // //     { blankLine: ['always', 1], prev: '*', next: 'export const' },
	//         // //     { blankLine: ['always', 1], prev: 'export const', next: '*' },
	//         // //     // { blankLine: ['always', 0], prev: 'singleline-export const', next: 'singleline-export const' },

	//         // //     // Let
	//         // //     { blankLine: ['always', 1], prev: '*', next: 'let' },
	//         // //     { blankLine: ['always', 1], prev: 'let', next: '*' },
	//         // //     { blankLine: ['always', 0], prev: 'let', next: 'const' },
	//         // //     { blankLine: ['always', 0], prev: 'const', next: 'let' },
	//         // //     { blankLine: ['always', 0], prev: 'let', next: 'let' },

	//         // ],

	//         // // // Type
	//         // // { blankLine: "always", prev: "*", next: "type" },
	//         // // { blankLine: "always", prev: "type", next: "*" },
	//         // // { blankLine: "always", prev: "type", next: "type" },
	//         // // { blankLine: "always", prev: "export type", next: "*" },
	//         // // { blankLine: "always", prev: "*", next: "export type" },
	//         // // // Enums
	//         // // { blankLine: "always", prev: "*", next: "export const enum" },
	//         // // { blankLine: "always", prev: "export const enum", next: "*" },
	//         // // // Interface
	//         // // { blankLine: "always", prev: "export interface", next: "*" },
	//         // // { blankLine: "always", prev: "*", next: "export interface" },
	//         // // // Function
	//         // // { blankLine: "always", prev: "*", next: "function" },
	//         // // { blankLine: "always", prev: "function", next: "*" },
	//         // // // If
	//         // // { blankLine: "always", prev: "*", next: "if" },
	//         // // { blankLine: "always", prev: "if", next: "*" },
	//         // // { blankLine: "never", prev: "singleline-if", next: "singleline-if" },
	//         // // // For
	//         // // { blankLine: "always", prev: "*", next: "for" },
	//         // // { blankLine: "always", prev: "for", next: "*" },
	//         // // // Switch
	//         // // { blankLine: "always", prev: "*", next: "switch" },
	//         // // // Returns
	//         // // { blankLine: "always", prev: "*", next: "return" },
	//         // // { blankLine: "never", prev: "return", next: "case" },

	//         // // //<
	//         // 'max-len': 'off', // Turn off the max-len rule in ESLint //>
	//         // 'style/max-len': ['error', {
	//         //     code: 100,
	//         //     tabWidth: 2,
	//         //     ignoreComments: true,
	//         //     ignoreTrailingComments: true,
	//         //     ignoreUrls: true,
	//         //     ignoreStrings: true,
	//         //     ignoreTemplateLiterals: true
	//         // }],
	//         //<

	//     },

	//     plugins  :  {
	//         // 'tf': eslintTornFocus,
	//         // prettier: eslintPluginPrettier,
	//         // torn: tf
	//     }  ,

	//     ignores  :  [

	//         '**/node_modules/**/*',

	//         '**/.notesHub_*/**/*',

	//         '**/out/**/*',
	//         '**/dist/**/*',

	//         '**/*test*/**/*',
	//         '**/**/*.model.*',

	//         '**/*removed*/**/*',

	//         '**/*X_____*.*',
	//         '**/*X_____*/*.*',
	//         '**/*_____X*.*',
	//         '**/*_____X*/*.*',

	//     ]  ,

	// }   ,

	// {   name: 'focus-torn/json',
	//     files: ['**/*.json'],
	//     plugins: {},
	//     rules: {
	//         'style/eol-last': 0,

	//         'jsonc/array-bracket-spacing': 'off',
	//         'style/no-multi-spaces': 'off',
	//         'style/comma-spacing': 'off',
	//         'antfu/consistent-list-newline':'off',
	//         'jsonc/object-curly-newline':'off',

	//         'jsonc/sort-keys':'off',
	//         'jsonc/comma-style':'off',

	//     },
	// }   ,

	// {   name: 'focus-torn/package_json_pieces.jsonc',
	//     files: ['**/**/package_json_sync/package_json_pieces.jsonc'],
	//     plugins: {},
	//     rules: {
	//         // 'style/comma-spacing': 'off',
	//         // 'style/no-multi-spaces': 'off',
	//         // 'style/no-trailing-spaces': 'off',
	//         // 'style/no-multiple-empty-lines': 'off',

	//         // 'jsonc/key-spacing': 'off',
	//         // 'jsonc/sort-keys': 'off',
	//         // 'jsonc/object-property-newline': 'off',
	//         // 'jsonc/comma-style': 'off',
	//         // 'jsonc/object-curly-newline': 'off',

	//         'antfu/consistent-list-newline': 'off',

	//     },
	// }   ,

	// {   name: 'focus-torn/package.json',
	//     files: ['package.json'],
	//     rules: {

	//         // 'style/no-trailing-spaces': 'off',
	//         // 'style/no-multiple-empty-lines': 'off',
	//         // 'jsonc/key-spacing': 'off',

	//         // 'jsonc/sort-keys': 'off',
	//         // 'jsonc/object-property-newline': 'off',
	//         // 'jsonc/comma-style': 'off',
	//         // 'jsonc/object-curly-newline': 'off',

	//         'indent': ['warn', 4],
	//         'antfu/consistent-list-newline': 'off',

	//     },
	//     plugins: {},
	// }   ,

	// { name: 'ft/vite', files: ['**/**/*.{vite,_vite}.{js,ts}'], //>
	//     rules: {
	//         ...focusTornRules,
	//         'no-console': 'off',
	//         'comma-spacing': 'off',
	//     },
	// plugins: {},
	// }, //<

	// { name: 'ft/vite-scenarios', //>
	//
	//     files: ['**/**/*.{vite,_vite}.{js,ts}'],
	//     rules: {
	//         ...focusTornRules,

	//         'style/no-multi-spaces': 'off',
	//         'antfu/consistent-list-newline': 'off',
	//         'style/comma-spacing': 'off',
	//         'comma-spacing': 'off',
	//     },
	//     plugins: {},
	// }, //<

	// {   name: 'focus-torn/paddingTest',

	//     // 'torn/padding-between': [ 'warn',
	//     //     { blankLine: ['always', 1], prev: '*', next: 'interface' },
	//     //     { blankLine: ['always', 2], prev: 'interface', next: '*' },
	//     // ]

	//     files: ['**/**/eslint-testo.ts'],
	//     plugins: { torn: tf },

	//     //> torn/padding-between options

	//     //     // Imports
	//     //     { blankLine: ['always', 1], prev: 'import', next: '*' },
	//     //     { blankLine: ['always', 1], prev: '*', next: 'import' },
	//     //     { blankLine: ['always', 0], prev: 'import', next: 'import' },

	//     //     // Exports
	//     //     { blankLine: ['always', 3], prev: 'export', next: '*' },
	//     //     { blankLine: ['always', 3], prev: '*', next: 'export' },
	//     //     { blankLine: ['always', 3], prev: 'singleline-export', next: 'singleline-export' },

	//     //     // Constants
	//     //     { blankLine: ['always', 1], prev: '*', next: 'const' },
	//     //     { blankLine: ['always', 1], prev: 'const', next: '*' },
	//     //     { blankLine: ['always', 0], prev: 'const', next: 'const' },
	//     //     // { blankLine: ['always', 0], prev: 'singleline-const', next: 'singleline-const' },

	//     //     { blankLine: ['always', 1], prev: '*', next: 'export const' },
	//     //     { blankLine: ['always', 1], prev: 'export const', next: '*' },
	//     //     // { blankLine: ['always', 0], prev: 'singleline-export const', next: 'singleline-export const' },

	//     //     // Let
	//     //     { blankLine: ['always', 1], prev: '*', next: 'let' },
	//     //     { blankLine: ['always', 1], prev: 'let', next: '*' },
	//     //     { blankLine: ['always', 0], prev: 'let', next: 'const' },
	//     //     { blankLine: ['always', 0], prev: 'const', next: 'let' },
	//     //     { blankLine: ['always', 0], prev: 'let', next: 'let' },

	//     // // Type
	//     // { blankLine: "always", prev: "*", next: "type" },
	//     // { blankLine: "always", prev: "type", next: "*" },
	//     // { blankLine: "always", prev: "type", next: "type" },
	//     // { blankLine: "always", prev: "export type", next: "*" },
	//     // { blankLine: "always", prev: "*", next: "export type" },
	//     // // Enums
	//     // { blankLine: "always", prev: "*", next: "export const enum" },
	//     // { blankLine: "always", prev: "export const enum", next: "*" },
	//     // // Interface
	//     // { blankLine: "always", prev: "export interface", next: "*" },
	//     // { blankLine: "always", prev: "*", next: "export interface" },
	//     // // Function
	//     // { blankLine: "always", prev: "*", next: "function" },
	//     // { blankLine: "always", prev: "function", next: "*" },
	//     // // If
	//     // { blankLine: "always", prev: "*", next: "if" },
	//     // { blankLine: "always", prev: "if", next: "*" },
	//     // { blankLine: "never", prev: "singleline-if", next: "singleline-if" },
	//     // // For
	//     // { blankLine: "always", prev: "*", next: "for" },
	//     // { blankLine: "always", prev: "for", next: "*" },
	//     // // Switch
	//     // { blankLine: "always", prev: "*", next: "switch" },
	//     // // Returns
	//     // { blankLine: "always", prev: "*", next: "return" },
	//     // { blankLine: "never", prev: "return", next: "case" },

	//     // //<

	//     rules: {
	//         'torn/padding-between': [
	//             'warn',
	//             {
	//                 ImportDeclaration: {
	//                     prev: {
	//                         import: 1,
	//                     },
	//                     next: {
	//                         import: 1,
	//                         interface: 1,
	//                     },
	//                 },
	//             },
	//         ],
	//     },
	// }   ,

	{ name: 'LINTER OPTIONS', linterOptions: {
		reportUnusedDisableDirectives: 'off',
	} },

	// require('eslint-config-prettier')

	// prettierConfig
)

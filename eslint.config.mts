import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { globalIgnores } from 'eslint/config';

export default tseslint.config(
	globalIgnores([
		'node_modules',
		'dist',
		'esbuild.config.mjs',
		'version-bump.mjs',
		'versions.json',
		'main.js',
		'package.json',
		'package-lock.json',
		'tsconfig.json',
		'tsconfig.spec.json',
		'jest.config.cjs',
	]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.jest,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.mts',
						'manifest.json',
						'tests/*.ts',
						'coverage/*/*.js',
					],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json'],
			},
		},
		rules: {
			'no-unused-vars': 'warn',
			'no-undef': 'warn',
		},
	},
	...obsidianmd.configs.recommended,
);

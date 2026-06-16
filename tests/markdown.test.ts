import { describe, it, expect } from '@jest/globals';
import { cleanMarkdown } from '../src/markdown';

describe('jest setup', () => {
	it('runs a basic test', () => {
		expect(1 + 1).toBe(2);
	});

	it('cleans markdown formatting', () => {
		expect(cleanMarkdown('**Hello**')).toBe('Hello');
		expect(cleanMarkdown('`code`')).toBe('code');
		expect(cleanMarkdown(' ==highlight== ')).toBe('highlight');
	});
});

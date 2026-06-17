import {describe, it, expect} from '@jest/globals';
import {cleanMarkdown} from '../src/markdown';

describe('jest setup', () => {
	it('runs a basic test', () => {
		expect(1 + 1).toBe(2);
	});

	describe("clean markdown formatting", () => {
		it.each([
			['**Hello**', 'Hello'],
			['`code`', 'code'],
			[' ==highlight== ', 'highlight'],
			[' ***bold and italic*** ', 'bold and italic'],
			[' ~~strikethrough~~ ', 'strikethrough'],
			// ['`*keep asterisks in code block*`', '*keep asterisks in code block*'],
			// [' \*keep escaped asterisks\* ', '*keep escaped asterisks*']

		])("when the input is '%s'", (text, expected) => {
			expect(cleanMarkdown(text)).toBe(expected);
		});
	});
});

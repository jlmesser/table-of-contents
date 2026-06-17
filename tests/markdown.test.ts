import {describe, it, expect} from '@jest/globals';
import {cleanMarkdown} from '../src/markdown';

describe('jest setup', () => {
	it('runs a basic test', () => {
		expect(1 + 1).toBe(2);
	});

	//todo handle escaped characters e.g. \*
	//todo handle brackets eg ()
	//todo handle external links eg [text](url) - currently link to heading works but is ugly
	//todo handle internal links or [[ToC bugs]] - link to heading broken, link to other file works but is ugly

	describe("clean markdown formatting", () => {
		it.each([
			['**Hello**', 'Hello'],
			['`code`', 'code'],
			['==highlight==', 'highlight'],
			['***bold and italic***', 'bold and italic'],
			['~~strikethrough~~', 'strikethrough'],
			['`keep chars *_~`=[] in code block`', 'keep chars *_~`=[] in code block'],
			['keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]', 'keep escaped chars * _ ~ ` = [ ]'],
			['keep (brackets)', 'keep (brackets)'],
			['[[display internal link file name]]', 'display internal link file name'],
			['[display link text](xyz.com)', 'display link text'],
			['[[ToC test#ToC bugs|ToC bugs]]', 'ToC bugs']

		])("when the input is '%s'", (text, expected) => {
			expect(cleanMarkdown(text)).toBe(expected);
		});
	});
});

import {describe, it, expect} from '@jest/globals';
import {cleanMarkdown, createHeadingWikilink} from '../src/markdownFormat';

describe("clean link formatting", () => {
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
		['[[ToC bugs]]', 'ToC bugs'],
		['[[ToC bugs|othername]]', 'othername']

	])("when the input is '%s'", (text, expected) => {
		expect(cleanMarkdown(text)).toBe(expected);
	});
});

//todo handle headings with multiple links (of internal/wiki links, 2 of each and both)
//todo test long headings?
//todo test other characters (special, emojis, look for charset to test with)

describe("clean link display text formatting", () => {
	it.each([
		['**Hello**', 'Hello', 'ToC test', '[[ToC test#**Hello**|Hello ]]'],
		['`code`', 'code', 'ToC test', '[[ToC test#`code`|code ]]'],
		['==highlight==', 'highlight', 'ToC test', '[[ToC test#==highlight==|highlight ]]'],
		['***bold and italic***', 'bold and italic', 'ToC test', '[[ToC test#***bold and italic***|bold and italic ]]'],
		['~~strikethrough~~', 'strikethrough', 'ToC test', '[[ToC test#~~strikethrough~~|strikethrough ]]'],
		['`keep chars *_~`=[] in code block`', 'keep chars *_~`=[] in code block', 'ToC test', '[[ToC test#`keep chars *_~`=[] in code block`|keep chars *_~`=[] in code block ]]'],
		['keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]', 'keep escaped chars * _ ~ ` = [ ]', 'ToC test', '[[ToC test#keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]|keep escaped chars * _ ~ ` = [ ] ]]'],
		['keep (brackets)', 'keep (brackets)', 'ToC test', '[[ToC test#keep (brackets)|keep (brackets) ]]'],
		['[[display internal link file name]]', 'display internal link file name', 'ToC test', '[[ToC test#display internal link file name|display internal link file name ]]'],
		['[display link text](xyz.com)', 'display link text', 'ToC test', '[[ToC test#[display link text](xyz.com)|display link text ]]'],
		['[[ToC bugs]]', 'ToC bugs', 'ToC test', '[[ToC test#ToC bugs|ToC bugs ]]'],
		['[[ToC bugs|othername]]', 'othername', 'ToC test', '[[ToC test#ToC bugs othername]|othername ]]'],
		['[othername2](ToC%20bugs)', 'othername2', 'ToC test', '[[ToC test#[othername2](ToC%20bugs)|othername2 ]]'],

	])("when the input is '%s'", (heading, cleanText, basename, expected) => {
		expect(createHeadingWikilink(cleanText, basename, heading)).toBe(expected);
	});
});

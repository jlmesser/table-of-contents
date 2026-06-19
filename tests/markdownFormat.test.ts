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
		['**Hello**', 'Hello', 'ToC test', '[[#**Hello**|Hello ]]'],
		['`code`', 'code', 'ToC test', '[[#`code`|code ]]'],
		['==highlight==', 'highlight', 'ToC test', '[[#==highlight==|highlight ]]'],
		['***bold and italic***', 'bold and italic', 'ToC test', '[[#***bold and italic***|bold and italic ]]'],
		['~~strikethrough~~', 'strikethrough', 'ToC test', '[[#~~strikethrough~~|strikethrough ]]'],
		['`keep chars *_~`=[] in code block`', 'keep chars *_~`=[] in code block', 'ToC test', '[[#`keep chars *_~`=[] in code block`|keep chars *_~`=[] in code block ]]'],
		['keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]', 'keep escaped chars * _ ~ ` = [ ]', 'ToC test', '[[#keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]|keep escaped chars * _ ~ ` = [ ] ]]'],
		['keep (brackets)', 'keep (brackets)', 'ToC test', '[[#keep (brackets)|keep (brackets) ]]'],
		['[[display internal link file name]]', 'display internal link file name', 'ToC test', '[[#display internal link file name|display internal link file name ]]'],
		['[display link text](xyz.com)', 'display link text', 'ToC test', '[[#[display link text](xyz.com)|display link text ]]'],
		['[[ToC bugs]]', 'ToC bugs', 'ToC test', '[[#ToC bugs|ToC bugs ]]'],
		['[[ToC bugs|othername1]]', 'othername1', 'ToC test', '<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a> OR <a href="#othername1">othername1</a>'], //PDF compatibility issue
		['[othername2](ToC%20bugs)', 'othername2', 'ToC test', '[[#[othername2](ToC%20bugs)|othername2 ]]'],

	])("when the input is '%s'", (heading, cleanText, basename, expected) => {
		expect(createHeadingWikilink(cleanText, basename, heading)).toBe(expected);
	});
});

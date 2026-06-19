// noinspection HtmlUnknownAnchorTarget

import {describe, expect, it} from '@jest/globals';
import {cleanMarkdown, createHeadingWikilink} from '../src/markdownFormat';
import {PdfCompatibilityMode} from "../src/util";

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
		['**Hello**', 'Hello', PdfCompatibilityMode.BOTH, '[[#**Hello**|Hello ]]'],
		['`code`', 'code', PdfCompatibilityMode.BOTH, '[[#`code`|code ]]'],
		['==highlight==', 'highlight', PdfCompatibilityMode.BOTH, '[[#==highlight==|highlight ]]'],
		['***bold and italic***', 'bold and italic', PdfCompatibilityMode.BOTH, '[[#***bold and italic***|bold and italic ]]'],
		['~~strikethrough~~', 'strikethrough', PdfCompatibilityMode.BOTH, '[[#~~strikethrough~~|strikethrough ]]'],
		['`keep chars *_~`=[] in code block`', 'keep chars *_~`=[] in code block', PdfCompatibilityMode.BOTH, '[[#`keep chars *_~`=[] in code block`|keep chars *_~`=[] in code block ]]'],
		['keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]', 'keep escaped chars * _ ~ ` = [ ]', PdfCompatibilityMode.BOTH, '[[#keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]|keep escaped chars * _ ~ ` = [ ] ]]'],
		['keep (brackets)', 'keep (brackets)', PdfCompatibilityMode.BOTH, '[[#keep (brackets)|keep (brackets) ]]'],
		['[[display internal link file name]]', 'display internal link file name', PdfCompatibilityMode.BOTH, '[[#display internal link file name|display internal link file name ]]'],
		['[display link text](xyz.com)', 'display link text', PdfCompatibilityMode.BOTH, '[[#[display link text](xyz.com)|display link text ]]'],
		['[othername2](ToC%20bugs)', 'othername2', PdfCompatibilityMode.BOTH, '[[#[othername2](ToC%20bugs)|othername2 ]]'],
		['[[ToC bugs|othername1]]', 'othername1', PdfCompatibilityMode.BOTH, '<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a> | <a href="#othername1">othername1</a>'],
		['[[ToC bugs|othername1]]', 'othername1', PdfCompatibilityMode.OBSIDIAN, '<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a>'],
		['[[ToC bugs|othername1]]', 'othername1', PdfCompatibilityMode.PDF, '<a href="#othername1">othername1</a>'],

	])("when the input is '%s'", (heading, cleanText, settings, expected) => {
		expect(createHeadingWikilink(cleanText, settings, heading)).toBe(expected);
	});
});

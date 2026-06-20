// noinspection HtmlUnknownAnchorTarget

import {describe, expect, it} from '@jest/globals';
import {cleanMarkdown, createHeadingWikilink} from '../src/markdownFormat';
import {PdfCompatibilityMode} from "../src/util";
import {stripHeadingForLink} from "obsidian";

describe("clean link formatting changed", () => {
	it.each([
		['**Hello**', '**Hello**', 'Hello'],
		['`code`', '`code`', 'code'],
		['==highlight==', '==highlight==', 'highlight'],
		['***bold and italic***', '***bold and italic***', 'bold and italic'],
		['~~strikethrough~~', '~~strikethrough~~', 'strikethrough'],
		['[[ToC bugs|othername]]', 'ToC bugs othername', 'othername'],
		['[display link text](xyz.com)', 'display link text xyz.com',  'display link text'],
		['`keep chars *_~`=[] in code block`', '`keep chars *_~`=[] in code block`', 'keep chars *_~`=[] in code block'],

	])("when the input is '%s'", (text, stripHeading, expected) => {
		expect(cleanMarkdown(text, stripHeading)).toBe(expected);
	});
});


describe("clean link formatting same", () => {
	it.each([
		['keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]', 'keep escaped chars * _ ~ ` = [ ]'],
		['keep (brackets)', 'keep (brackets)'],
		['[[display internal link file name]]', 'display internal link file name'],
		['[[ToC bugs]]', 'ToC bugs'],
		['[[ToC bugs|remove^2395bd]]^2395bd', 'ToC bugs remove 2395bd 2395bd'],
		['[[#^2395bd]]', '2395bd'],
		['some text [[ToC bugs|2muchtxt]] more text', 'some text ToC bugs 2muchtxt more text'], //todo do i want to remove linked file name? e.g. "some text 2muchtxt more text"
		['some text [[ToC bugs|3muchtxt]] more text [[ToC bugs|4muchtxt]] more text', 'some text ToC bugs 3muchtxt more text ToC bugs 4muchtxt more text'],
		['things n stuff [othername3](ToC%20bugs) things n stuff', 'things n stuff othername3 ToC 20bugs things n stuff']

	])("when the input is '%s'", (text, expected) => {
		expect(cleanMarkdown(text, expected)).toBe(expected);
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
		['keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]', 'keep escaped chars * _ ~ ` = [ ]', PdfCompatibilityMode.BOTH, '[[#keep escaped chars * _ ~ ` = [ ] ]]'],
		['keep (brackets)', 'keep (brackets)', PdfCompatibilityMode.BOTH, '[[#keep (brackets) ]]'],
		['[[display internal link file name]]', 'display internal link file name', PdfCompatibilityMode.BOTH, '[[#display internal link file name|display internal link file name ]]'],
		['[display link text](xyz.com)', 'display link text', PdfCompatibilityMode.BOTH, '[[#[display link text](xyz.com)|display link text ]]'],
		['[othername2](ToC%20bugs)', 'othername2', PdfCompatibilityMode.BOTH, '[[#[othername2](ToC%20bugs)|othername2 ]]'],
		['[[ToC bugs|othername1]]', 'othername1', PdfCompatibilityMode.BOTH, '<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a> | <a href="#othername1">othername1</a>'],
		['[[ToC bugs|othername1]]', 'othername1', PdfCompatibilityMode.OBSIDIAN, '<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a>'],
		['[[ToC bugs|othername1]]', 'othername1', PdfCompatibilityMode.PDF, '<a href="#othername1">othername1</a>'],

		['[[ToC bugs|remove^2395bd]]^2395bd', 'ToC bugs remove 2395bd 2395bd',  PdfCompatibilityMode.BOTH, '[[#ToC bugs remove 2395bd 2395bd ]]'],
		['[[#^2395bd]]', '2395bd', PdfCompatibilityMode.BOTH,  '[[#2395bd ]]'],
		['some text [[ToC bugs|2muchtxt]] more text', 'some text ToC bugs 2muchtxt more text',  PdfCompatibilityMode.BOTH, '[[#some text ToC bugs 2muchtxt more text ]]'],
		['some text [[ToC bugs|3muchtxt]] more text [[ToC bugs|4muchtxt]] more text', 'some text ToC bugs 3muchtxt more text ToC bugs 4muchtxt more text' , PdfCompatibilityMode.BOTH, '[[#some text ToC bugs 3muchtxt more text ToC bugs 4muchtxt more text ]]'],
		['things n stuff [othername3](ToC%20bugs) things n stuff', 'things n stuff othername3 ToC 20bugs things n stuff', PdfCompatibilityMode.BOTH, '[[#things n stuff othername3 ToC 20bugs things n stuff ]]'],

	])("when the input is '%s'", (heading, cleanText, settings, expected) => {
		expect(createHeadingWikilink(cleanText, settings, heading)).toBe(expected);
	});
});

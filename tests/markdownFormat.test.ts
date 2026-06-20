// noinspection HtmlUnknownAnchorTarget

import {describe, expect, it} from '@jest/globals';
import {cleanMarkdown} from '../src/markdownFormat';
import {PdfCompatibilityMode} from "../src/util";

//todo handle headings with multiple links (of internal/wiki links, 2 of each and both)
//todo test long headings?
//todo test other characters (special, emojis, look for charset to test with)

describe("clean link display text", () => {
	it.each`
		heading                                                                      			| stripHeadingForLink                     			| pdfSettings                   		| expected
		${'**Hello**'}                                                               | ${'Hello'}                              | ${PdfCompatibilityMode.BOTH}  | ${'[[#**Hello**|Hello ]]'}
		${'`code`'}                                                                  | ${'code'}                               | ${PdfCompatibilityMode.BOTH}  | ${'[[#`code`|code ]]'}
		${'==highlight=='}                                                           | ${'highlight'}                          | ${PdfCompatibilityMode.BOTH}  | ${'[[#==highlight==|highlight ]]'}
		${'***bold and italic***'}                                                   | ${'bold and italic'}                    | ${PdfCompatibilityMode.BOTH}  | ${'[[#***bold and italic***|bold and italic ]]'}
		${'~~strikethrough~~'}                                                       | ${'strikethrough'}                      | ${PdfCompatibilityMode.BOTH}  | ${'[[#~~strikethrough~~|strikethrough ]]'}
		${'[[ToC bugs|othername1]]'}                                                 | ${'othername1'}                         | ${PdfCompatibilityMode.BOTH}  | ${'<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a> | <a href="#othername1">othername1</a>'}
		${'[[ToC bugs|othername1]]'}                                                 | ${'othername1'}                         | ${PdfCompatibilityMode.OBSIDIAN}| ${'<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a>'}
		${'[[ToC bugs|othername1]]'}                                                 | ${'othername1'}                         | ${PdfCompatibilityMode.PDF}   | ${'<a href="#othername1">othername1</a>'}
		${'[display link text](xyz.com)'}                                            | ${'display link text'}                  | ${PdfCompatibilityMode.BOTH}  | ${'[[#[display link text](xyz.com)|display link text ]]'}
		${'`keep chars *_~`=[] in code block`'}                                      | ${'keep chars *_~`=[] in code block'}   | ${PdfCompatibilityMode.BOTH}  | ${'[[#`keep chars *_~`=[] in code block`|keep chars *_~`=[] in code block ]]'}
		${'keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]'}                           | ${'keep escaped chars * _ ~ ` = [ ]'}   | ${PdfCompatibilityMode.BOTH}  | ${'[[#keep escaped chars * _ ~ ` = [ ] ]]'}
		${'keep (brackets)'}                                                         | ${'keep (brackets)'}                    | ${PdfCompatibilityMode.BOTH}  | ${'[[#keep (brackets) ]]'}
		${'[[display internal link file name]]'}                                     | ${'display internal link file name'}    | ${PdfCompatibilityMode.BOTH}  | ${'[[#display internal link file name|display internal link file name ]]'}
		${'[othername2](ToC%20bugs)'}                                                | ${'othername2'}                         | ${PdfCompatibilityMode.BOTH}  | ${'[[#[othername2](ToC%20bugs)|othername2 ]]'}
		${'[[ToC bugs|remove^2395bd]]^2395bd'}                                       | ${'ToC bugs remove 2395bd 2395bd'}      | ${PdfCompatibilityMode.BOTH}  | ${'[[#ToC bugs remove 2395bd 2395bd ]]'}
		${'[[#^2395bd]]'}                                                            | ${'2395bd'}                             | ${PdfCompatibilityMode.BOTH}  | ${'[[#2395bd ]]'}
		${'some text [[ToC bugs|2muchtxt]] more text'}                               | ${'some text ToC bugs 2muchtxt more text'}| ${PdfCompatibilityMode.BOTH}  | ${'[[#some text ToC bugs 2muchtxt more text ]]'}
		${'some text [[ToC bugs|3muchtxt]] more text [[ToC bugs|4muchtxt]] more text'}| ${'some text ToC bugs 3muchtxt more text ToC bugs 4muchtxt more text'}| ${PdfCompatibilityMode.BOTH}| ${'[[#some text ToC bugs 3muchtxt more text ToC bugs 4muchtxt more text ]]'}
		${'things n stuff [othername3](ToC%20bugs) things n stuff'}                 | ${'things n stuff othername3 ToC 20bugs things n stuff'}| ${PdfCompatibilityMode.BOTH}| ${'[[#things n stuff othername3 ToC 20bugs things n stuff ]]'}
	`("for heading '$heading' create link '$expected'", ({ heading, stripHeadingForLink, pdfSettings, expected }) => {
		expect(
			cleanMarkdown(
				stripHeadingForLink as string,
				pdfSettings as PdfCompatibilityMode,
				heading as string
			)
		).toBe(expected);
	})
});

// noinspection HtmlUnknownAnchorTarget

import {describe, expect, it} from '@jest/globals';
import {cleanMarkdown} from '../src/markdownFormat';
import {PdfCompatibilityMode} from "../src/util";

//todo handle headings with multiple links (of internal/wiki links, 2 of each and both)
//todo test long headings?
//todo test other characters (special, emojis, look for charsets to test with)

describe("clean link display text", () => {
	it.each`
		heading                                                                  | stripHeadingForLink                     							| pdfSettings                   		    | expected
		${'**Hello**'}                                                 | ${'Hello'}                              				| ${PdfCompatibilityMode.BOTH}    | ${'[[#**Hello**|Hello ]]'}
		${'`code`'}                                                    | ${'code'}                               				| ${PdfCompatibilityMode.BOTH}    | ${'[[#`code`|code ]]'}
		${'==highlight=='}                                             | ${'highlight'}                          				| ${PdfCompatibilityMode.BOTH}    | ${'[[#==highlight==|highlight ]]'}
		${'***bold and italic***'}                                     | ${'bold and italic'}                    				| ${PdfCompatibilityMode.BOTH}    | ${'[[#***bold and italic***|bold and italic ]]'}
		${'~~strikethrough~~'}                                         | ${'strikethrough'}                      				| ${PdfCompatibilityMode.BOTH}    | ${'[[#~~strikethrough~~|strikethrough ]]'}
		${'[[ToC bugs|othername1]]'}                                   | ${'othername1'}                         				| ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a> | <a href="#othername1">othername1</a>'}
		${'[[ToC bugs|othername1]]'}                                   | ${'othername1'}                         				| ${PdfCompatibilityMode.OBSIDIAN}| ${'<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a>'}
		${'[[ToC bugs|othername1]]'}                                   | ${'othername1'}                         				| ${PdfCompatibilityMode.PDF}     | ${'<a href="#othername1">othername1</a>'}
		${'[display link text](xyz.com)'}                              | ${'display link text'}                  				| ${PdfCompatibilityMode.BOTH}    | ${'[[#[display link text](xyz.com)|display link text ]]'}
		${'`keep chars *_~`=[] in code block`'}                        | ${'keep chars *_~`=[] in code block'}   				| ${PdfCompatibilityMode.BOTH}    | ${'[[#`keep chars *_~`=[] in code block`|keep chars *_~`=[] in code block ]]'}
		${'keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]'}            | ${'keep escaped chars * _ ~ ` = [ ]'}   				| ${PdfCompatibilityMode.BOTH}    | ${'[[#keep escaped chars * _ ~ ` = [ ] ]]'}
		${'keep (brackets)'}                                           | ${'keep (brackets)'}                    				| ${PdfCompatibilityMode.BOTH}    | ${'[[#keep (brackets) ]]'}
		${'[[display internal link file name]]'}                       | ${'display internal link file name'}    				| ${PdfCompatibilityMode.BOTH}    | ${'[[#display internal link file name|display internal link file name ]]'}
		${'[othername2](ToC%20bugs)'}                                  | ${'othername2'}                         				| ${PdfCompatibilityMode.BOTH}    | ${'[[#[othername2](ToC%20bugs)|othername2 ]]'}
		${'[[ToC bugs|remove caret]]^2395bd'}                         | ${'ToC bugs remove caret 2395bd'}      				| ${PdfCompatibilityMode.BOTH}    | ${'[[#ToC bugs remove caret 2395bd|remove caret ]] | <a href=\"#remove caret\">remove caret</a>'}
		${'[[#^2395bd]]'}                                              | ${'2395bd'}                             				| ${PdfCompatibilityMode.BOTH}    | ${'[[#2395bd ]] | <a href=\"#2395bd\">2395bd</a>'}
		${'some text [[ToC bugs|2muchtxt]] more text'}                 | ${'some text ToC bugs 2muchtxt more text'} 			| ${PdfCompatibilityMode.BOTH}    | ${'[[#some text ToC bugs 2muchtxt more text ]]'}
		${'some [[ToC bugs|3muchtxt]] text [[ToC bugs|4muchtxt]] more'}| ${'some ToC bugs 3muchtxt text ToC bugs 4muchtxt more'}| ${PdfCompatibilityMode.BOTH}   | ${'[[#some ToC bugs 3muchtxt text ToC bugs 4muchtxt more ]]'}
		${'things [othername3](ToC%20bugs) stuff'}                 	 | ${'things othername3 ToC 20bugs stuff'} 				| ${PdfCompatibilityMode.BOTH}    | ${'[[#things othername3 ToC 20bugs stuff ]]'} <!-- //todo fix ToC 20bugs stuff from ToC%20bugs-->
		${'before footnote [^1] after footnote'}                       | ${'before footnote 1 after footnote'}                  | ${PdfCompatibilityMode.BOTH}    | ${'<a class=\"internal-link\" href=\"#before footnote [^1] after footnote\" data-href=\"#before footnote [^1] after footnote\">before footnote 1 after footnote</a>'} <-- [[#before footnote 1 after footnote ]] -->
		${'[^1]'}                       								 | ${'1'}                              				    | ${PdfCompatibilityMode.BOTH}    | ${'[[#1|[^1] ]] | <a href=\"#[^1]\">[^1]</a>'}
		${'This is a text with a [shortcut link][my-id]'}              | ${'This is a text with a shortcut link my-id'}         | ${PdfCompatibilityMode.BOTH}    | ${'[[#This is a text with a shortcut link my-id ]]'}
		${'[this][my-id]'}                       					     | ${'this my-id'}                              			| ${PdfCompatibilityMode.BOTH}    | ${'[[#this my-id ]]'}
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

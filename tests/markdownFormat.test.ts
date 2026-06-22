// noinspection HtmlUnknownAnchorTarget

import {describe, expect, it} from '@jest/globals';
import {cleanMarkdown} from '../src/markdownFormat';
import {PdfCompatibilityMode} from "../src/util";

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
		${'[[ToC bugs|othername1]]'}                                   | ${'ToC bugs othername1'}                         		| ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a> | <a href="#othername1">othername1</a>'}
		${'[[ToC bugs|othername1]]'}                                   | ${'ToC bugs othername1'}                         		| ${PdfCompatibilityMode.OBSIDIAN}| ${'<a class="internal-link" href="#ToC bugs|othername1" data-href="#ToC bugs|othername1">othername1</a>'}
		${'[[ToC bugs|othername1]]'}                                   | ${'ToC bugs othername1'}                         		| ${PdfCompatibilityMode.PDF}     | ${'<a href="#othername1">othername1</a>'}
		${'[display link text](xyz.com)'}                              | ${'display link text'}                  				| ${PdfCompatibilityMode.BOTH}    | ${'[[#[display link text](xyz.com)|display link text ]]'}
		${'`keep chars *_~`=[] in code block`'}                        | ${'keep chars *_~`=[] in code block'}   				| ${PdfCompatibilityMode.BOTH}    | ${'[[#`keep chars *_~`=[] in code block`|keep chars *_~`=[] in code block ]]'}
		${'keep escaped chars \\* \\_ \\~ \\` \\= \\[ \\]'}            | ${'keep escaped chars * _ ~ ` = [ ]'}   				| ${PdfCompatibilityMode.BOTH}    | ${'[[#keep escaped chars * _ ~ ` = [ ] ]]'}
		${'keep (brackets)'}                                           | ${'keep (brackets)'}                    				| ${PdfCompatibilityMode.BOTH}    | ${'[[#keep (brackets) ]]'}
		${'[[display internal link file name]]'}                       | ${'display internal link file name'}    				| ${PdfCompatibilityMode.BOTH}    | ${'[[#display internal link file name|display internal link file name ]]'}
		${'[othername2](ToC%20bugs)'}                                  | ${'othername2'}                         				| ${PdfCompatibilityMode.BOTH}    | ${'[[#[othername2](ToC%20bugs)|othername2 ]]'}
		${'[[ToC bugs|remove caret]]^2395bd'}                         | ${'ToC bugs remove caret 2395bd'}      				| ${PdfCompatibilityMode.BOTH}    | ${'[[#ToC bugs remove caret 2395bd|remove caret ]] | <a href="#remove caret">remove caret</a>'}
		${'[[#^2395bd]]'}                                              | ${'2395bd'}                             				| ${PdfCompatibilityMode.BOTH}    | ${'[[#2395bd|2395bd ]]'}
		${'some text [[ToC bugs|2muchtxt]] more text'}                 | ${'some text ToC bugs 2muchtxt more text'} 			| ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#some text [[ToC bugs|2muchtxt]] more text" data-href="#some text [[ToC bugs|2muchtxt]] more text">some text 2muchtxtmore text</a>'}
		${'some [[ToC bugs|3muchtxt]] text [[ToC bugs|4muchtxt]] more'}| ${'some ToC bugs 3muchtxt text ToC bugs 4muchtxt more'}| ${PdfCompatibilityMode.BOTH}   | ${'<a class="internal-link" href="#some [[ToC bugs|3muchtxt]] text [[ToC bugs|4muchtxt]] more" data-href="#some [[ToC bugs|3muchtxt]] text [[ToC bugs|4muchtxt]] more">some 3muchtxttext 4muchtxtmore</a>'}
		${'things [othername3](ToC%20bugs) stuff'}                 	 | ${'things othername3 ToC 20bugs stuff'} 				| ${PdfCompatibilityMode.BOTH}    | ${'[[#things [othername3](ToC%20bugs) stuff|things othername3 stuff ]]'}
		${'things [name3](ToC%20bugs) stuff [name4](ToC%20bugs) more '}| ${'things name3 ToC 20bugs stuff name4 ToC 20bugs more'}| ${PdfCompatibilityMode.BOTH}    | ${'[[#things [name3](ToC%20bugs) stuff [name4](ToC%20bugs) more |things name3 stuff name4 more ]]'}
		${'before footnote [^1] after footnote'}                       | ${'before footnote 1 after footnote'}                  | ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#before footnote [^1] after footnote" data-href="#before footnote [^1] after footnote">before footnote 1 after footnote</a>'}
		${'[^1]'}                       								 | ${'1'}                              				    | ${PdfCompatibilityMode.BOTH}    | ${'[[#1|[^1] ]] | <a href="#[^1]">[^1]</a>'}
		${'This is a text with a [shortcut link][my-id]'}              | ${'This is a text with a shortcut link my-id'}         | ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#This is a text with a [shortcut link][my-id]" data-href="#This is a text with a [shortcut link][my-id]">This is a text with a shortcut link</a>'}
		${'[this][my-id]'}                       					     | ${'this my-id'}                              			| ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#[this][my-id]" data-href="#[this][my-id]">this</a>'}
		${'footnote [^1] after [^2] footnote'}                       	 | ${'footnote 1 after 2 footnote'}                       | ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#footnote [^1] after [^2] footnote" data-href="#footnote [^1] after [^2] footnote">footnote 1 after 2 footnote</a>'}
		${'a [shortcut link][my-id] another [this][my-id]'}            | ${'a shortcut link my-id another this my-id'}          | ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#a [shortcut link][my-id] another [this][my-id]" data-href="#a [shortcut link][my-id] another [this][my-id]">a shortcut link another this</a>'}
		${'[[#^2395bd|test]]'}                       					  | ${'2395bd test'}                              	     | ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#2395bd|test" data-href="#2395bd|test">test</a> | <a href="#test">test</a>'}
		${'tag [[#^2395bd]] renamed [[#^2395bd|test]]'}                | ${'tag 2395bd renamed 2395bd test'}                     | ${PdfCompatibilityMode.BOTH}    | ${'<a class="internal-link" href="#tag 2395bd renamed 2395bd|test" data-href="#tag 2395bd renamed 2395bd|test">tag 2395bd renamed test</a> | <a href="#tag 2395bd renamed test">tag 2395bd renamed test</a>'}
	`("for heading '$heading' create link '$expected'", ({heading, stripHeadingForLink, pdfSettings, expected}) => {
		expect(
			cleanMarkdown(
				stripHeadingForLink as string,
				pdfSettings as PdfCompatibilityMode,
				heading as string
			)
		).toBe(expected);
	})
});

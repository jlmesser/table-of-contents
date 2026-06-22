import {describe, expect, it} from '@jest/globals';
import {
	DO_INDENT,
	DO_NOT_INDENT,
	DO_NOT_REMOVE_TOC,
	DO_REMOVE_TOC,
	getPdfSettings,
	ListType,
	NON_BREAKING_SPACE,
	PdfCompatibilityMode,
	resolveIndent,
	resolveSetting,
	skipTocHeading
} from "../src/util";

let emptySource = "";
describe("get list type based on global and local settings", () => {
	it.each([
		[ListType, 'numberedList', ListType.bulletedList, ListType.numberedList],
		[ListType, 'numberedList', ListType.numberedList, ListType.numberedList],
		[ListType, 'bulletedList', ListType.bulletedList, ListType.bulletedList],
		[ListType, 'bulletedList', ListType.numberedList, ListType.bulletedList],
		[ListType, emptySource, ListType.bulletedList, ListType.bulletedList],
		[ListType, emptySource, ListType.numberedList, ListType.numberedList],

	])("when the input is '%s'", (enumObject, source, globalDefault, expected) => {
		expect(resolveSetting(enumObject, source, globalDefault)).toBe(expected);
	});

});

describe("get indent based on global and local settings", () => {
	let defaultIndentString = "\t";
	let noIndent = "";
	it.each([
		[DO_INDENT, true, defaultIndentString],
		[DO_INDENT, false, defaultIndentString],
		[DO_NOT_INDENT, true, noIndent],
		[DO_NOT_INDENT, false, noIndent],
		[emptySource, true, defaultIndentString],
		[emptySource, false, noIndent],
		["indent' '", true, NON_BREAKING_SPACE],
		["indent' '\n" + DO_INDENT, false, NON_BREAKING_SPACE],
		["indent' '\n" + DO_NOT_INDENT, true, noIndent],
		["indent'  '", true, NON_BREAKING_SPACE.repeat(2)],
		["indent'   '", true, NON_BREAKING_SPACE.repeat(3)],
		["indent'\t'", true, NON_BREAKING_SPACE.repeat(4)],
		["indent'\\t'", true, NON_BREAKING_SPACE.repeat(4)],
		["indent'	'", true, NON_BREAKING_SPACE.repeat(4)],

	])("when the input is '%s'", (source, globalIndent, expected) => {
		expect(resolveIndent(source, defaultIndentString, globalIndent, 1)).toBe(expected);
	});

});

describe("skip heading \"Table Of Contents\" based on global and local settings", () => {
	const EMPTY_SOURCE = "";
	const MATCHING_TOC_HEADING = "Table Of Contents";
	it.each([
		[MATCHING_TOC_HEADING, EMPTY_SOURCE, true, true],
		[MATCHING_TOC_HEADING, EMPTY_SOURCE, false, false],
		[MATCHING_TOC_HEADING, DO_REMOVE_TOC, true, true],
		[MATCHING_TOC_HEADING, DO_NOT_REMOVE_TOC, true, false],
		[MATCHING_TOC_HEADING, DO_REMOVE_TOC, false, true],
		[MATCHING_TOC_HEADING, DO_NOT_REMOVE_TOC, false, false],
		[" table of contents  ", EMPTY_SOURCE, true, false],
		["not match table of contents", EMPTY_SOURCE, true, false],

	])("when the input is '%s'", (rawHeadingText, source, doRemoveTocGlobal, expected) => {
		expect(skipTocHeading(rawHeadingText, source, doRemoveTocGlobal)).toBe(expected);
	});

});


describe("format links to work in obsidian, PDF or both based on global and local settings", () => {
	const EMPTY_SOURCE = "";
	it.each([
		[EMPTY_SOURCE, PdfCompatibilityMode.OBSIDIAN, PdfCompatibilityMode.OBSIDIAN],
		[EMPTY_SOURCE, PdfCompatibilityMode.BOTH, PdfCompatibilityMode.BOTH],
		[EMPTY_SOURCE, PdfCompatibilityMode.PDF, PdfCompatibilityMode.PDF],
		["pdfCompatibilityMode: 0", PdfCompatibilityMode.OBSIDIAN, PdfCompatibilityMode.OBSIDIAN],
		["pdfCompatibilityMode: 0", PdfCompatibilityMode.BOTH, PdfCompatibilityMode.OBSIDIAN],
		["pdfCompatibilityMode: 0", PdfCompatibilityMode.PDF, PdfCompatibilityMode.OBSIDIAN],
		["pdfCompatibilityMode: 1", PdfCompatibilityMode.OBSIDIAN, PdfCompatibilityMode.BOTH],
		["pdfCompatibilityMode: 1", PdfCompatibilityMode.BOTH, PdfCompatibilityMode.BOTH],
		["pdfCompatibilityMode: 1", PdfCompatibilityMode.PDF, PdfCompatibilityMode.BOTH],
		["pdfCompatibilityMode: 2", PdfCompatibilityMode.OBSIDIAN, PdfCompatibilityMode.PDF],
		["pdfCompatibilityMode: 2", PdfCompatibilityMode.BOTH, PdfCompatibilityMode.PDF],
		["pdfCompatibilityMode: 2", PdfCompatibilityMode.PDF, PdfCompatibilityMode.PDF],
	])("when the input is '%s'", (source, pdfSetting, expected) => {
		expect(getPdfSettings(source, pdfSetting)).toBe(expected);
	});
});


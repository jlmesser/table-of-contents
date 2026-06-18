import {describe, it, expect} from '@jest/globals';
import {ListType} from "../src/listType";
import {DO_INDENT, DO_NOT_INDENT, NON_BREAKING_SPACE, resolveIndent, resolveSetting} from "../src/util";

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


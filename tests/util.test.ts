import {describe, it, expect} from '@jest/globals';
import {ListType} from "../src/listType";
import {DO_INDENT, DO_NOT_INDENT, resolveIndent, resolveSetting} from "../src/util";

describe("get list type based on global and local settings", () => {
	it.each([
		[ListType, 'numberedList', ListType.bulletedList, ListType.numberedList],
		[ListType, 'numberedList', ListType.numberedList, ListType.numberedList],
		[ListType, 'bulletedList', ListType.bulletedList, ListType.bulletedList],
		[ListType, 'bulletedList', ListType.numberedList, ListType.bulletedList],
		[ListType, '', ListType.bulletedList, ListType.bulletedList],
		[ListType, '', ListType.numberedList, ListType.numberedList],

	])("when the input is '%s'", (enumObject, source, globalDefault, expected) => {
		expect(resolveSetting(enumObject, source, globalDefault)).toBe(expected);
	});

	let indentString = "\t";
	it.each([
		[DO_INDENT, true, indentString],
		[DO_INDENT, false, indentString],
		[DO_NOT_INDENT, true, ""],
		[DO_NOT_INDENT, false, ""],
		["", true, indentString],
		["", false, ""],

	])("when the input is '%s'", (source, globalIndent, expected) => {
		expect(resolveIndent(source, indentString, globalIndent)).toBe(expected);
	});

});


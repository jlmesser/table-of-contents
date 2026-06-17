import {describe, it, expect} from '@jest/globals';
import {getListTypeSetting, ListType} from "../src/listType";

describe("get list type based on global and local settings", () => {
	it.each([
		['numberedList', ListType.bulletedList, ListType.numberedList],
		['numberedList', ListType.numberedList, ListType.numberedList],
		['bulletedList', ListType.bulletedList, ListType.bulletedList],
		['bulletedList', ListType.numberedList, ListType.bulletedList],
		['', ListType.bulletedList, ListType.bulletedList],
		['', ListType.numberedList, ListType.numberedList],

	])("when the input is '%s'", (source, globalDefault, expected) => {
		expect(getListTypeSetting(source, globalDefault)).toBe(expected);
	});
});


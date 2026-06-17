import {describe, it, expect} from '@jest/globals';
import {ListType} from "../src/listType";
import {resolveSetting} from "../src/util";

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
});


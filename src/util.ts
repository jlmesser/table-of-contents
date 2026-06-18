export const NON_BREAKING_SPACE = '&nbsp;';

export const DO_INDENT = "doIndent";
export const DO_NOT_INDENT = "doNotIndent";
export const DO_REMOVE_TOC = "doRemoveToc";
export const DO_NOT_REMOVE_TOC = "doNotRemoveToc";

export function resolveSetting<T extends Record<string, string>>(
	enumObject: T,
	source: string,
	fallback: string
): string {
	const matchedKey = Object.keys(enumObject).find((key) =>
		source.includes(key)
	);
	return matchedKey
		? (<string>(enumObject[matchedKey as keyof T]))
		: fallback;

}

export function resolveIndent(source: string, indentStr: string, globalIndentStr: boolean, currentIndent: number) {
	let localIndentStr = source
		.replace(/(\t|\\t)/g, "    ")
		.match(/indent'(\s*)'/)?.["1"];
	let indent = localIndentStr ? NON_BREAKING_SPACE.repeat(currentIndent * localIndentStr.length)
		: indentStr.repeat(currentIndent);

	return source.includes(DO_INDENT) ? indent
		: source.includes(DO_NOT_INDENT) ? ""
			: globalIndentStr ? indent
				: "";
}

export function skipTocHeading(rawHeadingText: string, source: string, doRemoveTocGlobal: boolean) {
	let isTocStrPresent = rawHeadingText.toLowerCase() === "table of contents";
	const forcesRemove = source.includes(DO_REMOVE_TOC);
	const blocksRemove = source.includes(DO_NOT_REMOVE_TOC);

	return isTocStrPresent && (forcesRemove || (!blocksRemove && doRemoveTocGlobal));
}

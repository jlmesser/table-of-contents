export const DO_INDENT = "doIndent";
export const DO_NOT_INDENT = "doNotIndent";

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

export function resolveIndent(source: string, indent: string, globalIndent: boolean) {
	return source.includes(DO_INDENT) ? indent
		: source.includes(DO_NOT_INDENT) ? ""
			: globalIndent ? indent
				: "";
}

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

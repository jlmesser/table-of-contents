export enum ListType {
	numberedList = "1. ",
	bulletedList = "- ",
}

//todo make more generic for other settings? depends on what settings I implement
export function getListTypeSetting(source: string, globalDefault: string) {
	const matchedKey = Object.keys(ListType).find(key =>
		source.includes(key)
	) as keyof typeof ListType;

	const listFormat = matchedKey
		? ListType[matchedKey]
		: globalDefault;

	console.log("source: " + source);
	console.log("this.settings.listType: " + globalDefault);
	console.log("listStyle: " + listFormat);
	return listFormat;
}

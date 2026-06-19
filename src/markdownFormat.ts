export function cleanMarkdown(text: string): string {
	const WIKILINK_REGEX = /\[\[(?:[^\]|]*\|)?([^\]]*)]]/g; //[[file#section|display text]] -> display text
	const MARKDOWN_LINK_REGEX = /\[([^\]]*)]\([^)]*\)/g; //[text](url) -> text
	// Match inline code blocks, escaped characters, or raw Markdown styling
	const ESCAPE_AND_CODE_REGEX = /`(.+)`|\\([*_~`=[\]])|([*_~`=[\]])/g;

	return text
		.replace(WIKILINK_REGEX, "$1")
		.replace(MARKDOWN_LINK_REGEX, "$1")
		.replace(ESCAPE_AND_CODE_REGEX, (_match, codeBlockContent: string, escapedChar: string) => {
			if (codeBlockContent !== undefined) return codeBlockContent; //don't modify content inside `code blocks`
			if (escapedChar !== undefined) return escapedChar; //keep escaped char, remove backslash
			return ""; //else, strip out
		}).trim();
}

export function createHeadingWikilink(cleanText: string, basename: string, heading: string) {

	let headingText = heading.replace(/^\[{2}|]{2}$/g, '');
	if (headingText.endsWith("|" + cleanText)) { //if renamed internal/wiki link, fix formatting (e.g. [[file name|otherName]])
		let s = headingText.replace(/\|/, "|");
		//todo maybe add config option for PDF compatibility, including basename?
		return "<a class=\"internal-link\" href=\"#" + s + "\" data-href=\"#" + s + "\">" + cleanText + "</a> OR <a href=\"#" + cleanText + "\">" + cleanText + "</a>";
	}
	return "[[" + "#" + headingText + "|" + cleanText + " ]]";
}

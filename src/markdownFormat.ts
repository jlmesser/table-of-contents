import {PdfCompatibilityMode} from "./util";

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

export function createHeadingWikilink(cleanText: string, pdfSetting: number, heading: string) {
	//todo handle headings that have multiple links/are a mix of cases etc
	let headingText = heading.replace(/^\[{2}|]{2}$/g, '');
	if (headingText.endsWith("|" + cleanText)) { //if renamed internal/wiki link, fix formatting (e.g. # [[file name|otherName]])
		let s = headingText.replace(/\|/, "|");
		let obsidianLink = "<a class=\"internal-link\" href=\"#" + s + "\" data-href=\"#" + s + "\">" + cleanText + "</a>";
		let pdfLink = "<a href=\"#" + cleanText + "\">" + cleanText + "</a>";
		switch (pdfSetting) {
			case PdfCompatibilityMode.OBSIDIAN.valueOf():
				return obsidianLink;
			case PdfCompatibilityMode.PDF.valueOf():
				return pdfLink;
			case PdfCompatibilityMode.BOTH.valueOf():
			default:
				return obsidianLink + " | " + pdfLink;
		}
	}
	return "[[#" + headingText + "|" + cleanText + " ]]";
}

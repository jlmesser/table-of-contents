import {PdfCompatibilityMode} from "./util";

export function extracted(rawText: string, stripHeadingForLink    : string, pdfSettings: number, heading: string) {
	const cleanText = cleanMarkdown(rawText, stripHeadingForLink);

	console.log("rawText:" + rawText);
	console.log("cleanText:" + cleanText);

	let message = createHeadingWikilink(cleanText, pdfSettings, heading);
	return {cleanText, message};
}

function replaceOuterLinks(text: string) {
	const WIKILINK_REGEX = /^\[\[.+\|(.+)]]$/; //[[file#section|display text]] -> display text
	const MARKDOWN_LINK_REGEX = /^\[([^\[\]()]+)]\([^\[\]()]+\)$/; //[text](url) -> text
	const BLOCK_LINK_REGEX = /(\[\[)#\^([A-Za-z0-9\-]+]])/;

	return text
		.replace(BLOCK_LINK_REGEX, "$1$2")
		.replace(WIKILINK_REGEX, "$1")
		.replace(MARKDOWN_LINK_REGEX, "$1");
}

function hasInnerLinks(text: string) {
	const innerMarkdownLinkRegex = /\[([^\[\]()]+)]\([^\[\]()]+\)/;
	const innerWikiLinkRegex = /\[\[([^|\]]+)\|([^\]]+)]]/g;
	return innerMarkdownLinkRegex.test(text) || innerWikiLinkRegex.test(text);
}

// Match inline code blocks, escaped characters, or raw Markdown styling
function replaceEscapeCodeBlocks(text: string) {
	const ESCAPE_AND_CODE_REGEX = /`(.+)`|\\([\^*_~`=[\]])|([\^*_~`=[\]])/g;
	return text
		.replace(ESCAPE_AND_CODE_REGEX, (_match, codeBlockContent: string, escapedChar: string) => {
			if (codeBlockContent !== undefined) return codeBlockContent; //don't modify content inside `code blocks`
			if (escapedChar !== undefined) return escapedChar; //keep escaped char, remove backslash
			return ""; //else, strip out
		}).trim();
}

export function cleanMarkdown(text: string, stripHeadingForLink: string): string {
	text = replaceOuterLinks(text);

	if (hasInnerLinks(text)) {
		return stripHeadingForLink;
	}

	return replaceEscapeCodeBlocks(text);
}


export function createHeadingWikilink(cleanText: string, pdfSetting: number, heading: string) {
	//todo handle headings that have multiple links/are a mix of cases etc
	console.log("heading:cleantext" + heading + ":" + cleanText)

	if (cleanText == heading) {
		return "[[#" + heading + " ]]";
	}

	let headingText = heading.replace(/^\[{2}|]{2}$/g, '');

	const strings: string[] = cleanText.split(' ');
	const last = strings.pop();
	console.log("last " + last)
	if (last && headingText.includes("\^" + last)) {
		return "[[#" + cleanText + " ]]";
	}
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

	if (heading.match(/^[^\d\w].*$/)) {
		return "[[#" + headingText + "|" + cleanText + " ]]";
	} else {
		return "[[#" + cleanText + " ]]";
	}


}

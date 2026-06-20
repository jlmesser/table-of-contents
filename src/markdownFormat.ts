import {PdfCompatibilityMode} from "./util";

//todo review all regexes to ensure they're correct and reduce duplication if necessary

export function cleanMarkdown(stripHeadingForLink: string, pdfSettings: number, heading: string) {
	let text = replaceOuterLinks(heading.trim());
	let cleanText = hasInnerLinks(text) ? stripHeadingForLink : replaceEscapeCodeBlocks(text);

	return createHeadingWikilink(cleanText, pdfSettings, heading);
}

function replaceOuterLinks(text: string) {
	const WIKILINK_REGEX = /^\[\[.+\|(.+)]]$/; //[[file#section|display text]] -> display text
	const MARKDOWN_LINK_REGEX = /^\[([^[\]()]+)]\([^[\]()]+\)$/; //[text](url) -> text
	const BLOCK_LINK_REGEX = /(\[\[)#\^([A-Za-z0-9-]+]])/;

	return text
		.replace(BLOCK_LINK_REGEX, "$1$2")
		.replace(WIKILINK_REGEX, "$1")
		.replace(MARKDOWN_LINK_REGEX, "$1");
}

function hasInnerLinks(text: string) {
	const innerMarkdownLinkRegex = /\[([^[\]()]+)]\([^[\]()]+\)/;
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

function createHeadingWikilink(cleanText: string, pdfSetting: number, heading: string) {
	const OPEN_LINK = "[[#";
	const CLOSE_LINK = " ]]";
	const LINK_RENAME = "|";

	if (cleanText == heading) {
		return OPEN_LINK + heading + CLOSE_LINK;
	}

	const headingText = heading.replace(/^\[{2}|]{2}$/g, '');

	if (isBlockLink(cleanText, headingText)) {
		return `${OPEN_LINK}${cleanText}${CLOSE_LINK}`;
	}

	const isRenamedWikilink = headingText.endsWith(LINK_RENAME + cleanText);
	if (isRenamedWikilink) {
		return getHtmlLink(headingText, cleanText, pdfSetting);
	}

	const doLinkRename = heading.match(/^[^\d\w].*$/);
	if (doLinkRename) {
		return `${OPEN_LINK}${headingText}${LINK_RENAME}${cleanText}${CLOSE_LINK}`;
	} else {
		return `${OPEN_LINK}${cleanText}${CLOSE_LINK}`;
	}

}

function isBlockLink(cleanText: string, headingText: string) {
	const lastWord = cleanText.trim().split(/\s+/).pop() || '';
	return headingText.includes(`^${lastWord}`);
}

function getHtmlLink(headingText: string, cleanText: string, pdfSetting: number) {
	let obsidianLink = "<a class=\"internal-link\" href=\"#" + headingText + "\" data-href=\"#" + headingText + "\">" + cleanText + "</a>";
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

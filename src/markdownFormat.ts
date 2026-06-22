import {PdfCompatibilityMode} from "./util";

//todo review all regexes to ensure they're correct and reduce duplication if necessary
const INNER_REFERENCE_LINK_REGEX = /\[(.*)]\[(.*)]/g;
const BLOCK_LINK_REGEX = /(\[\[)#\^([A-Za-z0-9-]+]])/; //[[#^2395bd]]


export function cleanMarkdown(stripHeadingForLink: string, pdfSettings: number, heading: string) {
	const text = replaceOuterLinks(heading.trim());
	const cleanText = hasInnerLinks(text) ? stripHeadingForLink : replaceEscapeCodeBlocks(text);

	const s = createHeadingWikilink(cleanText, pdfSettings, heading);
	console.log("cleaned link: " + s);
	return s;
}

function replaceOuterLinks(text: string) {
	//todo make BLOCK_LINK_REGEX actually check for existing block links in cache instead of regex?

	const WIKILINK_REGEX = /^\[\[.+\|(.+)]]$/; //[[file#section|display text]] -> display text
	const MARKDOWN_LINK_REGEX = /^\[([^[\]()]+)]\([^[\]()]+\)$/; //[text](url) -> text
	const REFERENCE_LINK_REGEX = /^\[(.*)]\[(.*)]$/; //[like][this]
	return text
		.replace(BLOCK_LINK_REGEX, "$1 $2")
		.replace(WIKILINK_REGEX, "$1")
		.replace(MARKDOWN_LINK_REGEX, "$1")
		.replace(REFERENCE_LINK_REGEX, "$1 $2");
}

function hasInnerLinks(text: string) {
	const INNER_LINK_REGEX = /\[([^[\]()]+)]\([^[\]()]+\)/g;
	const INNER_WIKILINK_REGEX = /\[\[([^|\]]+)\|([^\]]+)]]/g;
	return INNER_LINK_REGEX.test(text) || INNER_WIKILINK_REGEX.test(text) || INNER_REFERENCE_LINK_REGEX.test(text);
}

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

	console.log("cleanText " + cleanText);
	console.log("heading " + heading);

	if (cleanText == heading) {
		return OPEN_LINK + heading + CLOSE_LINK;
	}

	const SQUARE_BRACKETS_REGEX = /^\[{2}|]{2}$/g;
	const headingText = heading.replace(SQUARE_BRACKETS_REGEX, '');

	console.log("headingText " + headingText);

	let htmlLink = "";

	const lastWord = cleanText.trim().split(/\s+/).pop() || '';
	if (headingText.includes(`^${lastWord}`) ) {

		const internalBlockLinkedTitleName = /(?:.*\|\^?(.*)\]{2}\^.*)|(?:^#\^(.*$))/;
		const s = headingText.replace(internalBlockLinkedTitleName, "$1$2");

		console.log("headingText " + s);

		return getHtmlLink(s, s, BLOCK_LINK_REGEX.test(heading) ? 0 : pdfSetting, `${OPEN_LINK}${cleanText}${LINK_RENAME}${s}${CLOSE_LINK}`);
		// return getHtmlLink(headingText, cleanText, pdfSetting) + " | " + getHtmlLink( "#^" + lastWord, cleanText, pdfSetting) + " | " + `${OPEN_LINK}${cleanText}${CLOSE_LINK}`;

		// const ct2 = cleanText.replace(" " + lastWord, "");
		// const lw2 = "#^" + lastWord;
		// return
		// getHtmlLink( lw2, ct2, pdfSetting)
		// 	+ " | " + `${OPEN_LINK}${cleanText}${CLOSE_LINK}`
		// 	+ " | " + `${OPEN_LINK}${headingText}${LINK_RENAME}${cleanText}${CLOSE_LINK}`
		// 	+ " | " + `${OPEN_LINK}${lw2}${LINK_RENAME}${ct2}${CLOSE_LINK}` ;
	}


	const isRenamedWikilink = headingText.includes(LINK_RENAME + cleanText);
	const useObsidianHtml = headingText.includes(`\^`) || heading.includes("][");
	if (isRenamedWikilink || INNER_REFERENCE_LINK_REGEX.test(headingText) || useObsidianHtml ) {
		console.log("isRenamedWikilink");
		return getHtmlLink(headingText, cleanText, useObsidianHtml ? 0 : pdfSetting); // both HTML work in PDF for [^1], 1 HTML obsidian none PDF for [^2395bd]
	}

	const FIRST_CHAR_SPECIAL_REGEX = /^[^a-zA-Z0-9].*$/;
	if (heading.match(FIRST_CHAR_SPECIAL_REGEX)) {
		console.log("isFIRST_CHAR_SPECIAL_REGEX");
		return `${OPEN_LINK}${headingText}${LINK_RENAME}${cleanText}${CLOSE_LINK}`;// + " | " + htmlLink; //this for [^1]
	} else {
		console.log("else");
		return `${OPEN_LINK}${cleanText}${CLOSE_LINK}`;// + " | " + htmlLink; //this for [[#^2395bd]] block link
	}

}

function isBlockLink(cleanText: string, headingText: string) {
	const lastWord = cleanText.trim().split(/\s+/).pop() || '';
	return headingText.includes(`^${lastWord}`);
}

function getHtmlLink(headingText: string, cleanText: string, pdfSetting: number, obsidianOverride?: string) {
	const obsidianHtml = `<a class="internal-link" href="#${headingText}" data-href="#${headingText}">${cleanText}</a>`;
	// const decodedText = decodeURIComponent(headingText); //breaks remove caret
	// console.log("cleanText " + cleanText);
	// console.log("headingText " + headingText);
	const pdfLink = `<a href="#${cleanText}">${cleanText}</a>`;
	const obsidianLink = obsidianOverride ? obsidianOverride : obsidianHtml;
	switch (pdfSetting) {
		case PdfCompatibilityMode.OBSIDIAN.valueOf():
			return obsidianLink;
		case PdfCompatibilityMode.PDF.valueOf():
			return pdfLink;
		case PdfCompatibilityMode.BOTH.valueOf():
		default:
			return `${obsidianLink} | ${pdfLink}`;
	}
}



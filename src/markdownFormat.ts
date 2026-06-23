import {PdfCompatibilityMode} from "./util";

//todo add support for headings with same name but unique path e.g. [[#thing#summary]] [[#other thing#summary]]

//Inner matchers are greedy and are for things like "# some heading [[link]] more text"
const INNER_REFERENCE_LINK_REGEX = /\[([^[\]]*)]\[([^[\]]*)]/g; //[like][this]
const INNER_BLOCK_LINK_REGEX = /(\[\[)#\^([A-Za-z0-9-]+]])|(\[\[)#\^([A-Za-z0-9-]+(\|[A-Za-z0-9-]+]]))/g; //[[#^2395bd]]
const INNER_MARKDOWN_LINK_REGEX = /\[([^[\]()]+)]\([^[\]()]+\)/g; //[text](url)
const INNER_WIKILINK_REGEX = /\[\[([^|\]]+)\|([^\]]+)]]/g; //[[file#section|display text]]

//Outer matchers are not greedy, just for the headings which are entirely one link e.g. "# [[note]]"
const OUTER_WIKILINK_REGEX = /^\[\[.+\|(.+)]]$/; //[[file#section|display text]] -> display text
const OUTER_MARKDOWN_LINK_REGEX = /^\[([^[\]()]+)]\([^[\]()]+\)$/; //[text](url) -> text
const OUTER_REFERENCE_LINK_REGEX = /^\[(.*)]\[(.*)]$/; //[like][this] -> like
const OUTER_BLOCK_LINK_REGEX = /^(\[\[#)\^([A-Za-z0-9-]+\|[A-Za-z0-9-]+]])$/; //[[#^2395bd|test]] -> [[#2395bd|test]]

//Renamed matchers are for links like "# [[note title|different link text]]"
const RENAME_BLOCK_WIKI_LINK_REGEX = /\[\[([^|\]]+)\|([^\]]+)]][^^]/g; // [[file|renamed]] or [[#^tag|newname]], not #heading ^tag
const RENAME_BLOCK_LINKS_REGEX = /(\[\[#\^)([^[\]]*\|)([^[\]]*)(]])/g; //[[#^2395bd|renamed]]
const RENAME_CLEAN_TEXT_REGEX = /(([^|[\]\s]*)\|([^|[\]\s]*))/g; //within any | renamed link e.g., 2395bd|test -> test

const FIRST_CHAR_SPECIAL_REGEX = /^[^a-zA-Z0-9]/;
const LINK_TAG_REGEX = /(#\^)/g;
const BRACKETS_REGEX = /\[{2}|]{2}/g;

const OPEN_LINK = "[[#";
const CLOSE_LINK = " ]]";
const LINK_RENAME = "|";

export function cleanMarkdown(strippedHeading: string, pdfSettings: number, originalHeading: string) {
	const preText = preProcessLinks(originalHeading.trim());
	const cleanText = hasInnerLinks(preText) ? strippedHeading : replaceEscapeCodeBlocks(preText);
	return createHeadingLinks(cleanText, pdfSettings, originalHeading);
}

//these replacements are "safe" to get out of the way first,
//they should not cause any issues when we process specific link types.
function preProcessLinks(text: string) {
	return text
		.replace(INNER_BLOCK_LINK_REGEX, "$1$2$3$4")
		.replace(OUTER_WIKILINK_REGEX, "$1")
		.replace(OUTER_MARKDOWN_LINK_REGEX, "$1")
		.replace(INNER_MARKDOWN_LINK_REGEX, "$1")
		.replace(RENAME_BLOCK_WIKI_LINK_REGEX, "$2")
		.replace(OUTER_REFERENCE_LINK_REGEX, "$1")
		.replace(INNER_REFERENCE_LINK_REGEX, "$1");
}

function hasInnerLinks(text: string) {
	return INNER_MARKDOWN_LINK_REGEX.test(text) || INNER_REFERENCE_LINK_REGEX.test(text) || INNER_WIKILINK_REGEX.test(text);
}

function replaceEscapeCodeBlocks(text: string) {
	const ESCAPE_AND_CODE_REGEX = /`(.+)`|\\([\^*_~`=[\]])|([\^*_~`=[\]])/g;
	return text
		.replace(ESCAPE_AND_CODE_REGEX, (_match, codeBlockContent: string, escapedChar: string) => {
			if (codeBlockContent !== undefined) return codeBlockContent; //don't modify content inside `code blocks`
			if (escapedChar !== undefined) return escapedChar; //keep escaped char, remove backslash e.g., \* -> *
			return ""; //else, strip out
		}).trim();
}

//remove leading and trailing square brackets [[like this]] -> like this
function stripSquare(heading: string) {
	return heading.replace(/^\[{2}|]{2}$/g, '');
}

function formatHeadingBlockTags(headingText: string) {
	const BLOCK_LINK_NAME_REGEX = /.*\|\^?(.*)]{2}\^.*|^#\^(.*$)/; //handles #heading ^tag and [[#^2395bd]]
	return headingText.trim().replace(BLOCK_LINK_NAME_REGEX, "$1$2");
}

function createHeadingLinks(cleanText: string, pdfSetting: number, heading: string): string {
	if (cleanText === heading) {
		return `${OPEN_LINK}${heading}${CLOSE_LINK}`;
	}

	let headingText = stripSquare(heading);

	if (isBlockLink(cleanText, headingText)) {
		const blockTag = formatHeadingBlockTags(headingText);
		const forceObsidian = INNER_BLOCK_LINK_REGEX.test(heading) ? 0 : pdfSetting;
		const fallbackText = `${OPEN_LINK}${cleanText}${LINK_RENAME}${blockTag}${CLOSE_LINK}`;
		return getHtmlLink(blockTag, forceObsidian, fallbackText, true);
	}

	if (OUTER_BLOCK_LINK_REGEX.test(heading)) {
		headingText = headingText.replace(OUTER_BLOCK_LINK_REGEX, "$1$2");
		return getHtmlLink(cleanText, pdfSetting, formatInternalBlockLink(headingText));
	}

	if (INNER_BLOCK_LINK_REGEX.test(heading)) {
		headingText = headingText.replace(RENAME_BLOCK_LINKS_REGEX, "$1$3$4");
		const formattedLink = formatInternalBlockLink(headingText);
		const resolvedText = formattedLink.replace(RENAME_CLEAN_TEXT_REGEX, "$3");
		return getHtmlLink(resolvedText, pdfSetting, formattedLink);
	}

	const isRenamedWikilink = headingText.includes(LINK_RENAME + cleanText);
	const useObsidianHtml = heading.includes("][")
		|| (RENAME_BLOCK_WIKI_LINK_REGEX.test(heading) && !INNER_MARKDOWN_LINK_REGEX.test(heading))
		|| /(?<!#)\^/.test(headingText);

	if (isRenamedWikilink || INNER_REFERENCE_LINK_REGEX.test(headingText) || useObsidianHtml || headingText.includes('#^')) {
		const targetPdfSetting = useObsidianHtml ? PdfCompatibilityMode.OBSIDIAN.valueOf() : pdfSetting;
		return getHtmlLink(cleanText, targetPdfSetting, formatInternalBlockLink(headingText));
	}

	if (FIRST_CHAR_SPECIAL_REGEX.test(heading) || INNER_MARKDOWN_LINK_REGEX.test(heading)) {
		return `${OPEN_LINK}${headingText}${LINK_RENAME}${cleanText}${CLOSE_LINK}`;
	}

	return `${OPEN_LINK}${cleanText}${CLOSE_LINK}`;
}


function formatInternalBlockLink(headingText: string): string {
	return headingText.includes('#^')
		? headingText.replace(LINK_TAG_REGEX, '').replace(BRACKETS_REGEX, '')
		: headingText;
}

function isBlockLink(cleanText: string, headingText: string): boolean {
	const tokens = cleanText.trim().split(/\s+/);
	const lastWord = tokens[tokens.length - 1] || '';
	return headingText.includes(`^${lastWord}`);
}

function getHtmlLink(cleanText: string, pdfSetting: number, headingText: string, override: boolean = false) {
	let heading = headingText.startsWith("#") ? headingText : `#${headingText}`;
	let cleaned = headingText.startsWith("#") ? cleanText : `#${cleanText}`;

	const obsidianHtml = `<a class="internal-link" href="${heading}" data-href="${heading}">${cleanText}</a>`;
	const pdfLink = `<a href="${cleaned}">${cleanText}</a>`;
	const obsidianLink = override ? headingText : obsidianHtml;

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



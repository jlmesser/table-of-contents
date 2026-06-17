export function cleanMarkdown(text: string): string {
	console.log("pre-regex text: " + text);
	//todo refactor regex
	return text
		//handle internal links: [[file#section|display text]] -> display text
		// If a '|' exists, capture everything after it. If not, capture the whole string.
		.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")

		//handle standard links: [text](url) -> text
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")

		//inline code blocks and formatting
		.replace(/`(.+)`|\\([*_~`=\[\]])|([*_~`=\[\]])/g, (match, g1, g2) => {
			if (g1 !== undefined) return g1;
			if (g2 !== undefined) return g2;
			return '';
		})
		.trim();
}

export function formatLink(cleanText: string, basename: string, heading: string) {
	console.log("cleanText: " + cleanText);
	console.log("basename: " + basename);
	console.log("heading: " + heading);

	return "[[" + basename + "#" + formatHeadingLink(heading, "|" + cleanText) + " ]]";
}

function formatHeadingLink(heading: string, suffix: string): string {
	let headingText = heading.replace(/^\[{2}|\]{2}$/g, '');
	if (headingText.endsWith(suffix)) { //if renamed internal/wiki link fix formatting (e.g. [[file name|othername]])
		return headingText.replace(/\|/, " ") + "]" + suffix;
	}
	return headingText + suffix;
}

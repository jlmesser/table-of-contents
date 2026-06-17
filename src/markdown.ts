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

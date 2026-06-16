export function cleanMarkdown(text: string): string {
	return text
		.replace(/\*\*|__/g, "") //bold
		.replace(/[*_]/g, "") //italic
		.replace(/==/g, "") //highlight
		.replace(/`([^`]+)`/g, "$1") //code block
		.trim();
	//todo add handling for strikethrough and other Markdown stuff
	//(there might be a strip formatting helper method somewhere)
}

export function cleanMarkdown(text: string): string {
	return text
		.replace(/[*_~`=]/g, "").trim();

	//todo handle escaped characters e.g. \*
	//todo handle brackets eg ()
	//todo handle external links eg [text](url) - currently link to heading works but is ugly
	//todo handle internal links or [[ToC bugs]] - link to heading broken, link to other file works but is ugly

	//(there might be a strip formatting helper method somewhere)
	//yep there's stripHeading and stripHeadingForLink, not sure if they're worth using though
}

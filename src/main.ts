import {
	Plugin,
	MarkdownRenderer,
	MarkdownRenderChild,
	stripHeading,
	stripHeadingForLink,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	TocPluginSettings,
	TocSettingTab,
} from './settings';
import {cleanMarkdown} from './markdown';

//todo add tests!!
export default class TableOfContents extends Plugin {
	settings!: TocPluginSettings;

	async onload() {
		await this.loadSettings();

		//todo add stuff to readme about how to use this
		this.registerMarkdownCodeBlockProcessor("custom-toc", async (source, el, ctx) => {

			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) return;

			const fileCache = this.app.metadataCache.getFileCache(activeFile);
			const headings = fileCache?.headings || [];

			// Clear the container to prevent duplicate renders
			el.empty();

			if (headings.length === 0) {
				el.createEl("p", {text: "No headings found to generate table of contents", cls: "toc-empty-msg"});
				return;
			}

			let currentIndent = 0;
			const headingStack: number[] = [];
			const tocLines: string[] = [];

			//todo refactor out - process the headings list
			headings.forEach(heading => {

				let strippedHeading = stripHeading(heading.heading);
				let strippedHeadingForLink = stripHeadingForLink(heading.heading);

				console.log("strippedHeading: " + strippedHeading);
				console.log("stripHeadingForLink: " + strippedHeadingForLink);

				const currentLevel = heading.level;
				const rawText = heading.heading.trim();

				// todo maybe remove - buggy - or make configurable and actually fix it
				if (rawText.toLowerCase() === "table of contents") return;

				// Calculate indent depth
				if (headingStack.length === 0) {
					headingStack.push(currentLevel);
					currentIndent = 0;
				} else {
					const top = headingStack.at(-1);

					if (top === undefined) {
						return;
					}

					if (currentLevel > top) {
						headingStack.push(currentLevel);
						currentIndent++;
					} else if (currentLevel < top) {
						while (headingStack.length > 0 && headingStack.at(-1)! > currentLevel) {
							headingStack.pop();
							currentIndent = Math.max(0, currentIndent - 1);
						}
						if (headingStack.length === 0 || headingStack.at(-1) !== currentLevel) {
							headingStack.push(currentLevel);
						}
					}
				}

				const indent = "\t".repeat(currentIndent);
				const cleanText = cleanMarkdown(rawText);

				//todo use obsidian api to create link?
				const openLink = "[[" + activeFile.basename + "#" + heading.heading + "|";
				const closeLink = "]]";

				tocLines.push(indent + "1. " + openLink + cleanText + closeLink);
			});

			const fullMarkdownToc = tocLines.join('\n');
			const renderChild = new MarkdownRenderChild(el);
			ctx.addChild(renderChild);

			await MarkdownRenderer.render(
				this.app,
				fullMarkdownToc,
				el,
				ctx.sourcePath,
				renderChild
			);
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TocSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<TocPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


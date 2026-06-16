import {
	Plugin,
	MarkdownRenderer,
	MarkdownRenderChild,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	TocPluginSettings,
	TocSettingTab,
} from './settings';

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
				el.createEl("p", { text: "No headings found to generate table of contents", cls: "toc-empty-msg" });
				return;
			}

			let currentIndent = 0;
			const headingStack: number[] = [];
			const tocLines: string[] = [];

			// Helper function to clean Markdown formatting characters
			const cleanMarkdown = (text: string): string => {
				return text
					.replace(/\*\*|__/g, "") //bold
					.replace(/[*_]/g, "") //italic
					.replace(/==/g, "") //highlight
					.replace(/`([^`]+)`/g, "$1") //code block
					.trim();
				//todo add handling for strikethrough and other Markdown stuff
				//(there might be a strip formatting helper method somewhere)
			};

			//todo refactor out - process the headings list
			headings.forEach(heading => {
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

					//todo fix errors
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


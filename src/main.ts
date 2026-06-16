import {
	Plugin,
	MarkdownRenderer,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from './settings';

//todo add tests!!
export default class TableOfContents extends Plugin {
	settings!: MyPluginSettings;

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
				el.createEl("p", { text: "No headings found to generate ToC", cls: "toc-empty-msg" });
				return;
			}

			let currentIndent = 0;
			let headingStack: number[] = [];
			let tocLines: string[] = [];

			// Helper function to clean markdown formatting characters
			const cleanMarkdown = (text: string): string => {
				return text
					.replace(/\*\*|__/g, "")
					.replace(/\*|_/g, "")
					.replace(/==/g, "")
					.replace(/`([^`]+)`/g, "$1")
					.trim();
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
					let top = headingStack[headingStack.length - 1];
					//todo fix errors
					if (currentLevel > top) {
						headingStack.push(currentLevel);
						currentIndent++;
					} else if (currentLevel < top) {
						while (headingStack.length > 0 && headingStack[headingStack.length - 1] > currentLevel) {
							headingStack.pop();
							currentIndent = Math.max(0, currentIndent - 1);
						}
						if (headingStack.length === 0 || headingStack[headingStack.length - 1] !== currentLevel) {
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
			await MarkdownRenderer.render(
				this.app,
				fullMarkdownToc,
				el,
				ctx.sourcePath,
				this
			);
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


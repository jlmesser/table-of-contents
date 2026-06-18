import {MarkdownRenderChild, MarkdownRenderer, Plugin, TFile,} from 'obsidian';
import {DEFAULT_SETTINGS, TocPluginSettings, TocSettingTab,} from './settings';
import {cleanMarkdown, createHeadingWikilink} from './markdownFormat';
import {resolveIndent, resolveSetting, skipTocHeading, ListType} from "./util";

export default class TableOfContents extends Plugin {
	settings!: TocPluginSettings;

	async onload() {
		await this.loadSettings();

		//todo add stuff to readme about how to use this
		this.registerMarkdownCodeBlockProcessor("custom-toc", async (source, el, ctx) => {

			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) return;

			const headings = this.app.metadataCache.getFileCache(activeFile)?.headings || [];

			// Clear the container to prevent duplicate renders
			el.empty();

			if (headings.length === 0) {
				el.createEl("p", {text: "No headings found to generate table of contents", cls: "toc-empty-msg"});
				return;
			}

			const tocLines = headings
				.map(this.mapToTocLine(source, activeFile))
				.filter((line): line is string => line !== null);

			const renderChild = new MarkdownRenderChild(el);
			ctx.addChild(renderChild);

			await MarkdownRenderer.render(
				this.app,
				tocLines.join('\n'),
				el,
				ctx.sourcePath,
				renderChild
			);
		});

		this.addSettingTab(new TocSettingTab(this.app, this));
	}

	private mapToTocLine(source: string, activeFile: TFile): (heading: {
		level: number;
		heading: string;
	}) => string | null {
		let currentIndent = 0;
		const headingStack: number[] = [];

		return (heading: { level: number; heading: string; }) => {
			const currentLevel = heading.level;
			const rawText = heading.heading.trim();

			if (skipTocHeading(rawText, source, this.settings.doRemoveToc)) {
				return null;
			}

			if (headingStack.length === 0) {
				headingStack.push(currentLevel);
				currentIndent = 0;
			} else {
				const top = headingStack.at(-1);

				if (top === undefined) {
					console.warn("Top heading undefined")
					return null;
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

			const indent = resolveIndent(source, this.settings.indentStr, this.settings.doIndent, currentIndent);
			const cleanText = cleanMarkdown(rawText);

			let message = createHeadingWikilink(cleanText, activeFile.basename, heading.heading);
			let listStyle = resolveSetting(ListType, source, this.settings.listType);

			return indent + listStyle + message;
		};
	}

	onunload() {
	}

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


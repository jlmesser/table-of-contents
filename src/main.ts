import {MarkdownRenderChild, MarkdownRenderer, Plugin, stripHeading, stripHeadingForLink} from 'obsidian';
import {DEFAULT_SETTINGS, TocPluginSettings, TocSettingTab,} from './settings';
import {extracted} from './markdownFormat';
import {getPdfSettings, ListType, resolveIndent, resolveSetting, skipTocHeading} from "./util";

export default class TableOfContents extends Plugin {
	settings!: TocPluginSettings;

	async onload() {
		await this.loadSettings();

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
				.map(this.mapToTocLine(source))
				.filter((line): line is string => line !== null);

			const renderChild = new MarkdownRenderChild(el);
			ctx.addChild(renderChild);

			let markdown = tocLines.join('\n');
			console.log("markdown:" + markdown)
			await MarkdownRenderer.render(
				this.app,
				markdown,
				el,
				ctx.sourcePath,
				renderChild
			);
		});

		this.addSettingTab(new TocSettingTab(this.app, this));
	}

	private mapToTocLine(source: string): (heading: {
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

			const s1 = stripHeadingForLink(rawText);
			console.log("stripHeadingForLink:"+ s1);
			const s = stripHeading(rawText);
			console.log("stripHeading:"+ s);
			const pdfSettings = getPdfSettings(source, this.settings.pdfCompatibilityMode);
			let {cleanText, message} = extracted.call(this, rawText, s, pdfSettings, heading.heading);

			console.log("clean=stripped:"+ (cleanText == s && cleanText == s1));
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


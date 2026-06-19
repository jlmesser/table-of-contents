import {App, PluginSettingTab, Setting} from 'obsidian';
import TableOfContents from './main';
import {ListType, NON_BREAKING_SPACE, PdfCompatibilityMode} from "./util";

export interface TocPluginSettings {
	listType: string;
	doIndent: boolean;
	indentStr: string;
	doRemoveToc: boolean;
	pdfCompatibilityMode: number;
}

export const DEFAULT_SETTINGS: TocPluginSettings = {
	listType: ListType.numberedList,
	doIndent: true,
	indentStr: "\t",
	doRemoveToc: true,
	pdfCompatibilityMode: 1,
};

export class TocSettingTab extends PluginSettingTab {
	plugin: TableOfContents;

	constructor(app: App, plugin: TableOfContents) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Indent nested headings in list')
			.setDesc('Default nesting setting for all notes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.doIndent)
				.onChange(async (value) => {
					this.plugin.settings.doIndent = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Remove table of contents heading (if present) from list')
			.setDesc('Default setting to remove toc heading from toc itself')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.doRemoveToc)
				.onChange(async (value) => {
					this.plugin.settings.doRemoveToc = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('List type')
			.setDesc('Set the default bullet type for all notes')
			.addDropdown(dropdown => dropdown
				.addOption(ListType.numberedList, 'Numberedlist')
				.addOption(ListType.bulletedList, 'Bulletedlist')
				.setValue(this.plugin.settings.listType)
				.onChange(async (value) => {
					this.plugin.settings.listType = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('PDF compatibility mode')
			.setDesc('Set the default PDF compatibility mode for all notes')
			.addDropdown(dropdown => dropdown
				.addOption(PdfCompatibilityMode.OBSIDIAN.toString(), 'OBSIDIAN')
				.addOption(PdfCompatibilityMode.BOTH.toString(), 'BOTH')
				.addOption(PdfCompatibilityMode.PDF.toString(), 'PDF')
				.setValue(this.plugin.settings.pdfCompatibilityMode.toString())
				.onChange(async (value) => {
					this.plugin.settings.pdfCompatibilityMode = +value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Indent string')
			.setDesc('Set the default indent string for all notes')
			.addDropdown(dropdown => dropdown
				.addOption("\t", 'Tab')
				.addOption(NON_BREAKING_SPACE.repeat(3), '3 Spaces')
				.addOption(NON_BREAKING_SPACE.repeat(2), '2 Spaces')
				.addOption(NON_BREAKING_SPACE, '1 Space')
				.setValue(this.plugin.settings.indentStr)
				.onChange(async (value) => {
					this.plugin.settings.indentStr = value;
					await this.plugin.saveSettings();
				}));

	}
}

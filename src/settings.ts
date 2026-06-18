import {App, PluginSettingTab, Setting} from 'obsidian';
import TableOfContents from './main';
import {ListType} from "./listType";
import {NON_BREAKING_SPACE} from "./util";

export interface TocPluginSettings {
	listType: string;
	doIndent: boolean;
	indentStr: string;
}

export const DEFAULT_SETTINGS: TocPluginSettings = {
	listType: ListType.numberedList,
	doIndent: true,
	indentStr: "\t",
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
			.setName('Indent nested headings in ToC list')
			.setDesc('For local settings use doIndent and doNotIndent')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.doIndent)
				.onChange(async (value) => {
					this.plugin.settings.doIndent = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('List Type')
			.setDesc('Set the default bullet type for all notes')
			.addDropdown(dropdown => dropdown
				.addOption(ListType.numberedList, 'numberedList')
				.addOption(ListType.bulletedList, 'bulletedList')
				.setValue(this.plugin.settings.listType)
				.onChange(async (value) => {
					this.plugin.settings.listType = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Indent String')
			.setDesc('Set the default indent string for all notes')
			.addDropdown(dropdown => dropdown
				.addOption("\t", 'tab')
				.addOption(NON_BREAKING_SPACE.repeat(3), '3 spaces')
				.addOption(NON_BREAKING_SPACE.repeat(2), '2 spaces')
				.addOption(NON_BREAKING_SPACE, '1 space')
				.setValue(this.plugin.settings.indentStr)
				.onChange(async (value) => {
					this.plugin.settings.indentStr = value;
					await this.plugin.saveSettings();
				}));

	}
}

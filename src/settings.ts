import { App, PluginSettingTab, Setting } from 'obsidian';
import TableOfContents from './main';
import {ListType} from "./listType";

export interface TocPluginSettings {
	listType: string;
}

export const DEFAULT_SETTINGS: TocPluginSettings = {
	listType: ListType.numberedList,
};

export class TocSettingTab extends PluginSettingTab {
	plugin: TableOfContents;

	constructor(app: App, plugin: TableOfContents) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

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
	}
}

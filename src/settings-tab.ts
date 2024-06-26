import { App, PluginSettingTab, Setting } from "obsidian";

import MetaKanban from "@/main";
import { defaultSettings } from "@/settings";

export class MetaKanbanSettingsTab extends PluginSettingTab {
	plugin: MetaKanban;

	constructor(app: App, plugin: MetaKanban) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();
		this.containerEl.createEl("h2", {
			text: "My Plugin Settings",
		});

		new Setting(this.containerEl)
			.setName("Demo of settings")
			.setDesc(
				createFragment((f) => {
					f.createSpan({
						text: "Description for setting goes here ",
					});
					f.createEl("a", {
						text: "Link to additional useful materials",
						href: "#",
					});
					f.createSpan({ text: " syntax." });
				}),
			)
			.addText((t) => {
				t.setValue(String(this.plugin.settings.demoSetting));
				t.onChange(async (v) => {
					this.plugin.settings.demoSetting = v.length
						? v
						: defaultSettings.demoSetting;
					await this.plugin.saveSettings();
				});
			});
	}
}

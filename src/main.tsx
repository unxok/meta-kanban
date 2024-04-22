import { Notice, Plugin } from "obsidian";

import React from "react";
import { createRoot } from "react-dom/client";

import { defaultSettings, TSettings } from "@/settings";
import { MetaKanbanSettingsTab } from "@/settings-tab";
import { loadData } from "@/saveload";

import App from "@/components/App";

/**
 * Loads the dependencies (plugins) that your plugin requires
 * @returns true if successful, false if fail
 */
export const loadDependencies = async () => {
	const DATAVIEW = "dataview";
	const METAEDIT = "metaedit";
	// @ts-ignore
	const plugins = app.plugins;
	if (
		!plugins.enabledPlugins.has(DATAVIEW) ||
		!plugins.enabledPlugins.has(METAEDIT)
	) {
		return false;
	}
	await plugins.loadPlugin(DATAVIEW);
	await plugins.loadPlugin(METAEDIT);
	return true;
};

export default class MetaKanban extends Plugin {
	settings: TSettings;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new MetaKanbanSettingsTab(this.app, this));

		app.workspace.onLayoutReady(async () => {
			this.registerCodeBlock();
		});

		this.addCommand({
			id: `insert`,
			name: `Insert My Plugin`,
			editorCallback: (e, _) => {
				// e.replaceSelection("```meta-kanban\n```\n");
			},
			callback: () => this.registerCodeBlock(),
		});
	}

	registerCodeBlock() {
		this.registerMarkdownCodeBlockProcessor("meta-kanban", (s, e, i) => {
			console.log(s);
			e.empty();
			const root = createRoot(e);
			root.render(
				<React.StrictMode>
					<App
						data={s}
						getSectionInfo={() => i.getSectionInfo(e)}
						settings={this.settings}
						app={this.app}
						plugin={this}
					/>
				</React.StrictMode>,
			);
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

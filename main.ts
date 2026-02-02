import { App, Plugin, PluginSettingTab, Setting, TFile, Notice } from 'obsidian';
import { extractKeywordsAndTags, updateMetadata } from './metadataExtractor';

interface MetadataUpdaterSettings {
	keywordExtractionEnabled: boolean;
	timestampEnabled: boolean;
	maxKeywords: number;
	useHierarchicalTags: boolean;
}

const DEFAULT_SETTINGS: MetadataUpdaterSettings = {
	keywordExtractionEnabled: true,
	timestampEnabled: true,
	maxKeywords: 10,
	useHierarchicalTags: true
}

export default class MetadataUpdaterPlugin extends Plugin {
	settings: MetadataUpdaterSettings;

	async onload() {
		await this.loadSettings();

		// 添加命令：更新当前笔记的元数据
		this.addCommand({
			id: 'update-current-note-metadata',
			name: 'Update current note metadata',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					if (!checking) {
						this.updateNoteMetadata(activeFile);
					}
					return true;
				}
				return false;
			}
		});

		// 添加命令：批量更新所有笔记的元数据
		this.addCommand({
			id: 'update-all-notes-metadata',
			name: 'Update all notes metadata',
			callback: () => {
				this.updateAllNotesMetadata();
			}
		});

		// 添加状态栏图标
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Metadata Updater');

		// 添加设置面板
		this.addSettingTab(new MetadataUpdaterSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async updateNoteMetadata(file: TFile) {
		try {
			const content = await this.app.vault.read(file);
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter || {};

			const { keywords, tags } = extractKeywordsAndTags(content, {
				maxKeywords: this.settings.maxKeywords,
				useHierarchicalTags: this.settings.useHierarchicalTags
			});

			const metadata: Record<string, any> = {};

			if (this.settings.keywordExtractionEnabled) {
				metadata.keywords = keywords;
				metadata.tags = tags;
			}

			if (this.settings.timestampEnabled) {
				metadata.updated = new Date().toISOString();
				if (!frontmatter.created) {
					metadata.created = new Date().toISOString();
				}
			}

			const updatedContent = updateMetadata(content, metadata);
			await this.app.vault.modify(file, updatedContent);

			new Notice(`Metadata updated for: ${file.basename}`);
		} catch (error) {
			new Notice(`Error updating metadata: ${error}`);
		}
	}

	async updateAllNotesMetadata() {
		const files = this.app.vault.getMarkdownFiles();
		let count = 0;

		for (const file of files) {
			await this.updateNoteMetadata(file);
			count++;
		}

		new Notice(`Updated metadata for ${count} notes`);
	}
}

class MetadataUpdaterSettingTab extends PluginSettingTab {
	plugin: MetadataUpdaterPlugin;

	constructor(app: App, plugin: MetadataUpdaterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Keyword extraction')
			.setDesc('Enable automatic keyword extraction from note content')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.keywordExtractionEnabled)
				.onChange(async (value) => {
					this.plugin.settings.keywordExtractionEnabled = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Timestamp')
			.setDesc('Add UTC timestamps (created/updated) to notes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.timestampEnabled)
				.onChange(async (value) => {
					this.plugin.settings.timestampEnabled = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max keywords')
			.setDesc('Maximum number of keywords to extract')
			.addText(text => text
				.setPlaceholder('10')
				.setValue(this.plugin.settings.maxKeywords.toString())
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num) && num > 0) {
						this.plugin.settings.maxKeywords = num;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('Hierarchical tags')
			.setDesc('Use hierarchical tag structure (e.g., AI/LLM/ChatGPT)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useHierarchicalTags)
				.onChange(async (value) => {
					this.plugin.settings.useHierarchicalTags = value;
					await this.plugin.saveSettings();
				}));
	}
}

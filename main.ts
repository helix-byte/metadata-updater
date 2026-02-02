import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, TextAreaComponent, Modal, ButtonComponent } from 'obsidian';
import { extractKeywordsAndTags, updateMetadata } from './metadataExtractor';
import { parseKeywordConfig, mergeConfigs, validateConfig, generateExampleConfig } from './keywordConfigParser';

interface CustomConfig {
	name: string;
	content: string;
}

interface MetadataUpdaterSettings {
	keywordExtractionEnabled: boolean;
	timestampEnabled: boolean;
	maxKeywords: number;
	useHierarchicalTags: boolean;
	customConfigs: CustomConfig[];
}

const DEFAULT_SETTINGS: MetadataUpdaterSettings = {
	keywordExtractionEnabled: true,
	timestampEnabled: true,
	maxKeywords: 10,
	useHierarchicalTags: true,
	customConfigs: []
}

export default class MetadataUpdaterPlugin extends Plugin {
	settings: MetadataUpdaterSettings;
	defaultConfigContent: string = '';

	async onload() {
		// 加载默认配置文件
		await this.loadDefaultConfig();

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

	async loadDefaultConfig() {
		try {
			const defaultConfigPath = '.obsidian/plugins/metadata-updater/default-keywords.conf';
			if (await this.app.vault.adapter.exists(defaultConfigPath)) {
				this.defaultConfigContent = await this.app.vault.adapter.read(defaultConfigPath);
			} else {
				// 如果默认配置文件不存在，使用内置的示例
				this.defaultConfigContent = generateExampleConfig();
			}
		} catch (error) {
			console.error('Failed to load default config:', error);
			this.defaultConfigContent = generateExampleConfig();
		}
	}

	async loadAllConfigs() {
		const configs = [];
		
		// 加载默认配置
		if (this.defaultConfigContent) {
			try {
				const config = parseKeywordConfig(this.defaultConfigContent);
				configs.push(config);
			} catch (error) {
				console.error('Failed to parse default config:', error);
			}
		}
		
		// 加载自定义配置
		for (const customConfig of this.settings.customConfigs) {
			try {
				const config = parseKeywordConfig(customConfig.content);
				configs.push(config);
			} catch (error) {
				console.error('Failed to parse custom config:', error);
			}
		}
		
		return mergeConfigs(configs);
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

			// 加载所有配置
			const mergedConfig = await this.loadAllConfigs();

			const { keywords, tags } = extractKeywordsAndTags(content, {
				maxKeywords: this.settings.maxKeywords,
				useHierarchicalTags: this.settings.useHierarchicalTags,
				config: mergedConfig
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

		containerEl.createEl('h2', { text: '基本设置' });

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

		// 配置文件管理部分
		containerEl.createEl('h2', { text: '关键词分类配置' });
		
		const configDesc = containerEl.createDiv({ cls: 'setting-item-description' });
		configDesc.innerHTML = `
			使用类似 Python 的缩进语法定义关键词分类层次结构。<br>
			每级缩进使用 2 个空格。以 <code>#</code> 开头的行为注释。<br>
			可以添加多个配置文件，它们会同时生效。
		`;

		// 显示默认配置
		const defaultConfigSetting = new Setting(containerEl)
			.setName('默认配置')
			.setDesc('内置的默认关键词分类配置')
			.addButton(button => button
				.setButtonText('查看')
				.onClick(() => {
					this.showConfigModal('默认配置', this.plugin.defaultConfigContent, false);
				}));

		// 自定义配置列表
		const customConfigContainer = containerEl.createDiv({ cls: 'custom-config-list' });
		
		this.renderCustomConfigs(customConfigContainer);

		// 添加新配置按钮
		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('添加自定义配置')
				.setCta()
				.onClick(() => {
					this.showConfigModal('添加自定义配置', generateExampleConfig(), true);
				}));
	}

	renderCustomConfigs(container: HTMLElement) {
		container.empty();

		if (this.plugin.settings.customConfigs.length === 0) {
			container.createEl('div', { 
				text: '暂无自定义配置',
				cls: 'empty-config-message'
			});
			return;
		}

		this.plugin.settings.customConfigs.forEach((customConfig, index) => {
			const configItem = new Setting(container)
				.setName(customConfig.name)
				.addButton(button => button
					.setButtonText('编辑')
					.onClick(() => {
						this.showConfigModal(customConfig.name, customConfig.content, true, index);
					}))
				.addButton(button => button
					.setButtonText('删除')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.customConfigs.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));

			// 显示配置预览（前几行）
			const preview = container.createEl('div', {
				cls: 'config-preview',
				text: customConfig.content.split('\n').slice(0, 3).join('\n') + (customConfig.content.split('\n').length > 3 ? '\n...' : '')
			});
			configItem.controlEl.appendChild(preview);
		});
	}

	showConfigModal(title: string, content: string, isEditable: boolean, editIndex?: number) {
		const modal = new ConfigModal(this.app, title, content, isEditable, async (name, newContent) => {
			if (isEditable && editIndex !== undefined) {
				this.plugin.settings.customConfigs[editIndex] = { name, content: newContent };
			} else if (isEditable) {
				this.plugin.settings.customConfigs.push({ name, content: newContent });
			}
			await this.plugin.saveSettings();
			this.display();
		});
		modal.open();
	}
}

class ConfigModal extends Modal {
	content: string;
	name: string;
	isEditable: boolean;
	onSave: (name: string, content: string) => void;
	textArea: TextAreaComponent;
	nameInput: any;

	constructor(app: App, title: string, content: string, isEditable: boolean, onSave: (name: string, content: string) => void) {
		super(app);
		this.content = content;
		this.name = title;
		this.isEditable = isEditable;
		this.onSave = onSave;
		this.titleEl.setText(title);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		// 配置名称输入框
		if (this.isEditable) {
			const nameContainer = contentEl.createDiv({ cls: 'config-name-container' });
			nameContainer.createEl('label', { 
				text: '配置名称: ',
				cls: 'setting-item-name'
			});
			
			const nameInput = contentEl.createEl('input', {
				type: 'text',
				value: this.name,
				cls: 'config-name-input'
			});
			nameInput.style.width = '100%';
			nameInput.style.marginBottom = '16px';
			this.nameInput = nameInput;
		}

		contentEl.createEl('p', { 
			text: '使用类似 Python 的缩进语法。每级缩进使用 2 个空格。',
			cls: 'setting-item-description'
		});

		const textArea = new TextAreaComponent(contentEl);
		textArea.setValue(this.content);
		textArea.inputEl.setAttr('rows', '20');
		textArea.inputEl.style.width = '100%';
		textArea.inputEl.style.fontFamily = 'monospace';
		textArea.inputEl.readOnly = !this.isEditable;
		this.textArea = textArea;

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		if (this.isEditable) {
			const saveButton = new ButtonComponent(buttonContainer);
			saveButton.setButtonText('保存');
			saveButton.setCta();
			saveButton.onClick(async () => {
				const newName = this.nameInput.value.trim() || this.name;
				const newContent = this.textArea.getValue();
				const errors = validateConfig(newContent);
				
				if (errors.length > 0) {
					new Notice(`配置格式错误:\n${errors.join('\n')}`);
					return;
				}
				
				this.onSave(newName, newContent);
				this.close();
			});

			const validateButton = new ButtonComponent(buttonContainer);
			validateButton.setButtonText('验证');
			validateButton.onClick(() => {
				const newContent = this.textArea.getValue();
				const errors = validateConfig(newContent);
				
				if (errors.length > 0) {
					new Notice(`配置格式错误:\n${errors.join('\n')}`);
				} else {
					new Notice('配置格式正确');
				}
			});
		}

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText('取消');
		cancelButton.onClick(() => {
			this.close();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

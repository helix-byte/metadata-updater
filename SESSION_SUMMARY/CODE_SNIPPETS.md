# 代码片段集锦

## TypeScript 接口设计

### 基础接口定义
```typescript
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
```

---

## Obsidian 插件核心结构

### 插件主类
```typescript
import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, TextAreaComponent, Modal, ButtonComponent } from 'obsidian';

export default class MetadataUpdaterPlugin extends Plugin {
	settings: MetadataUpdaterSettings;

	async onload() {
		// 加载设置
		await this.loadSettings();

		// 添加命令
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

		// 添加状态栏
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Metadata Updater');

		// 添加设置面板
		this.addSettingTab(new MetadataUpdaterSettingTab(this.app, this));
	}

	onunload() {
		// 清理资源
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
```

---

## 设置面板实现

### 基础设置面板
```typescript
class MetadataUpdaterSettingTab extends PluginSettingTab {
	plugin: MetadataUpdaterPlugin;

	constructor(app: App, plugin: MetadataUpdaterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// 标题
		containerEl.createEl('h2', { text: '基本设置' });

		// 开关设置
		new Setting(containerEl)
			.setName('Keyword extraction')
			.setDesc('Enable automatic keyword extraction')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.keywordExtractionEnabled)
				.onChange(async (value) => {
					this.plugin.settings.keywordExtractionEnabled = value;
					await this.plugin.saveSettings();
				}));

		// 文本输入设置
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

		// 按钮设置
		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('添加自定义配置')
				.setCta()
				.onClick(() => {
					this.showConfigModal('添加自定义配置', generateExampleConfig(), true);
				}));
	}
}
```

---

## 自定义模态框

### 带输入框的模态框
```typescript
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
			const nameInput = contentEl.createEl('input', {
				type: 'text',
				value: this.name,
				cls: 'config-name-input'
			});
			nameInput.style.width = '100%';
			nameInput.style.marginBottom = '16px';
			this.nameInput = nameInput;
		}

		// 描述文本
		contentEl.createEl('p', { 
			text: '使用类似 Python 的缩进语法。每级缩进使用 2 个空格。',
			cls: 'setting-item-description'
		});

		// 文本区域
		const textArea = new TextAreaComponent(contentEl);
		textArea.setValue(this.content);
		textArea.inputEl.setAttr('rows', '20');
		textArea.inputEl.style.width = '100%';
		textArea.inputEl.style.fontFamily = 'monospace';
		textArea.inputEl.readOnly = !this.isEditable;
		this.textArea = textArea;

		// 按钮容器
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		if (this.isEditable) {
			// 保存按钮
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

			// 验证按钮
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

		// 取消按钮
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
```

---

## 数据处理

### 配置文件加载
```typescript
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
```

### 配置列表渲染
```typescript
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
```

---

## 文件操作

### 读取和修改文件
```typescript
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
```

### 批量处理
```typescript
async updateAllNotesMetadata() {
	const files = this.app.vault.getMarkdownFiles();
	let count = 0;

	for (const file of files) {
		await this.updateNoteMetadata(file);
		count++;
	}

	new Notice(`Updated metadata for ${count} notes`);
}
```

---

## Git 操作

### 使用 HEREDOC 格式提交
```bash
git commit -m "$(cat <<'EOF'
Fix: 修复自定义配置无法修改名称的问题 (v0.1.1)

- 为自定义配置添加名称字段
- 在编辑模态框中添加配置名称输入框
- 配置列表现在显示自定义配置的实际名称
- 更新文档和发布说明

🤖 Generated with CodeMate
EOF
)"
```

### 常用 Git 命令
```bash
# 查看状态
git status

# 查看修改
git diff main.ts

# 添加文件
git add README.md main.ts

# 提交
git commit -m "描述信息"

# 查看日志
git log --oneline -5

# 推送
git push origin master

# 查看远程
git remote -v
```

---

## 配置文件解析

### Python 缩进语法解析
```typescript
interface KeywordCategory {
	name: string;
	children: KeywordCategory[];
	keywords: string[];
}

function getIndentLevel(line: string): number {
	const match = line.match(/^(\s*)/);
	if (!match) return 0;
	const spaces = match[1];
	return Math.floor(spaces.length / 2);
}

function isComment(line: string): boolean {
	return line.trim().startsWith('#');
}

function isEmptyLine(line: string): boolean {
	return line.trim().length === 0;
}

export function parseKeywordConfig(content: string): ParsedConfig {
	const lines = content.split('\n');
	const root: KeywordCategory[] = [];
	const stack: { level: number; category: KeywordCategory }[] = [];

	for (const line of lines) {
		if (isComment(line) || isEmptyLine(line)) {
			continue;
		}

		const trimmedLine = line.trim();
		const level = getIndentLevel(line);
		const keyword = trimmedLine.toLowerCase();

		const newCategory: KeywordCategory = {
			name: keyword,
			children: [],
			keywords: [keyword]
		};

		while (stack.length > 0 && stack[stack.length - 1].level >= level) {
			stack.pop();
		}

		if (stack.length === 0) {
			root.push(newCategory);
		} else {
			const parent = stack[stack.length - 1].category;
			parent.children.push(newCategory);
		}

		stack.push({ level, category: newCategory });
	}

	return { categories: root };
}
```

---

## 元数据处理

### Frontmatter 更新
```typescript
export function updateMetadata(content: string, metadata: Record<string, any>): string {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
	const match = content.match(frontmatterRegex);
	
	if (match) {
		// 已有 frontmatter，更新它
		const existingFrontmatter = match[1];
		const updatedFrontmatter = mergeFrontmatter(existingFrontmatter, metadata);
		return content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---\n`);
	} else {
		// 没有 frontmatter，创建新的
		const newFrontmatter = objectToFrontmatter(metadata);
		return `---\n${newFrontmatter}\n---\n${content}`;
	}
}

function objectToFrontmatter(obj: Record<string, any>): string {
	const lines: string[] = [];
	
	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value)) {
			lines.push(`${key}:`);
			for (const item of value) {
				lines.push(`  - ${item}`);
			}
		} else if (typeof value === 'boolean') {
			lines.push(`${key}: ${value}`);
		} else if (typeof value === 'number') {
			lines.push(`${key}: ${value}`);
		} else {
			lines.push(`${key}: "${value}"`);
		}
	}
	
	return lines.join('\n');
}
```

---

## 工具函数

### 文本处理
```typescript
function normalizeText(text: string): string {
	return text.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function capitalizeFirstLetter(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
```

### 验证函数
```typescript
export function validateConfig(content: string): string[] {
	const errors: string[] = [];
	const lines = content.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		if (isComment(line) || isEmptyLine(line)) {
			continue;
		}

		const level = getIndentLevel(line);

		// 检查缩进是否为 2 的倍数
		if (line.length > 0 && line.match(/^\s*/)![0].length % 2 !== 0) {
			errors.push(`第 ${i + 1} 行：缩进必须是 2 的倍数`);
		}

		// 检查缩进递增是否合理
		if (i > 0) {
			const prevNonEmptyIndex = findPreviousNonEmptyLine(lines, i - 1);
			if (prevNonEmptyIndex !== -1) {
				const prevLevel = getIndentLevel(lines[prevNonEmptyIndex]);
				if (level > prevLevel + 1) {
					errors.push(`第 ${i + 1} 行：缩进级别跳跃过大（从 ${prevLevel} 到 ${level}）`);
				}
			}
		}
	}

	return errors;
}
```

---

## npm 脚本

### package.json 配置
```json
{
	"name": "obsidian-metadata-updater",
	"version": "0.1.1",
	"scripts": {
		"dev": "node esbuild.config.mjs",
		"build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
		"version": "node version-bump.mjs && git add manifest.json versions.json"
	},
	"devDependencies": {
		"@types/node": "latest",
		"@typescript-eslint/eslint-plugin": "latest",
		"@typescript-eslint/parser": "latest",
		"builtin-modules": "3.3.0",
		"esbuild": "latest",
		"obsidian": "latest",
		"tslib": "2.4.0",
		"typescript": "latest"
	}
}
```

---

## esbuild 配置

### esbuild.config.mjs
```javascript
const esbuild = require('esbuild');
const process = require('process');
const fs = require('fs');

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ['main.ts'],
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
	],
	format: 'cjs',
	target: 'es2018',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
```

---

## TypeScript 配置

### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES6",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": [
      "DOM",
      "ES5",
      "ES6",
      "ES7"
    ]
  },
  "include": [
    "**/*.ts"
  ]
}
```

# 关键知识点总结

## TypeScript

### 1. 接口设计
```typescript
// 定义数据接口
interface CustomConfig {
	name: string;
	content: string;
}

// 在设置接口中使用
interface MetadataUpdaterSettings {
	keywordExtractionEnabled: boolean;
	customConfigs: CustomConfig[];
}
```

### 2. 类型重构
- 从简单类型 (`string[]`) 到复杂类型 (`CustomConfig[]`)
- 保持向后兼容性的考虑

---

## Obsidian 插件开发

### 1. 插件基本结构
```typescript
export default class MetadataUpdaterPlugin extends Plugin {
	settings: MetadataUpdaterSettings;

	async onload() {
		// 插件加载时的初始化
		await this.loadSettings();
		this.addCommand({...});
		this.addSettingTab(new MetadataUpdaterSettingTab(this.app, this));
	}

	async onunload() {
		// 插件卸载时的清理
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
```

### 2. 设置面板
```typescript
class MetadataUpdaterSettingTab extends PluginSettingTab {
	plugin: MetadataUpdaterPlugin;

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// 添加设置项
		new Setting(containerEl)
			.setName('Keyword extraction')
			.setDesc('Enable automatic keyword extraction')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.keywordExtractionEnabled)
				.onChange(async (value) => {
					this.plugin.settings.keywordExtractionEnabled = value;
					await this.plugin.saveSettings();
				}));
	}
}
```

### 3. 自定义模态框
```typescript
class ConfigModal extends Modal {
	content: string;
	name: string;
	onSave: (name: string, content: string) => void;

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

		// 添加 UI 元素
		const textArea = new TextAreaComponent(contentEl);
		textArea.setValue(this.content);
		textArea.inputEl.setAttr('rows', '20');
		textArea.inputEl.style.width = '100%';
		this.textArea = textArea;

		// 添加按钮
		const saveButton = new ButtonComponent(buttonContainer);
		saveButton.setButtonText('保存');
		saveButton.onClick(async () => {
			const newContent = this.textArea.getValue();
			this.onSave(this.name, newContent);
			this.close();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
```

### 4. 添加命令
```typescript
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
```

---

## Git 操作

### 1. 基本命令
```bash
# 查看状态
git status

# 查看修改内容
git diff main.ts

# 添加文件到暂存区
git add README.md main.ts

# 提交更改（使用 HEREDOC 格式）
git commit -m "$(cat <<'EOF'
Fix: 修复自定义配置无法修改名称的问题 (v0.1.1)

- 为自定义配置添加名称字段
- 在编辑模态框中添加配置名称输入框

🤖 Generated with CodeMate
EOF
)"

# 查看提交记录
git log --oneline -5

# 推送到远程仓库
git push origin master
```

### 2. 提交信息规范
- 使用简洁的标题（50 字符以内）
- 标题用动词开头（Fix:、Add:、Update: 等）
- 详细说明在正文中
- 可以添加 emoji 增强可读性

---

## 项目管理

### 1. 版本管理
```json
// manifest.json
{
	"version": "0.1.1"
}

// package.json
{
	"version": "0.1.1"
}

// versions.json
{
	"0.1.0": "0.15.0",
	"0.1.1": "0.15.0"
}
```

### 2. 发布说明结构
```markdown
# 插件名称 v版本号 发布说明

## v版本号 更新内容 (日期)

### Bug 修复 / 新功能

**简短描述**

- ✅ 具体改进点 1
- ✅ 具体改进点 2

---

## 功能特性

### 核心功能
- 功能 1
- 功能 2

---

## 安装方法

1. 步骤 1
2. 步骤 2
3. 步骤 3

---

## 许可证

MIT License
```

---

## 问题解决流程

### 1. Bug 定位
1. 用户报告问题
2. 理解问题描述
3. 查看相关代码
4. 确认问题存在

### 2. 问题分析
1. 分析代码逻辑
2. 找出问题根源
3. 评估影响范围

### 3. 方案设计
1. 设计修复方案
2. 考虑向后兼容性
3. 评估风险

### 4. 实现修复
1. 编写代码
2. 编译测试
3. 验证修复效果

### 5. 文档更新
1. 更新 README
2. 编写发布说明
3. 更新版本号

### 6. 发布
1. 提交代码
2. 推送到远程
3. 创建发行版

---

## 工具使用

### 1. npm 脚本
```json
{
	"scripts": {
		"dev": "node esbuild.config.mjs",
		"build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
		"version": "node version-bump.mjs && git add manifest.json versions.json"
	}
}
```

### 2. TypeScript 编译
```bash
# 类型检查
tsc -noEmit -skipLibCheck

# 编译
tsc
```

### 3. esbuild 构建
```javascript
// esbuild.config.mjs
const esbuild = require('esbuild');

const isProduction = process.argv.includes('production');

esbuild.build({
	banner: {
		js: `/**\n${manifest}\n*/`,
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
	sourcemap: isProduction ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
}).catch(() => process.exit(1));
```

---

## 代码规范

### 1. 命名约定
- 类名：PascalCase (`ConfigModal`)
- 接口：PascalCase (`CustomConfig`)
- 变量/函数：camelCase (`customConfigs`)
- 常量：UPPER_SNAKE_CASE (`DEFAULT_SETTINGS`)

### 2. 代码组织
- 接口定义在文件顶部
- 类按照逻辑顺序排列
- 导出的函数和类放在文件底部

### 3. 注释
- 使用 JSDoc 格式
- 复杂逻辑添加注释说明

---

## 调试技巧

### 1. 控制台日志
```typescript
console.log('Debug info:', data);
console.error('Error:', error);
```

### 2. Obsidian 开发者工具
- 按 `Ctrl+Shift+I` 打开开发者工具
- 查看控制台输出
- 调试插件代码

### 3. 逐步测试
- 先在测试 vault 中测试
- 确认功能正常后再发布

---

## 最佳实践

### 1. 向后兼容性
- 尽量保持 API 稳定
- 旧数据自动迁移
- 提供平滑升级路径

### 2. 用户体验
- 提供清晰的操作提示
- 验证用户输入
- 友好的错误信息

### 3. 代码质量
- 使用 TypeScript 类型检查
- 编写清晰的代码
- 添加必要的注释

### 4. 文档维护
- 及时更新 README
- 编写详细的发布说明
- 记录重要的决策

---

## 资源链接

### 官方文档
- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Git 文档](https://git-scm.com/doc)

### 示例项目
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

### 工具
- [esbuild](https://esbuild.github.io/)
- [npm](https://docs.npmjs.com/)

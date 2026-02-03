# 关键知识点总结

## 项目结构与架构

### 1. 项目目录组织
```
obsidian-metadata-updater/
├── main.ts                    # 插件主入口
├── metadataExtractor.ts       # 规则提取器
├── keywordConfigParser.ts     # 配置解析器
├── llmExtractor.ts            # LLM智能提取器
├── styles.css                 # 样式文件
├── package.json               # 项目配置
├── manifest.json              # 插件清单
├── tsconfig.json              # TS编译配置
├── esbuild.config.mjs         # 构建配置
└── SESSION_SUMMARY/           # 开发文档
```

### 2. 模块化设计原则
- **单一职责**: 每个模块负责一个明确的功能
- **接口隔离**: 通过接口定义模块间的契约
- **依赖倒置**: 高层模块不依赖低层模块，都依赖抽象

### 3. 核心架构模式
```
main.ts (主控制器)
    ├── llmExtractor.ts (LLM提取策略)
    ├── metadataExtractor.ts (规则提取策略)
    └── keywordConfigParser.ts (配置管理)
```

### 4. 可扩展架构
```typescript
// 提取器接口 - 支持多种提取策略
interface Extractor {
	extract(content: string, options: ExtractionOptions): Promise<ExtractionResult>;
	isAvailable(): Promise<boolean>;
	getName(): string;
}

// 混合提取管理器 - 自动选择最佳提取器
class HybridExtractorManager {
	private extractors: Extractor[];
	private fallbackExtractor: Extractor;
}
```

---

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

### 3. 高级类型模式
```typescript
// 联合类型
type ExtractionMode = 'ollama' | 'openai' | 'anthropic' | 'rule';

// 可选属性
interface LLMConfig {
	enabled: boolean;
	mode: ExtractionMode;
	ollamaUrl?: string;
	ollamaModel?: string;
}

// 泛型接口
interface ExtractionOptions {
	maxKeywords?: number;
	useHierarchicalTags?: boolean;
	config?: any;
}
```

---

## LLM 集成

### 1. Ollama API 调用
```typescript
async extract(content: string, options: ExtractionOptions): Promise<ExtractionResult> {
	const prompt = `你是一个专业的关键词提取专家。请分析以下对话内容...`;

	const response = await fetch(`${this.url}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: this.model,
			prompt: prompt,
			stream: false,
			options: {
				temperature: 0.3,
				top_p: 0.9,
				num_predict: 500
			}
		})
	});

	const data = await response.json();
	const resultText = data.response;

	// 解析 JSON 响应
	const jsonMatch = resultText.match(/\{[\s\S]*\}/);
	const result = JSON.parse(jsonMatch[0]);

	return {
		keywords: result.keywords,
		tags: this.generateHierarchicalTags(result.keywords),
		summary: result.summary
	};
}
```

### 2. Prompt 设计技巧
- **明确角色**: "你是一个专业的关键词提取专家"
- **具体要求**: 列出明确的输出格式和要求
- **示例输出**: 提供期望的输出格式示例
- **参数调优**: temperature控制随机性，top_p控制多样性

### 3. 智能降级机制
```typescript
async extract(content: string, options: ExtractionOptions, fallbackToRule: boolean = true): Promise<ExtractionResult> {
	// 尝试使用 LLM 提取器
	for (const extractor of this.extractors) {
		try {
			console.log(`Using extractor: ${extractor.getName()}`);
			return await extractor.extract(content, options);
		} catch (error) {
			console.error(`Extractor ${extractor.getName()} failed:`, error);
		}
	}

	// 降级到规则提取
	if (fallbackToRule) {
		console.log('Falling back to rule-based extraction');
		return await this.fallbackExtractor.extract(content, options);
	}

	throw new Error('No available extractor');
}
```

### 4. 错误处理
```typescript
try {
	const response = await fetch(`${this.url}/api/tags`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});
	return response.ok;
} catch (error) {
	console.log('Ollama not available:', error);
	return false;
}
```

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

## 配置文件解析

### 1. Python风格缩进语法
```conf
# 关键词分类配置文件
# 使用类似 Python 的缩进语法来表示层次结构
# 每一级缩进使用 2 个空格

AI
  LLM
    chatgpt
    claude
    gemini
  Machine Learning
    neural network
    deep learning
```

### 2. 配置解析算法
```typescript
function parseKeywordConfig(content: string): ParsedConfig {
	const lines = content.split('\n');
	const root: KeywordCategory[] = [];
	const stack: { level: number; category: KeywordCategory }[] = [];

	for (const line of lines) {
		// 跳过注释和空行
		if (isComment(line) || isEmptyLine(line)) {
			continue;
		}

		const trimmedLine = line.trim();
		const level = getIndentLevel(line); // 计算缩进级别
		const keyword = trimmedLine.toLowerCase();

		// 创建新的分类节点
		const newCategory: KeywordCategory = {
			name: keyword,
			children: [],
			keywords: [keyword]
		};

		// 处理缩进层级
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

### 3. 配置验证
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

### 4. 配置合并策略
```typescript
export function mergeConfigs(configs: ParsedConfig[]): ParsedConfig {
	const merged: ParsedConfig = { categories: [] };

	for (const config of configs) {
		merged.categories.push(...config.categories);
	}

	return merged;
}
```

---

## 元数据处理

### 1. Frontmatter 解析
```typescript
function parseFrontmatter(text: string): Record<string, any> {
	const metadata: Record<string, any> = {};
	const lines = text.split('\n');

	for (const line of lines) {
		const match = line.match(/^(\w+):\s*(.*)$/);
		if (match) {
			const [, key, value] = match;
			metadata[key] = parseValue(value);
		}
	}

	return metadata;
}
```

### 2. Frontmatter 更新
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
```

### 3. 值解析
```typescript
function parseValue(value: string): any {
	value = value.trim();

	// 数组
	if (value.startsWith('[') && value.endsWith(']')) {
		const items = value.slice(1, -1).split(',').map(item => parseValue(item.trim()));
		return items;
	}

	// 字符串（带引号）
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		return value.slice(1, -1);
	}

	// 布尔值
	if (value === 'true') return true;
	if (value === 'false') return false;

	// 数字
	const num = Number(value);
	if (!isNaN(num)) return num;

	return value;
}
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

## 构建与部署

### 1. esbuild 配置
```javascript
import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/*\nTHIS IS A GENERATED/BUNDLED FILE BY ESBUILD\n*/`;

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
	banner: { js: banner },
	entryPoints: ["main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		...builtins
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
	minify: prod,
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
```

### 2. TypeScript 配置
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
    "lib": ["DOM", "ES5", "ES6", "ES7", "ES2017"]
  },
  "include": ["**/*.ts"]
}
```

### 3. 发布流程
```bash
# 1. 开发模式
npm run dev

# 2. 生产构建
npm run build

# 3. 版本更新
npm version patch  # 或 minor, major

# 4. 准备发布文件
./prepare-release.sh  # Linux/macOS
# 或
prepare-release.bat   # Windows

# 5. Git 提交
git add .
git commit -m "Release: v版本号"
git push

# 6. 创建 Release
# 在 Gitee/GitHub 上手动创建 Release，上传 zip 文件
```

### 4. 版本号管理
```javascript
// version-bump.mjs
import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// 更新 manifest.json
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// 更新 versions.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
```

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

## 项目文档管理

### 1. 文档组织结构
```
SESSION_SUMMARY/
├── README.md              # 会话总结目录
├── CHANGELOG.md           # 变更日志
├── CODE_SNIPPETS.md       # 代码片段
├── KEY_LEARNINGS.md       # 关键知识点
├── PROJECT_STRUCTURE.md   # 项目结构分析
├── Prompts.md             # 提示词记录
└── SESSION_*.md           # 会话记录
```

### 2. 文档编写原则
- **及时更新**: 每次会话后立即更新文档
- **结构清晰**: 使用清晰的标题和层次结构
- **代码示例**: 提供可运行的代码示例
- **版本记录**: 记录每次更新的时间和内容

### 3. 技术文档内容
- 项目结构分析
- 模块关系图
- API 接口说明
- 配置文件说明
- 构建部署流程

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
- [esbuild 文档](https://esbuild.github.io/)
- [Ollama 文档](https://ollama.com/docs)

### 示例项目
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

### 工具
- [esbuild](https://esbuild.github.io/)
- [npm](https://docs.npmjs.com/)
- [Ollama](https://ollama.com/)

### 项目文档
- [项目结构分析](PROJECT_STRUCTURE.md) - 完整的项目结构说明
- [改进计划](../IMPROVEMENT_PLAN.md) - 未来发展方向
- [README](../README.md) - 项目主文档

---

## 总结

通过三个开发会话，我们掌握了以下核心技能：

### 技术能力
1. **TypeScript开发**: 接口设计、类型系统、高级类型模式
2. **Obsidian插件开发**: 插件架构、UI组件、数据管理
3. **LLM集成**: Ollama API调用、Prompt设计、智能降级
4. **配置解析**: Python风格语法的解析和验证
5. **元数据处理**: Frontmatter的解析和更新

### 工程能力
1. **Git操作**: 版本管理、提交规范、多仓库同步
2. **构建部署**: esbuild配置、TypeScript编译、发布流程
3. **文档管理**: 结构化文档、代码示例、版本记录
4. **调试技巧**: 控制台日志、开发者工具、逐步测试

### 项目管理
1. **问题解决**: Bug定位、方案设计、实现修复
2. **版本管理**: 语义化版本、发布说明、版本号同步
3. **最佳实践**: 向后兼容、用户体验、代码质量、文档维护

这些知识和经验为后续的开发工作打下了坚实的基础。

---

**文档创建时间**: 2024-02-02
**最后更新**: 2026-02-02
**版本**: v0.1.2

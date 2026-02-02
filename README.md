# Metadata Updater

Metadata Updater 是一个 Obsidian 插件，可以用于自动从 LLM 会话记录中提取关键词并生成层级标签，同时为笔记添加 UTC 时间戳。非常适合管理和组织你的 AI 对话笔记。

> **注意**：本项目目前处于早期开发阶段，关键词提取、标签生成和 UTC 时间戳添加等功能仅为原型实现。这些功能需要不断的测试、优化和完善。欢迎社区贡献和反馈！

## 功能特性

- **自动关键词提取**：从笔记内容中智能提取重要关键词（原型阶段）
- **层级标签生成**：支持层级结构的标签（如 `AI/LLM/ChatGPT`）（原型阶段）
- **UTC 时间戳**：自动添加 `created` 和 `updated` 时间戳（原型阶段）
- **批量处理**：支持单条笔记或批量更新所有笔记
- **可配置选项**：通过设置面板自定义插件行为
- **自定义关键词分类**：支持通过配置文件自定义关键词分类层次（原型阶段）

## 安装

### 手动安装

1. 下载最新版本的插件文件
2. 将 `main.js`、`styles.css` 和 `manifest.json` 复制到你的 Obsidian vault 的 `.obsidian/plugins/metadata-updater/` 目录
3. 在 Obsidian 设置中启用插件

### 开发模式

```bash
# 克隆仓库
git clone https://github.com/yourusername/metadata-updater.git

# 进入目录
cd metadata-updater

# 安装依赖
npm install

# 开发模式编译（监听文件变化）
npm run dev

# 生产环境构建
npm run build
```

## 使用方法

### 命令

插件提供以下命令：

1. **Update current note metadata** - 更新当前活动笔记的元数据
2. **Update all notes metadata** - 批量更新所有笔记的元数据

### 设置

在插件设置中可以配置：

- **Keyword extraction** - 启用/禁用关键词提取功能
- **Timestamp** - 启用/禁用 UTC 时间戳添加
- **Max keywords** - 设置提取的最大关键词数量
- **Hierarchical tags** - 启用/禁用层级标签结构
- **关键词分类配置** - 管理默认和自定义关键词分类配置文件

### 自定义关键词分类配置

插件支持通过配置文件自定义关键词分类层次结构。配置文件使用类似 Python 的缩进语法：

#### 配置文件语法

- 每级缩进使用 2 个空格
- 以 `#` 开头的行为注释
- 支持多级嵌套的层次结构

#### 示例配置文件

```conf
# 关键词分类配置文件
# 使用类似 Python 的缩进语法来表示层次结构

AI
  LLM
    chatgpt
    claude
    gemini
  Machine Learning
    neural network
    deep learning

Programming
  Languages
    python
    javascript
    typescript
  Frameworks
    react
    vue
    angular
```

#### 配置文件管理

1. 在插件设置中找到"关键词分类配置"部分
2. 点击"添加自定义配置"按钮
3. 在弹出的编辑器中输入配置名称和配置内容
4. 点击"验证"按钮检查格式是否正确
5. 点击"保存"按钮保存配置
6. 可以添加多个配置文件，它们会同时生效
7. 可以编辑现有配置，修改配置名称和内容

#### 默认配置

插件内置了一个默认的关键词分类配置，包含常见的技术术语和分类。您可以在设置中查看默认配置，但不能直接修改。如需自定义，请添加新的配置文件。

## 示例

### 输入笔记

```markdown
# ChatGPT 对话记录

今天和 ChatGPT 讨论了机器学习的相关话题。我们聊到了神经网络、深度学习以及自然语言处理的应用。还讨论了一些编程相关的技术，比如 Python 和 TensorFlow。
```

### 自动生成的元数据

```yaml
---
keywords:
  - ChatGPT
  - Machine Learning
  - Neural Network
  - Deep Learning
  - NLP
  - Python
  - TensorFlow
tags:
  - AI/LLM/Chatgpt
  - AI/Machine learning/Machine learning
  - AI/Machine learning/Neural network
  - AI/Machine learning/Deep learning
  - AI/NLP/Nlp
  - AI/Programming/Python
  - AI/Programming/Tensorflow
created: "2024-01-15T10:30:00.000Z"
updated: "2024-01-15T14:45:00.000Z"
---

# ChatGPT 对话记录
...
```

## 标签分类

插件会自动将关键词分类到以下类别：

- **AI** - 人工智能相关
- **LLM** - 大语言模型相关
- **ChatGPT** - ChatGPT 相关
- **Claude** - Claude 相关
- **Gemini** - Gemini 相关
- **Programming** - 编程相关
- **Data Analysis** - 数据分析相关
- **Writing** - 写作相关
- **Research** - 研究相关
- **Troubleshooting** - 问题解决相关

## 开发

### 环境要求

- Node.js v16 或更高版本
- Obsidian 桌面应用

### 代码质量检查

```bash
# 使用 ESLint 检查代码
eslint main.ts
eslint metadataExtractor.ts
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 致谢

- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

## 更新日志

### v0.1.1 (2024-02-02)

**Bug 修复**

- 修复自定义配置无法修改名称的问题
- 为自定义配置添加名称字段
- 在编辑模态框中添加配置名称输入框
- 配置列表现在显示自定义配置的实际名称

### v0.1.0 (2024-02-02)

**首次发布**

- 实现关键词提取和层级标签生成功能
- 添加 UTC 时间戳支持（created/updated）
- 创建配置文件系统，支持 Python 缩进语法定义关键词分类
- 添加默认关键词分类配置文件
- 实现插件设置面板和命令系统
- 支持多配置文件同时生效
- 添加配置文件验证功能

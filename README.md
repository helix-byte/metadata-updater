# Metadata Updater

Metadata Updater 是一个 Obsidian 插件，可以用于自动从 LLM 会话记录中提取关键词并生成层级标签，同时为笔记添加 UTC 时间戳。非常适合管理和组织你的 AI 对话笔记。

> **注意**：本项目目前处于早期开发阶段，关键词提取、标签生成和 UTC 时间戳添加等功能仅为原型实现。这些功能需要不断的测试、优化和完善。欢迎社区贡献和反馈！

## 功能特性

- **自动关键词提取**：从笔记内容中智能提取重要关键词（原型阶段）
- **层级标签生成**：支持层级结构的标签（如 `AI/LLM/ChatGPT`）（原型阶段）
- **UTC 时间戳**：自动添加 `created` 和 `updated` 时间戳（原型阶段）
- **批量处理**：支持单条笔记或批量更新所有笔记
- **可配置选项**：通过设置面板自定义插件行为

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

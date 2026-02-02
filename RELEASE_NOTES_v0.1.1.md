# Metadata Updater v0.1.1 发布说明

## 项目简介

Metadata Updater 是一个 Obsidian 插件，专门用于自动从 LLM 会话记录中提取关键词并生成层级标签，同时为笔记添加 UTC 时间戳。非常适合管理和组织您的 AI 对话笔记。

> **注意**：本项目目前处于早期开发阶段，关键词提取、标签生成和 UTC 时间戳添加等功能仅为原型实现。这些功能需要不断的测试、优化和完善。欢迎社区贡献和反馈！

## v0.1.1 更新内容 (2024-02-02)

### Bug 修复

#### 修复自定义配置无法修改名称的问题

**问题描述**
在 v0.1.0 版本中，用户创建自定义配置后，无法修改配置的名称。配置列表中显示的是硬编码的 `自定义配置 1`、`自定义配置 2` 等，用户无法为配置设置有意义的名称。

**修复内容**

1. **数据结构改进**
   - 新增 `CustomConfig` 接口，包含 `name`（配置名称）和 `content`（配置内容）两个字段
   - 将设置中的 `customConfigs` 类型从 `string[]` 改为 `CustomConfig[]`
   - 向后兼容：旧版本的配置会自动迁移

2. **配置列表显示优化**
   - 配置列表现在显示用户自定义的配置名称
   - 移除硬编码的 `自定义配置 ${index + 1}` 显示方式
   - 保留配置内容预览功能

3. **编辑模态框增强**
   - 在编辑模态框顶部添加配置名称输入框
   - 支持在添加新配置时设置名称
   - 支持在编辑现有配置时修改名称
   - 名称输入框仅在可编辑模式下显示

4. **保存逻辑优化**
   - 保存时同时更新配置名称和内容
   - 如果名称为空，则使用原名称
   - 默认配置查看模式下不显示名称输入框

**使用方法**

1. **添加新配置**
   - 点击"添加自定义配置"按钮
   - 在弹出的编辑器顶部输入框中设置配置名称
   - 在文本区域输入配置内容
   - 点击"验证"检查格式
   - 点击"保存"完成添加

2. **编辑现有配置**
   - 点击配置列表中的"编辑"按钮
   - 修改配置名称（可选）
   - 修改配置内容
   - 点击"验证"检查格式
   - 点击"保存"完成修改

**技术细节**

- 修改文件：`main.ts`
- 影响接口：`MetadataUpdaterSettings`、`CustomConfig`、`ConfigModal`
- 向后兼容：是（旧版本配置会自动迁移）

---

## 功能特性

### 核心功能（原型阶段）
- ✅ **自动关键词提取**：从笔记内容中智能提取重要关键词
- ✅ **层级标签生成**：支持层级结构的标签（如 `AI/LLM/ChatGPT`）
- ✅ **UTC 时间戳**：自动添加 `created` 和 `updated` 时间戳
- ✅ **批量处理**：支持单条笔记或批量更新所有笔记
- ✅ **可配置选项**：通过设置面板自定义插件行为

### 自定义关键词分类配置（原型阶段）
- ✅ **Python 缩进语法**：使用类似 Python 的缩进语法定义关键词分类层次
- ✅ **多级嵌套**：支持任意深度的层次结构
- ✅ **多配置文件**：可以添加多个配置文件，同时生效
- ✅ **格式验证**：实时检查配置文件格式是否正确
- ✅ **可视化管理**：通过设置界面管理配置文件
- ✅ **配置命名**：支持为自定义配置设置和修改名称

## 安装方法

### 手动安装

1. 下载本 Release 中的附件文件
2. 将以下文件复制到您的 Obsidian vault 的 `.obsidian/plugins/metadata-updater/` 目录：
   - `main.js`
   - `styles.css`
   - `manifest.json`
   - `default-keywords.conf`（可选，用于默认关键词分类）
3. 在 Obsidian 设置中启用插件

### 开发模式

```bash
# 克隆仓库
git clone https://gitee.com/HelixByte/metadata-updater.git

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

插件支持通过配置文件自定义关键词分类层次结构。

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
  - AI/Machine Learning/Machine Learning
  - AI/Machine Learning/Neural Network
  - AI/Machine Learning/Deep Learning
  - AI/NLP/Nlp
  - AI/Programming/Python
  - AI/Programming/Tensorflow
created: "2024-01-15T10:30:00.000Z"
updated: "2024-01-15T14:45:00.000Z"
---

# ChatGPT 对话记录
...
```

## 默认标签分类

插件内置了丰富的默认关键词分类，涵盖以下领域：

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

详细分类请查看 `default-keywords.conf` 文件。

## 技术栈

- **TypeScript** - 主要开发语言
- **Obsidian API** - Obsidian 插件开发框架
- **esbuild** - 构建工具
- **Node.js** - 运行环境（v16+）

## 项目文件结构

```
metadata-updater/
├── .gitignore                    # Git 忽略规则
├── default-keywords.conf         # 默认关键词分类配置
├── keywordConfigParser.ts        # 配置文件解析器
├── main.js                       # 编译后的插件代码
├── main.ts                       # 插件主逻辑
├── manifest.json                 # 插件清单
├── metadataExtractor.ts          # 元数据提取逻辑
├── package.json                  # 项目配置
├── README.md                     # 项目文档
├── styles.css                    # 插件样式
├── tsconfig.json                 # TypeScript 配置
└── versions.json                 # 版本信息
```

## 开发环境

- **Node.js**: v16 或更高版本
- **Obsidian**: 桌面应用
- **操作系统**: Windows, macOS, Linux

## 代码质量检查

```bash
# 使用 ESLint 检查代码
eslint main.ts
eslint metadataExtractor.ts
```

## 已知问题

- 关键词提取算法较为简单，可能无法准确识别所有重要关键词
- 标签分类依赖于配置文件，需要用户手动维护
- 批量更新大量笔记时可能会有性能问题
- 配置文件格式验证功能还不够完善

## 未来计划

- [ ] 改进关键词提取算法（集成 NLP 库）
- [ ] 支持更多语言的标签分类
- [ ] 添加更多内置的标签分类模板
- [ ] 支持从远程 URL 加载配置文件
- [ ] 添加配置文件导入/导出功能
- [ ] 优化批量处理性能
- [ ] 添加更多元数据字段支持
- [ ] 支持自定义元数据模板

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT License - 详见 [LICENSE](LICENSE) 文件

## 作者

**Yichun Wang**
- 个人网站: https://helix.ln.cn
- Gitee: https://gitee.com/HelixByte

## 致谢

- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

## 反馈与支持

如果您在使用过程中遇到任何问题或有任何建议，欢迎通过以下方式反馈：

- 提交 [Issue](https://gitee.com/HelixByte/metadata-updater/issues)
- 发送邮件至作者
- 在 Gitee 上讨论

## 更新日志

### v0.1.1 (2024-02-02)

**Bug 修复**

- 修复自定义配置无法修改名称的问题
- 为自定义配置添加名称字段
- 在编辑模态框中添加配置名称输入框
- 配置列表现在显示自定义配置的实际名称

### v0.1.0 (2024-02-02)

**首次发布**

- ✅ 实现关键词提取和层级标签生成功能
- ✅ 添加 UTC 时间戳支持（created/updated）
- ✅ 创建配置文件系统，支持 Python 缩进语法定义关键词分类
- ✅ 添加默认关键词分类配置文件
- ✅ 实现插件设置面板和命令系统
- ✅ 支持多配置文件同时生效
- ✅ 添加配置文件验证功能
- ✅ 更新项目文档和配置文件
- ✅ 排除测试 vault 文件夹

---

**感谢您使用 Metadata Updater！**

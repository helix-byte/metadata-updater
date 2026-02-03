# 项目结构分析

本文档提供了 Obsidian Metadata Updater 插件的完整项目结构分析。

---

## 一、项目概述

**项目名称**: obsidian-metadata-updater
**版本**: v0.1.2
**作者**: Yichun Wang
**许可证**: MIT
**项目地址**: https://gitee.com/HelixByte/metadata-updater

**项目描述**: 一个用于自动从LLM会话记录中提取关键词并生成层级标签，同时为笔记添加UTC时间戳的Obsidian插件。支持本地Ollama模型进行智能关键词提取。

---

## 二、项目目录结构

```
obsidian-metadata-updater/
├── .git/                          # Git版本控制目录
├── .gitignore                     # Git忽略文件配置
├── .npmrc                         # npm配置文件
├── .editorconfig                  # 编辑器配置
├── .eslintrc                      # ESLint代码规范配置
├── .eslintignore                  # ESLint忽略文件配置
├── .vscode/                       # VS Code配置目录
│   ├── settings.json              # VS Code工作区设置
│   └── ut/                        # 单元测试目录
├── node_modules/                  # npm依赖包目录
├── OB-Test/                       # Obsidian测试vault
│   ├── .obsidian/                 # Obsidian配置目录
│   │   └── plugins/               # 插件目录
│   ├── 思维漫步：从南瓜逻辑到红尘世界/  # 测试笔记目录
│   └── 模板/                      # 模板目录
├── release/                       # 发布文件目录
│   ├── main.js                    # 编译后的主文件
│   ├── manifest.json              # 插件清单
│   └── styles.css                 # 样式文件
├── SESSION_SUMMARY/               # 开发会话总结目录
│   ├── CHANGELOG.md               # 变更日志
│   ├── CODE_SNIPPETS.md           # 代码片段
│   ├── KEY_LEARNINGS.md           # 关键学习点
│   ├── PROJECT_STRUCTURE.md       # 项目结构分析（本文档）
│   ├── Prompts.md                 # 提示词记录
│   ├── README.md                  # 会话总结
│   ├── SESSION_2024-02-02_FULL_DEVELOPMENT.md
│   └── SESSION_2024-02-02_LLM_INTEGRATION.md
├── main.ts                        # 插件主入口文件（TypeScript源码）
├── main.js                        # 编译后的JavaScript文件
├── metadataExtractor.ts           # 元数据提取器模块
├── keywordConfigParser.ts         # 关键词配置解析器
├── llmExtractor.ts                # LLM智能提取器模块
├── styles.css                     # 插件样式文件
├── package.json                   # Node.js项目配置
├── package-lock.json              # npm依赖锁定文件
├── tsconfig.json                  # TypeScript编译配置
├── esbuild.config.mjs             # esbuild构建配置
├── version-bump.mjs               # 版本号更新脚本
├── manifest.json                  # Obsidian插件清单
├── versions.json                  # 版本历史记录
├── default-keywords.conf          # 默认关键词分类配置
├── prepare-release.sh             # Linux/macOS发布准备脚本
├── prepare-release.bat            # Windows发布准备脚本
├── sync.bat                       # Git同步脚本
├── README.md                      # 项目说明文档
├── RELEASE_NOTES.md               # 发布说明
├── RELEASE_NOTES_v0.1.1.md        # v0.1.1发布说明
├── RELEASE_NOTES_v0.1.2.md        # v0.1.2发布说明
├── IMPROVEMENT_PLAN.md            # 改进计划文档
└── LICENSE                        # MIT许可证
```

---

## 三、核心配置文件详解

### 1. package.json
**作用**: Node.js项目配置文件

**关键信息**:
- 项目名称: `obsidian-metadata-updater`
- 版本: `0.1.2`
- 入口文件: `main.js`

**脚本命令**:
- `npm run dev`: 开发模式（监听文件变化）
- `npm run build`: 生产构建
- `npm version`: 版本号更新

**依赖包**:
- 开发依赖: TypeScript, esbuild, ESLint, Obsidian API等

### 2. manifest.json
**作用**: Obsidian插件清单文件

**关键信息**:
- 插件ID: `metadata-updater`
- 插件名称: `Metadata Updater`
- 版本: `0.1.2`
- 最低Obsidian版本: `0.15.0`
- 作者: Yichun Wang
- 描述: 自动提取关键词并生成层级标签，支持Ollama智能提取

### 3. tsconfig.json
**作用**: TypeScript编译配置

**关键配置**:
- 目标: ES6
- 模块系统: ESNext
- 严格模式: 启用
- 源码映射: 内联
- 包含: 所有`*.ts`文件

### 4. esbuild.config.mjs
**作用**: esbuild构建工具配置

**功能**:
- 打包TypeScript代码为单文件JavaScript
- 支持开发模式（监听）和生产模式（压缩）
- 外部化Obsidian相关依赖
- 生成源码映射

### 5. .eslintrc
**作用**: ESLint代码检查配置

**规则**:
- 使用TypeScript解析器
- 继承推荐规则
- 禁用未使用变量检查（参数除外）

### 6. .editorconfig
**作用**: 编辑器统一配置

**配置**:
- 字符编码: UTF-8
- 行尾: LF
- 缩进: Tab（4空格）

---

## 四、源代码组织方式

### 主要源代码文件（位于根目录）

#### 1. main.ts（主入口文件）
**作用**: 插件主类和设置界面

**核心类**:
- `MetadataUpdaterPlugin`: 插件主类
  - `onload()`: 插件加载初始化
  - `updateNoteMetadata()`: 更新单个笔记元数据
  - `updateAllNotesMetadata()`: 批量更新所有笔记
- `MetadataUpdaterSettingTab`: 设置面板类
- `ConfigModal`: 配置编辑模态框类

**功能**:
- 注册命令（更新当前/所有笔记）
- 管理插件设置
- 初始化提取器管理器
- 加载和合并配置文件

#### 2. metadataExtractor.ts（规则提取器）
**作用**: 基于规则的关键词提取和元数据更新

**核心函数**:
- `extractKeywordsAndTags()`: 提取关键词和标签
- `updateMetadata()`: 更新frontmatter元数据
- `extractKeywordsFromContent()`: 从内容提取关键词
- `generateHierarchicalTags()`: 生成层级标签
- `generateFlatTags()`: 生成扁平标签

**特性**:
- 内置技术术语词典
- LLM关键词分类
- 停用词过滤
- 词频统计

#### 3. keywordConfigParser.ts（配置解析器）
**作用**: 解析关键词分类配置文件

**核心函数**:
- `parseKeywordConfig()`: 解析配置文件
- `mergeConfigs()`: 合并多个配置
- `findCategoryPath()`: 查找关键词的分类路径
- `validateConfig()`: 验证配置格式
- `generateExampleConfig()`: 生成示例配置

**特性**:
- Python风格缩进语法（2空格缩进）
- 支持多级嵌套
- 注释支持（#开头）
- 配置验证

#### 4. llmExtractor.ts（LLM智能提取器）
**作用**: 使用LLM进行智能关键词提取

**核心类**:
- `OllamaExtractor`: Ollama本地模型提取器
- `RuleBasedExtractor`: 规则提取器（降级方案）
- `HybridExtractorManager`: 混合提取管理器

**接口**:
- `Extractor`: 提取器统一接口
- `ExtractionResult`: 提取结果类型
- `LLMConfig`: LLM配置类型

**特性**:
- 支持Ollama本地模型
- 智能降级机制
- 自动摘要生成
- 可扩展架构（支持未来添加OpenAI、Anthropic等）

---

## 五、主要功能模块

### 1. 插件核心功能
- **关键词提取**: 支持规则提取和LLM智能提取两种模式
- **层级标签生成**: 自动生成分层结构的标签（如`AI/LLM/ChatGPT`）
- **时间戳管理**: 自动添加`created`和`updated` UTC时间戳
- **自动摘要**: LLM模式下生成一句话摘要
- **批量处理**: 支持批量更新所有笔记

### 2. 配置管理
- **默认配置**: 内置关键词分类配置文件
- **自定义配置**: 支持添加多个自定义配置文件
- **配置验证**: 实时验证配置文件格式
- **配置合并**: 多个配置文件同时生效

### 3. LLM集成
- **Ollama支持**: 集成本地Ollama服务
- **模型配置**: 可自定义模型名称（默认`gemma3:1b`）
- **连接测试**: 一键测试Ollama服务可用性
- **智能降级**: LLM不可用时自动降级到规则提取

### 4. 用户界面
- **设置面板**: 分组化的设置界面
  - 基本设置（关键词提取、时间戳、层级标签等）
  - LLM配置（启用、地址、模型、降级等）
  - 关键词分类配置（查看、添加、编辑、删除）
- **配置编辑器**: 专门的配置文件编辑模态框
- **状态栏**: 显示插件状态

---

## 六、构建和开发配置

### 1. 开发环境
- **Node.js**: v16或更高版本
- **包管理器**: npm
- **TypeScript**: 最新版本
- **构建工具**: esbuild

### 2. 开发命令
```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 版本号更新
npm version [patch|minor|major]
```

### 3. 构建流程
1. TypeScript类型检查（生产模式）
2. esbuild打包为单文件`main.js`
3. 开发模式：内联源码映射，不压缩
4. 生产模式：无源码映射，压缩代码

### 4. 代码质量
- **ESLint**: 代码规范检查
- **TypeScript**: 类型检查
- **EditorConfig**: 编辑器风格统一

### 5. 发布流程

**准备脚本**:
- `prepare-release.sh`: Linux/macOS
- `prepare-release.bat`: Windows

**发布内容**:
- `main.js`: 编译后的插件文件
- `manifest.json`: 插件清单
- `styles.css`: 样式文件
- `default-keywords.conf`: 默认配置
- `README.md`: 说明文档
- `LICENSE`: 许可证

### 6. Git同步
**sync.bat**: 同步到Gitee和GitHub的脚本
- 推送代码到两个仓库
- 推送标签到两个仓库

---

## 七、测试目录

### OB-Test/
**作用**: Obsidian测试vault

**内容**:
- `.obsidian/plugins/metadata-updater/`: 插件安装目录
- 测试笔记文件
- 模板文件

### SESSION_SUMMARY/
**作用**: 开发会话总结和文档

**内容**:
- 变更日志
- 代码片段
- 关键学习点
- 开发会话记录
- 项目结构分析

---

## 八、文档文件

| 文件 | 作用 |
|------|------|
| README.md | 项目主文档，包含功能介绍、安装指南、使用说明 |
| RELEASE_NOTES.md | 发布说明总览 |
| RELEASE_NOTES_v0.1.1.md | v0.1.1版本发布说明 |
| RELEASE_NOTES_v0.1.2.md | v0.1.2版本发布说明 |
| IMPROVEMENT_PLAN.md | 详细的改进计划和路线图 |
| LICENSE | MIT许可证 |
| default-keywords.conf | 默认关键词分类配置文件 |

---

## 九、项目特点

### 技术特点
1. **TypeScript开发**: 类型安全，代码质量高
2. **模块化设计**: 清晰的模块分离，易于维护
3. **可扩展架构**: 提取器接口设计，易于添加新的提取方式
4. **混合策略**: LLM优先，规则降级，保证可用性
5. **配置驱动**: 通过配置文件灵活控制行为

### 功能特点
1. **智能提取**: 支持Ollama本地模型，语义理解准确
2. **完全离线**: 本地运行，保护隐私
3. **批量处理**: 支持单条或批量更新
4. **灵活配置**: 可自定义关键词分类层次
5. **用户友好**: 直观的设置界面和实时预览

---

## 十、版本历史

| 版本 | 发布日期 | 主要更新 |
|------|----------|----------|
| v0.1.0 | 2024-02-02 | 首次发布，基本功能实现 |
| v0.1.1 | 2024-02-02 | 修复配置管理bug |
| v0.1.2 | 2024-02-02 | 集成Ollama智能提取，性能提升150% |

---

## 十一、依赖关系

### 开发依赖
- `@types/node`: Node.js类型定义
- `@typescript-eslint/eslint-plugin`: TypeScript ESLint插件
- `@typescript-eslint/parser`: TypeScript解析器
- `builtin-modules`: Node.js内置模块
- `esbuild`: 快速打包工具
- `obsidian`: Obsidian API
- `tslib`: TypeScript运行时库
- `typescript`: TypeScript编译器

### 运行时依赖
- 无外部运行时依赖，所有功能通过Obsidian API实现

---

## 十二、项目架构图

```
┌─────────────────────────────────────────────────────────┐
│                    main.ts (主入口)                      │
│  - 插件加载/卸载                                          │
│  - 命令注册                                             │
│  - 设置管理                                             │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌──────────────────┐
│ llmExtractor  │    │ metadataExtractor│
│  (LLM提取)    │    │  (规则提取)      │
└───────┬───────┘    └────────┬─────────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ keywordConfigParser │
        │   (配置解析)        │
        └─────────────────────┘
```

---

## 十三、未来改进方向

详见 [IMPROVEMENT_PLAN.md](../IMPROVEMENT_PLAN.md)

主要方向包括：
1. 优化关键词提取算法（集成NLP库、上下文感知）
2. 改进标签分类逻辑（智能推荐、可视化）
3. 添加新的元数据字段（作者、阅读状态、优先级等）
4. 优化批量处理性能（异步、进度显示、增量更新）
5. 改进用户界面（现代化、标签管理面板）
6. 配置导入/导出功能
7. 多语言支持
8. 插件API

---

## 总结

这是一个结构清晰、设计良好的Obsidian插件项目，采用TypeScript开发，具有以下特点：

1. **模块化设计**: 源代码按功能划分为多个独立模块
2. **可扩展架构**: 提取器接口设计，易于添加新的提取方式
3. **完善的配置**: 支持多种配置文件和灵活的配置管理
4. **良好的开发体验**: 完整的构建流程、代码检查和文档
5. **智能功能**: 集成Ollama本地模型，提供语义级别的关键词提取
6. **详细的文档**: 包含README、发布说明、改进计划等

项目目前处于v0.1.2版本，核心功能已实现，具有良好的扩展性和维护性。

---

**文档创建时间**: 2026-02-02
**最后更新**: 2026-02-02

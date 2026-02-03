# Metadata Updater v0.3.0 发布说明

## v0.3.0 重大更新：聚焦元数据管理 (2026-02-02)

### 🎯 核心变更

**移除文件重命名功能，专注元数据管理**

- ❌ 移除：自动文件重命名功能
- ✅ 新增：`title` 字段（标题，10-30个汉字）
- ✅ 新增：`alias` 字段（别名数组，3-5个，每个5-15个汉字）
- ✅ 保留：`keywords`、`tags`、`summary`、`created`、`updated`

### 📝 新增元数据字段

#### 1. title（标题）
- **长度**：10-30个汉字
- **用途**：准确反映对话主题的简洁标题
- **示例**：
  ```yaml
  ---
  title: 异或逻辑的定义、性质与应用场景探讨
  ---
  ```

#### 2. alias（别名）
- **数量**：3-5个
- **长度**：每个别名5-15个汉字
- **用途**：快速检索和引用
- **示例**：
  ```yaml
  ---
  alias:
    - 异或逻辑
    - XOR运算
    - 逻辑门探讨
  ---
  ```

### ✨ 完整元数据示例

```yaml
---
keywords:
  - 异或
  - 逻辑门
  - 布尔代数
  - 编程基础
  - 真值表
tags:
  - 逻辑/异或
  - 编程/布尔代数
  - 基础/逻辑门
summary: 探讨异或逻辑的定义、性质、真值表以及在编程中的应用
title: 异或逻辑的定义、性质与应用场景探讨
alias:
  - 异或逻辑
  - XOR运算
  - 逻辑门探讨
created: "2026-02-02T14:30:00.000Z"
updated: "2026-02-02T14:30:00.000Z"
---
```

### 🔧 技术变更

**移除的模块**
- ❌ `filenameGenerator.ts` - 文件名生成器模块

**修改的模块**
- `llmExtractor.ts`:
  - 更新 LLM Prompt，要求生成 `title` 和 `alias`
  - `ExtractionResult` 接口：
    - 移除 `filenameSummary`
    - 新增 `title` 和 `alias`

- `main.ts`:
  - 移除 `autoRenameEnabled` 设置
  - 移除文件重命名逻辑
  - 移除自动重命名设置选项

### 📋 使用方法

1. **启用 LLM 提取**
   - 打开 Obsidian 设置 → Metadata Updater
   - 启用"启用 LLM 提取"
   - 配置 Ollama 地址和模型

2. **更新笔记元数据**
   - 打开要更新的笔记
   - 运行命令：`Update current note metadata`
   - LLM 自动生成完整的元数据

3. **查看元数据**
   - 打开笔记，查看 frontmatter
   - 包含：title, alias, keywords, tags, summary, created, updated

### 🎨 元数据字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| title | string | 标题（10-30字） | 异或逻辑的定义与应用 |
| alias | string[] | 别名数组（3-5个） | ["异或", "XOR", "逻辑门"] |
| keywords | string[] | 关键词（5-8个） | ["异或", "逻辑", "编程"] |
| tags | string[] | 层级标签 | ["逻辑/异或", "编程/布尔"] |
| summary | string | 一句话摘要 | 探讨异或逻辑的定义和应用 |
| created | string | 创建时间（ISO8601） | "2026-02-02T14:30:00Z" |
| updated | string | 更新时间（ISO8601） | "2026-02-02T14:30:00Z" |

### ⚙️ 设置选项

**基本设置**
- ✅ Keyword extraction - 启用关键词提取
- ✅ Timestamp - 启用时间戳
- ✅ Max keywords - 最大关键词数量
- ✅ Hierarchical tags - 使用层级标签

**LLM 配置**
- ✅ 启用 LLM 提取
- ✅ Ollama 地址
- ✅ Ollama 模型
- ✅ 降级到规则提取
- ✅ 测试连接

**关键词分类配置**
- 📋 默认配置
- ➕ 添加自定义配置
- ✏️ 编辑配置
- 🗑️ 删除配置

### 🔄 升级指南

从 v0.2.0 升级到 v0.3.0：

1. 替换 `main.js`、`manifest.json`、`styles.css`
2. 重启 Obsidian
3. 设置会自动迁移（`autoRenameEnabled` 会被移除）
4. 运行"Update current note metadata"测试新功能

### 📊 性能影响

- **单文件更新**: 无变化（移除了文件重命名操作）
- **批量更新**: 无变化
- **LLM 生成**: 略微增加（需要生成 title 和 alias）

### 🐛 已知问题

无

### 🚀 后续计划

- [ ] 支持自定义 title 和 alias 的生成规则
- [ ] 添加元数据预览功能
- [ ] 支持元数据模板
- [ ] 添加元数据导入/导出功能

---

## 功能特性

### 核心功能
- ✅ 智能关键词提取（LLM + 规则）
- ✅ 层级标签生成
- ✅ UTC 时间戳（created/updated）
- ✅ 自动摘要生成
- ✅ **标题生成（title）**
- ✅ **别名生成（alias）**
- ✅ 批量处理
- ✅ 可配置选项
- ✅ 自定义关键词分类
- ✅ 完全离线

### LLM 集成
- ✅ Ollama 本地模型支持
- ✅ 智能降级机制
- ✅ 连接测试功能
- ✅ 元数据生成（keywords, tags, summary, title, alias）

### 配置管理
- ✅ 默认关键词分类配置
- ✅ 自定义配置文件
- ✅ 配置验证
- ✅ 多配置合并

---

## 安装方法

### 手动安装
1. 下载最新版本的插件文件
2. 将 `main.js`、`manifest.json` 和 `styles.css` 复制到你的 Obsidian vault 的 `.obsidian/plugins/metadata-updater/` 目录
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

---

## 许可证

MIT License

---

**发布日期**: 2026-02-02
**版本**: 0.3.0
**作者**: Yichun Wang

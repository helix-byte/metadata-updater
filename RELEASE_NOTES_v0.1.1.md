# Metadata Updater v0.1.1 发布说明

## v0.1.1 更新内容 (2024-02-02)

### Bug 修复

**修复自定义配置无法修改名称的问题**

- ✅ 为自定义配置添加名称字段
- ✅ 在编辑模态框中添加配置名称输入框
- ✅ 配置列表现在显示自定义配置的实际名称
- ✅ 支持在添加和编辑时修改配置名称

---

## 功能特性

### 核心功能
- **自动关键词提取**：从笔记内容中智能提取重要关键词
- **层级标签生成**：支持层级结构的标签（如 `AI/LLM/ChatGPT`）
- **UTC 时间戳**：自动添加 `created` 和 `updated` 时间戳
- **批量处理**：支持单条笔记或批量更新所有笔记

### 自定义关键词分类配置
- 使用类似 Python 的缩进语法定义关键词分类层次
- 支持多级嵌套的层次结构
- 可以添加多个配置文件，同时生效
- 实时检查配置文件格式

---

## 安装方法

1. 下载本 Release 中的附件文件
2. 将以下文件复制到您的 Obsidian vault 的 `.obsidian/plugins/metadata-updater/` 目录：
   - `main.js`
   - `styles.css`
   - `manifest.json`
   - `default-keywords.conf`（可选）
3. 在 Obsidian 设置中启用插件

---

## 使用方法

### 命令

1. **Update current note metadata** - 更新当前活动笔记的元数据
2. **Update all notes metadata** - 批量更新所有笔记的元数据

### 配置文件示例

```conf
AI
  LLM
    chatgpt
    claude
  Machine Learning
    neural network
    deep learning

Programming
  Languages
    python
    javascript
  Frameworks
    react
    vue
```

---

## 许可证

MIT License

---

**感谢您使用 Metadata Updater！**

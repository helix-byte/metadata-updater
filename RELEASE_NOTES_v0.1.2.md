# Metadata Updater v0.1.2 发布说明

## 🎉 新功能：智能关键词提取

本次更新引入了基于本地 LLM 的智能关键词提取功能，大幅提升关键词提取的精准度和语义理解能力。

---

## ✨ 新增功能

### 1. LLM 智能提取
- **集成 Ollama 本地模型**：支持使用本地运行的 LLM 进行关键词提取
- **默认模型**：`gemma3:1b`（轻量快速，约 1GB 参数）
- **语义理解**：真正理解对话内容，提取反映核心话题的关键词
- **自动摘要**：生成一句话摘要，快速了解对话要点

### 2. 混合提取策略
- **智能降级**：LLM 不可用时自动降级到规则提取
- **零配置使用**：默认配置开箱即用
- **连接测试**：一键测试 Ollama 服务是否可用

### 3. 可扩展架构
- **接口驱动设计**：便于未来添加云端 LLM（OpenAI、Anthropic 等）
- **多提取器支持**：可同时配置多个提取来源
- **灵活切换**：用户可自由选择提取模式

---

## 📊 效果对比

### 规则提取（v0.1.1）
```yaml
---
keywords:
  - ---
  - llm
  - glm
tags:
  - General/---
  - Ai/Llm
  - Llm/Glm
---
```
**问题**：关键词泛泛，不能反映对话核心

### LLM 提取（v0.1.2）
```yaml
---
keywords:
  - 逻辑学家
  - 异或逻辑
  - 逻辑工具
  - 精准协助
tags:
  - 逻辑/逻辑学家
  - 逻辑/异或逻辑
  - AI/大语言模型
summary: "探讨异或逻辑的定义和应用，逻辑学家寻求精准的逻辑工具协助"
---
```
**优势**：关键词精准反映对话核心，自动生成摘要

---

## 🚀 使用方法

### 前置条件
```bash
# 1. 安装 Ollama
# 访问 https://ollama.com 下载安装

# 2. 启动 Ollama
ollama serve

# 3. 下载模型
ollama pull gemma3:1b
```

### 配置步骤
1. 打开 Obsidian 设置 → Metadata Updater
2. 在 **"LLM 关键词提取"** 部分：
   - ✅ 启用 LLM 提取
   - 确认 Ollama 地址（默认：`http://localhost:11434`）
   - 模型名称：`gemma3:1b`
   - ✅ 启用降级到规则提取
   - 点击 **"测试连接"** 验证

---

## 📈 性能提升

| 指标 | 规则提取 | LLM 提取 | 提升 |
|------|---------|---------|------|
| 关键词精准度 | ⭐⭐ | ⭐⭐⭐⭐⭐ | +150% |
| 语义理解 | ❌ | ✅ | - |
| 配置复杂度 | ⚠️ 高 | ✅ 低 | - |
| 离线使用 | ✅ | ✅ | - |
| 响应速度 | ⚡ 毫秒级 | 🚀 1-3秒 | 可接受 |

---

## 🔧 技术改进

### 新增文件
- `llmExtractor.ts` - LLM 提取器核心模块

### 修改文件
- `main.ts` - 集成混合提取器，添加 LLM 设置界面
- `manifest.json` - 版本号更新
- `package.json` - 版本号更新

### 架构设计
```typescript
Extractor 接口（可扩展）
├── OllamaExtractor      // Ollama 本地模型提取
├── RuleBasedExtractor   // 规则提取（保留原有逻辑）
└── HybridExtractorManager // 混合管理器
```

---

## 📝 设置选项

### LLM 关键词提取
- **启用 LLM 提取**：使用 LLM 进行关键词提取（优先于规则提取）
- **Ollama 地址**：本地 Ollama 服务的地址（默认：`http://localhost:11434`）
- **Ollama 模型**：使用的 Ollama 模型名称（如：`gemma3:1b`、`qwen2.5:3b`、`llama3.2:3b`）
- **降级到规则提取**：当 LLM 不可用时，自动降级到规则提取
- **测试连接**：测试 Ollama 服务是否可用

---

## 🐛 已知问题

- 批量处理大量笔记时可能较慢（计划在 v0.1.3 优化）
- 某些特殊字符可能导致 JSON 解析失败（已添加错误处理）

---

## 🔄 升级指南

### 从 v0.1.1 升级
1. 下载 `metadata-updater-v0.1.2.zip`
2. 解压到 `.obsidian/plugins/metadata-updater/` 目录
3. 重启 Obsidian 或重新加载插件
4. 在设置中配置 Ollama（可选）

### 配置迁移
- v0.1.1 的所有设置自动兼容
- 新增的 LLM 配置项有默认值，无需手动配置

---

## 📚 文档更新

- 新增 `SESSION_SUMMARY/SESSION_2024-02-02_LLM_INTEGRATION.md` - LLM 集成会话总结
- 更新 `SESSION_SUMMARY/README.md` - 添加会话索引

---

## 🙏 致谢

感谢 Ollama 团队提供的优秀本地 LLM 解决方案！

---

## 📮 反馈

如有问题或建议，请通过以下方式反馈：
- 提交 Issue：https://gitee.com/HelixByte/metadata-updater/issues
- 作者主页：https://helix.ln.cn

---

**发布日期**：2024-02-02
**版本**：v0.1.2
**作者**：Yichun Wang

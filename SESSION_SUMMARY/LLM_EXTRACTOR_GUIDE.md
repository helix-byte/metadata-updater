# LLM 提取器集成指南

本文档说明如何在新插件项目中集成和使用 `llmExtractor.ts` 文件，实现与 Ollama 的本地 LLM 集成。

## 文件概述

`llmExtractor.ts` 是 obsidian-metadata-updater 插件中负责 LLM 集成的核心文件，提供了：

- **Ollama 本地模型提取器** - 与 Ollama API 交互
- **规则提取器** - 基于规则的降级方案
- **混合提取器管理器** - 自动选择和切换提取器

## 核心组件

### 1. 数据结构

```typescript
// 提取结果接口
export interface ExtractionResult {
    keywords: string[];      // 关键词数组
    tags: string[];          // 标签数组
    summary?: string;        // 摘要
    title?: string;          // 标题
    alias?: string[];        // 别名数组
}

// LLM 配置接口
export interface LLMConfig {
    enabled: boolean;                    // 是否启用 LLM
    mode: 'ollama' | 'openai' | 'anthropic' | 'rule';
    ollamaUrl: string;                   // Ollama API 地址
    ollamaModel: string;                 // 模型名称
    maxKeywords: number;                 // 最大关键词数
    useHierarchicalTags: boolean;        // 是否使用层级标签
    fallbackToRule: boolean;             // 是否降级到规则提取
}
```

### 2. OllamaExtractor 类

负责与 Ollama API 交互的核心类。

**关键方法：**

- `isAvailable()` - 检查 Ollama 服务是否可用
  - 调用 `/api/tags` 端点
  - 返回布尔值表示服务状态

- `extract(content, options)` - 执行关键词提取
  - 清理内容（移除 frontmatter）
  - 构建结构化提示词
  - 调用 `/api/generate` 端点
  - 解析 JSON 响应
  - 生成层级标签

**Ollama API 配置：**
```typescript
{
    model: this.model,
    prompt: prompt,
    stream: false,              // 同步响应
    options: {
        temperature: 0.3,       // 降低随机性
        top_p: 0.9,
        num_predict: 500
    }
}
```

### 3. HybridExtractorManager 类

混合提取器管理器，提供自动降级机制。

**关键方法：**

- `initialize()` - 初始化并检测可用提取器
- `extract(content, options, fallbackToRule)` - 使用第一个可用的提取器
- `getAvailableExtractors()` - 获取可用提取器列表
- `hasLLMExtractor()` - 检查是否有 LLM 提取器可用

## 集成步骤

### 步骤 1：复制文件

将 `llmExtractor.ts` 文件复制到新项目的源代码目录中。

### 步骤 2：添加依赖

确保项目包含以下依赖（在 `package.json` 中）：

```json
{
  "dependencies": {
    "obsidian": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 步骤 3：在主插件文件中导入和初始化

```typescript
import { HybridExtractorManager, LLMConfig, ExtractionOptions } from './llmExtractor';

export default class YourPlugin extends Plugin {
    private extractorManager: HybridExtractorManager;

    async onload() {
        // 配置 LLM
        const llmConfig: LLMConfig = {
            enabled: true,
            mode: 'ollama',
            ollamaUrl: 'http://localhost:11434',
            ollamaModel: 'llama2',  // 或其他模型
            maxKeywords: 8,
            useHierarchicalTags: true,
            fallbackToRule: true
        };

        // 初始化提取器管理器
        this.extractorManager = new HybridExtractorManager(llmConfig, {});

        // 检测可用提取器
        await this.extractorManager.initialize();

        console.log('Available extractors:', this.extractorManager.getAvailableExtractors());
    }
}
```

### 步骤 4：使用提取器

```typescript
async function extractMetadata(content: string): Promise<void> {
    const options: ExtractionOptions = {
        maxKeywords: 8,
        useHierarchicalTags: true,
        config: {}  // 自定义配置
    };

    try {
        const result = await this.extractorManager.extract(
            content,
            options,
            true  // 允许降级到规则提取
        );

        console.log('Keywords:', result.keywords);
        console.log('Tags:', result.tags);
        console.log('Summary:', result.summary);
        console.log('Title:', result.title);
        console.log('Alias:', result.alias);

        // 处理提取结果...

    } catch (error) {
        console.error('Extraction failed:', error);
        new Notice('元数据提取失败');
    }
}
```

## 配置说明

### Ollama 服务配置

**默认地址：** `http://localhost:11434`

**常用模型：**
- `llama2` - Meta 的 LLaMA 2
- `mistral` - Mistral AI
- `qwen` - 阿里千问
- `gemma` - Google Gemma

**安装模型：**
```bash
ollama pull llama2
ollama pull mistral
```

### 提取参数

- `maxKeywords` - 关键词数量（建议 5-10）
- `useHierarchicalTags` - 是否使用层级标签（如 `AI/机器学习`）
- `fallbackToRule` - LLM 不可用时是否降级到规则提取

## 提示词模板

当前的提示词模板位于 `OllamaExtractor.extract()` 方法中，包含以下要求：

1. 提取 5-8 个核心关键词
2. 生成一句话摘要
3. 生成简洁标题（10-30 汉字）
4. 生成 3-5 个别名（5-15 汉字）
5. 返回 JSON 格式

**自定义提示词：**

根据你的需求修改 `prompt` 变量，确保：
- 使用清晰的结构化指令
- 指定 JSON 输出格式
- 包含示例输出格式

## 错误处理

提取器实现了完整的错误处理机制：

1. **网络错误** - 捕获 fetch 异常
2. **API 错误** - 检查响应状态码
3. **JSON 解析错误** - 使用正则匹配 JSON
4. **降级机制** - 自动切换到规则提取器

## 扩展建议

### 添加其他 LLM 提供商

参考 `OllamaExtractor` 实现，创建新的提取器类：

```typescript
export class OpenAIExtractor implements Extractor {
    // 实现相同接口
    async extract(content: string, options: ExtractionOptions): Promise<ExtractionResult> {
        // OpenAI API 调用逻辑
    }
}
```

### 自定义标签分类

修改 `classifyKeyword()` 方法，添加更多分类规则：

```typescript
private classifyKeyword(keyword: string): string | null {
    const categories: Record<string, string[]> = {
        // 添加你的分类规则
        'YourCategory': ['关键词1', '关键词2']
    };
    // ...
}
```

## 注意事项

1. **异步操作** - 所有提取操作都是异步的，使用 `async/await`
2. **错误处理** - 始终包裹在 try-catch 中
3. **服务可用性** - 使用前调用 `initialize()` 检测服务状态
4. **性能考虑** - LLM 提取较慢，建议显示加载状态
5. **本地模型** - 确保本地已安装并运行 Ollama

## 调试技巧

### 检查服务状态

```typescript
const extractor = new OllamaExtractor('http://localhost:11434', 'llama2');
const available = await extractor.isAvailable();
console.log('Ollama available:', available);
```

### 查看可用模型

```bash
curl http://localhost:11434/api/tags
```

### 测试提取

```typescript
const testContent = "你的测试内容";
const result = await extractor.extract(testContent, { maxKeywords: 5 });
console.log('Result:', result);
```

## 相关文件

- `metadataExtractor.ts` - 基于规则的提取器实现
- `main.ts` - 插件主文件，查看如何调用提取器
- `keywordConfigParser.ts` - 关键词配置解析

## 总结

`llmExtractor.ts` 提供了一个完整的 LLM 集成框架，包括：

✅ 多提取器支持
✅ 自动降级机制
✅ 灵活的配置选项
✅ 完善的错误处理
✅ 可扩展的架构

通过复制和适配此文件，你可以快速在新插件中实现 Ollama 集成功能。

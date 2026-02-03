/**
 * LLM 提取器 - 使用本地或云端 LLM 进行关键词提取
 */

export interface ExtractionResult {
	keywords: string[];
	tags: string[];
	summary?: string;
	title?: string;  // 标题
	alias?: string[];  // 别名数组
}

export interface LLMConfig {
	enabled: boolean;
	mode: 'ollama' | 'openai' | 'anthropic' | 'rule';
	ollamaUrl: string;
	ollamaModel: string;
	maxKeywords: number;
	useHierarchicalTags: boolean;
	fallbackToRule: boolean;
}

export interface Extractor {
	extract(content: string, options: ExtractionOptions): Promise<ExtractionResult>;
	isAvailable(): Promise<boolean>;
	getName(): string;
}

export interface ExtractionOptions {
	maxKeywords?: number;
	useHierarchicalTags?: boolean;
	config?: any;
}

/**
 * Ollama 本地模型提取器
 */
export class OllamaExtractor implements Extractor {
	private url: string;
	private model: string;

	constructor(url: string, model: string) {
		this.url = url;
		this.model = model;
	}

	async isAvailable(): Promise<boolean> {
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
	}

	getName(): string {
		return `Ollama (${this.model})`;
	}

	async extract(content: string, options: ExtractionOptions): Promise<ExtractionResult> {
		const maxKeywords = options.maxKeywords || 8;

		// 清理内容，移除 frontmatter
		const cleanContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

		const prompt = `你是一个专业的元数据提取专家。请分析以下对话内容，提取核心信息并生成元数据。

要求：
1. 提取 5-8 个最能反映对话核心的关键词
2. 关键词应该是具体的、有意义的，而不是泛泛的词汇
3. 生成一句话摘要，概括对话的核心内容
4. 生成一个简洁的标题（10-30个汉字），准确反映对话主题
5. 生成 3-5 个别名，用于快速检索和引用（每个别名 5-15 个汉字）
6. 返回 JSON 格式，包含 keywords（关键词数组）、summary（一句话摘要）、title（标题）和 alias（别名数组）
7. 所有内容使用中文

对话内容：
${cleanContent}

输出格式（纯 JSON）：
{
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "summary": "一句话概括对话核心",
  "title": "简洁的标题，10-30个汉字",
  "alias": ["别名1", "别名2", "别名3"]
}`;

		try {
			const response = await fetch(`${this.url}/api/generate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: this.model,
					prompt: prompt,
					stream: false,
					options: {
						temperature: 0.3,  // 降低随机性，提高稳定性
						top_p: 0.9,
						num_predict: 500
					}
				})
			});

			if (!response.ok) {
				throw new Error(`Ollama API error: ${response.status}`);
			}

			const data = await response.json();
			const resultText = data.response;

			// 解析 JSON 响应
			const jsonMatch = resultText.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No JSON found in response');
			}

			const result = JSON.parse(jsonMatch[0]);

			// 生成标签（层级结构）
			const tags = options.useHierarchicalTags
				? this.generateHierarchicalTags(result.keywords)
				: result.keywords.map((k: string) => k);

			return {
				keywords: result.keywords.slice(0, maxKeywords),
				tags: tags,
				summary: result.summary,
				title: result.title,
				alias: result.alias
			};
		} catch (error) {
			console.error('Ollama extraction failed:', error);
			throw error;
		}
	}

	private generateHierarchicalTags(keywords: string[]): string[] {
		// 简单的层级标签生成
		// 可以在未来根据需要扩展更智能的分类
		return keywords.map(keyword => {
			// 基于关键词的语义进行简单分类
			const category = this.classifyKeyword(keyword);
			return category ? `${category}/${keyword}` : `General/${keyword}`;
		});
	}

	private classifyKeyword(keyword: string): string | null {
		const lower = keyword.toLowerCase();

		// 简单的关键词分类规则
		const categories: Record<string, string[]> = {
			'AI': ['人工智能', '机器学习', '神经网络', '深度学习', '大语言模型', 'llm', 'gpt', 'claude', 'gemini'],
			'逻辑': ['逻辑', '三段论', '命题', '推理', '演绎', '归纳', '异或', '布尔'],
			'编程': ['代码', '编程', '算法', '数据结构', 'python', 'javascript', 'typescript', '函数'],
			'游戏': ['游戏', 'minecraft', '我的世界', '玩法', '机制', '玩家', '世界'],
			'物理': ['物理', '相对论', '量子', '时间', '空间', '光速', '引力'],
			'哲学': ['哲学', '思考', '意义', '存在', '意识', '价值观', '世界观'],
			'数学': ['数学', '公式', '方程', '计算', '几何', '代数']
		};

		for (const [category, keywords] of Object.entries(categories)) {
			if (keywords.some(k => lower.includes(k) || k.includes(lower))) {
				return category;
			}
		}

		return null;
	}
}

/**
 * 规则提取器（保留原有逻辑）
 */
export class RuleBasedExtractor implements Extractor {
	private config: any;

	constructor(config: any) {
		this.config = config;
	}

	async isAvailable(): Promise<boolean> {
		return true; // 规则提取器始终可用
	}

	getName(): string {
		return '规则提取';
	}

	async extract(content: string, options: ExtractionOptions): Promise<ExtractionResult> {
		// 导入现有的提取逻辑
		const { extractKeywordsAndTags } = await import('./metadataExtractor');

		const { keywords, tags } = extractKeywordsAndTags(content, {
			maxKeywords: options.maxKeywords,
			useHierarchicalTags: options.useHierarchicalTags,
			config: options.config
		});

		return { keywords, tags };
	}
}

/**
 * 混合提取器管理器
 */
export class HybridExtractorManager {
	private extractors: Extractor[] = [];
	private fallbackExtractor: Extractor;

	constructor(config: LLMConfig, ruleConfig: any) {
		// 初始化提取器
		if (config.enabled && config.mode === 'ollama') {
			this.extractors.push(new OllamaExtractor(config.ollamaUrl, config.ollamaModel));
		}

		// 规则提取器作为降级方案
		this.fallbackExtractor = new RuleBasedExtractor(ruleConfig);
	}

	/**
	 * 检测并初始化可用的提取器
	 */
	async initialize(): Promise<void> {
		const availableExtractors: Extractor[] = [];

		for (const extractor of this.extractors) {
			const available = await extractor.isAvailable();
			if (available) {
				console.log(`Extractor available: ${extractor.getName()}`);
				availableExtractors.push(extractor);
			}
		}

		this.extractors = availableExtractors;
	}

	/**
	 * 使用第一个可用的提取器进行提取
	 */
	async extract(content: string, options: ExtractionOptions, fallbackToRule: boolean = true): Promise<ExtractionResult> {
		// 尝试使用 LLM 提取器
		for (const extractor of this.extractors) {
			try {
				console.log(`Using extractor: ${extractor.getName()}`);
				return await extractor.extract(content, options);
			} catch (error) {
				console.error(`Extractor ${extractor.getName()} failed:`, error);
				// 继续尝试下一个提取器
			}
		}

		// 降级到规则提取
		if (fallbackToRule) {
			console.log('Falling back to rule-based extraction');
			return await this.fallbackExtractor.extract(content, options);
		}

		throw new Error('No available extractor');
	}

	/**
	 * 获取当前可用的提取器列表
	 */
	getAvailableExtractors(): string[] {
		return this.extractors.map(e => e.getName());
	}

	/**
	 * 检查是否有 LLM 提取器可用
	 */
	hasLLMExtractor(): boolean {
		return this.extractors.length > 0;
	}
}

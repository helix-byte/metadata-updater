interface ExtractionOptions {
	maxKeywords?: number;
	useHierarchicalTags?: boolean;
}

interface ExtractionResult {
	keywords: string[];
	tags: string[];
}

// 常见的技术术语和编程概念
const TECH_KEYWORDS = [
	'API', 'REST', 'GraphQL', 'JSON', 'XML', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
	'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'SQL', 'NoSQL',
	'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
	'Docker', 'Kubernetes', 'Git', 'CI/CD', 'DevOps', 'AWS', 'Azure', 'GCP',
	'Machine Learning', 'Deep Learning', 'AI', 'NLP', 'Computer Vision',
	'Frontend', 'Backend', 'Full Stack', 'Database', 'Microservices',
	'OAuth', 'JWT', 'Authentication', 'Authorization', 'Security',
	'Performance', 'Optimization', 'Testing', 'Debugging', 'Refactoring'
];

// LLM 相关关键词分类
const LLM_CATEGORIES = {
	'AI': ['artificial intelligence', 'machine learning', 'neural network', 'deep learning'],
	'LLM': ['large language model', 'gpt', 'llm', 'language model', 'transformer'],
	'ChatGPT': ['chatgpt', 'gpt-3', 'gpt-4', 'openai'],
	'Claude': ['claude', 'anthropic'],
	'Gemini': ['gemini', 'google ai'],
	'Programming': ['code', 'programming', 'development', 'software', 'algorithm'],
	'Data Analysis': ['data', 'analysis', 'statistics', 'visualization'],
	'Writing': ['writing', 'content', 'creative', 'blog', 'article'],
	'Research': ['research', 'academic', 'paper', 'study'],
	'Troubleshooting': ['error', 'bug', 'fix', 'debug', 'solution']
};

function normalizeText(text: string): string {
	return text.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function extractWords(text: string): string[] {
	const normalized = normalizeText(text);
	const words = normalized.split(/\s+/);
	
	// 过滤掉常见的停用词
	const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'am']);
	
	return words.filter(word => word.length > 2 && !stopWords.has(word));
}

function calculateWordFrequency(words: string[]): Map<string, number> {
	const frequency = new Map<string, number>();
	
	for (const word of words) {
		frequency.set(word, (frequency.get(word) || 0) + 1);
	}
	
	return frequency;
}

function categorizeKeyword(keyword: string): string[] {
	const normalizedKeyword = keyword.toLowerCase();
	const categories: string[] = [];
	
	for (const [category, keywords] of Object.entries(LLM_CATEGORIES)) {
		for (const kw of keywords) {
			if (normalizedKeyword.includes(kw) || kw.includes(normalizedKeyword)) {
				categories.push(category);
				break;
			}
		}
	}
	
	return categories;
}

function extractKeywordsFromContent(content: string, maxKeywords: number = 10): string[] {
	// 移除 frontmatter
	const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
	
	// 提取单词
	const words = extractWords(contentWithoutFrontmatter);
	
	// 计算词频
	const frequency = calculateWordFrequency(words);
	
	// 转换为数组并排序
	const sortedKeywords = Array.from(frequency.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([word]) => word);
	
	// 优先添加技术术语
	const techKeywords = TECH_KEYWORDS.filter(kw => 
		sortedKeywords.some(sk => sk.toLowerCase().includes(kw.toLowerCase()))
	);
	
	// 合并结果
	const finalKeywords = [...new Set([...techKeywords, ...sortedKeywords])];
	
	return finalKeywords.slice(0, maxKeywords);
}

function generateHierarchicalTags(keywords: string[]): string[] {
	const tags: string[] = [];
	
	for (const keyword of keywords) {
		const categories = categorizeKeyword(keyword);
		
		if (categories.length > 0) {
			// 使用第一个匹配的类别作为主分类
			const mainCategory = categories[0];
			tags.push(`AI/${mainCategory}/${capitalizeFirstLetter(keyword)}`);
		} else {
			// 如果没有匹配的类别，使用通用分类
			tags.push(`General/${capitalizeFirstLetter(keyword)}`);
		}
	}
	
	return tags;
}

function generateFlatTags(keywords: string[]): string[] {
	return keywords.map(kw => capitalizeFirstLetter(kw));
}

function capitalizeFirstLetter(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function extractKeywordsAndTags(content: string, options: ExtractionOptions = {}): ExtractionResult {
	const {
		maxKeywords = 10,
		useHierarchicalTags = true
	} = options;
	
	const keywords = extractKeywordsFromContent(content, maxKeywords);
	const tags = useHierarchicalTags 
		? generateHierarchicalTags(keywords)
		: generateFlatTags(keywords);
	
	return {
		keywords,
		tags
	};
}

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

function mergeFrontmatter(existing: string, newMetadata: Record<string, any>): string {
	const lines = existing.split('\n');
	const metadata = parseFrontmatter(existing);
	
	// 合并新数据
	Object.assign(metadata, newMetadata);
	
	return objectToFrontmatter(metadata);
}

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

function objectToFrontmatter(obj: Record<string, any>): string {
	const lines: string[] = [];
	
	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value)) {
			lines.push(`${key}:`);
			for (const item of value) {
				lines.push(`  - ${item}`);
			}
		} else if (typeof value === 'boolean') {
			lines.push(`${key}: ${value}`);
		} else if (typeof value === 'number') {
			lines.push(`${key}: ${value}`);
		} else {
			lines.push(`${key}: "${value}"`);
		}
	}
	
	return lines.join('\n');
}

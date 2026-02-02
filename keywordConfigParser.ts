interface KeywordCategory {
	name: string;
	children: KeywordCategory[];
	keywords: string[];
}

interface ParsedConfig {
	categories: KeywordCategory[];
}

/**
 * 解析配置文件中的缩进级别
 * @param line 配置文件的一行
 * @returns 缩进级别（0, 1, 2, ...）
 */
function getIndentLevel(line: string): number {
	const match = line.match(/^(\s*)/);
	if (!match) return 0;
	
	const spaces = match[1];
	// 计算缩进级别，假设每级缩进为 2 个空格
	return Math.floor(spaces.length / 2);
}

/**
 * 检查行是否为注释
 * @param line 配置文件的一行
 * @returns 是否为注释
 */
function isComment(line: string): boolean {
	return line.trim().startsWith('#');
}

/**
 * 检查行是否为空行
 * @param line 配置文件的一行
 * @returns 是否为空行
 */
function isEmptyLine(line: string): boolean {
	return line.trim().length === 0;
}

/**
 * 解析配置文件内容
 * @param content 配置文件内容
 * @returns 解析后的配置对象
 */
export function parseKeywordConfig(content: string): ParsedConfig {
	const lines = content.split('\n');
	const root: KeywordCategory[] = [];
	const stack: { level: number; category: KeywordCategory }[] = [];

	for (const line of lines) {
		// 跳过注释和空行
		if (isComment(line) || isEmptyLine(line)) {
			continue;
		}

		const trimmedLine = line.trim();
		const level = getIndentLevel(line);
		const keyword = trimmedLine.toLowerCase();

		// 创建新的分类节点
		const newCategory: KeywordCategory = {
			name: keyword,
			children: [],
			keywords: [keyword]
		};

		// 处理缩进层级
		while (stack.length > 0 && stack[stack.length - 1].level >= level) {
			stack.pop();
		}

		if (stack.length === 0) {
			// 顶级分类
			root.push(newCategory);
		} else {
			// 子分类
			const parent = stack[stack.length - 1].category;
			parent.children.push(newCategory);
		}

		// 将当前节点压入栈
		stack.push({ level, category: newCategory });
	}

	return { categories: root };
}

/**
 * 将所有分类展平为关键词到分类路径的映射
 * @param config 解析后的配置对象
 * @returns 关键词到分类路径的映射
 */
export function flattenCategories(config: ParsedConfig): Map<string, string[]> {
	const map = new Map<string, string[]>();

	function traverse(category: KeywordCategory, path: string[] = []) {
		const currentPath = [...path, category.name];
		
		// 为当前分类的所有关键词添加路径
		for (const keyword of category.keywords) {
			if (!map.has(keyword)) {
				map.set(keyword, currentPath);
			}
		}

		// 递归处理子分类
		for (const child of category.children) {
			traverse(child, currentPath);
		}
	}

	for (const category of config.categories) {
		traverse(category);
	}

	return map;
}

/**
 * 合并多个配置文件
 * @param configs 多个解析后的配置对象
 * @returns 合并后的配置对象
 */
export function mergeConfigs(configs: ParsedConfig[]): ParsedConfig {
	const merged: ParsedConfig = { categories: [] };

	for (const config of configs) {
		merged.categories.push(...config.categories);
	}

	return merged;
}

/**
 * 根据关键词查找分类路径
 * @param keyword 要查找的关键词
 * @param config 配置对象
 * @returns 分类路径，如果未找到则返回 null
 */
export function findCategoryPath(keyword: string, config: ParsedConfig): string[] | null {
	const normalizedKeyword = keyword.toLowerCase();
	const flatMap = flattenCategories(config);
	
	return flatMap.get(normalizedKeyword) || null;
}

/**
 * 获取所有顶级分类名称
 * @param config 配置对象
 * @returns 顶级分类名称数组
 */
export function getTopLevelCategories(config: ParsedConfig): string[] {
	return config.categories.map(c => c.name);
}

/**
 * 验证配置文件格式
 * @param content 配置文件内容
 * @returns 包含错误信息的数组，如果格式正确则返回空数组
 */
export function validateConfig(content: string): string[] {
	const errors: string[] = [];
	const lines = content.split('\n');
	const expectedIndent = new Map<number, number>(); // 行号 -> 期望的缩进级别

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		// 跳过注释和空行
		if (isComment(line) || isEmptyLine(line)) {
			continue;
		}

		const level = getIndentLevel(line);
		const trimmedLine = line.trim();

		// 检查缩进是否为 2 的倍数
		if (line.length > 0 && line.match(/^\s*/)![0].length % 2 !== 0) {
			errors.push(`第 ${i + 1} 行：缩进必须是 2 的倍数`);
		}

		// 检查缩进递增是否合理
		if (i > 0) {
			const prevNonEmptyIndex = findPreviousNonEmptyLine(lines, i - 1);
			if (prevNonEmptyIndex !== -1) {
				const prevLevel = getIndentLevel(lines[prevNonEmptyIndex]);
				if (level > prevLevel + 1) {
					errors.push(`第 ${i + 1} 行：缩进级别跳跃过大（从 ${prevLevel} 到 ${level}）`);
				}
			}
		}

		// 检查是否包含非 ASCII 字符（可选）
		if (/[^\x00-\x7F]/.test(trimmedLine)) {
			// 允许非 ASCII 字符，但给出警告
			// errors.push(`第 ${i + 1} 行：包含非 ASCII 字符`);
		}
	}

	return errors;
}

/**
 * 查找前一个非空行
 */
function findPreviousNonEmptyLine(lines: string[], startIndex: number): number {
	for (let i = startIndex; i >= 0; i--) {
		if (!isComment(lines[i]) && !isEmptyLine(lines[i])) {
			return i;
		}
	}
	return -1;
}

/**
 * 生成示例配置文件内容
 * @returns 示例配置文件字符串
 */
export function generateExampleConfig(): string {
	return `# 关键词分类配置文件
# 使用类似 Python 的缩进语法来表示层次结构
# 每一级缩进使用 2 个空格

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
`;
}

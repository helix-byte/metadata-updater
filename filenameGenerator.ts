/**
 * 文件名生成器 - 根据内容生成格式化的文件名
 * 格式: [7-13个汉字]-[YYYYMMDD]
 */

/**
 * 生成 YYYYMMDD 格式的日期字符串
 * @returns 日期字符串（8位数字）
 */
function generateDateTimestamp(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}${month}${day}`;
}

/**
 * 检查文件名是否已存在于指定的文件列表中
 * @param filename 要检查的文件名
 * @param existingFiles 现有文件列表
 * @param currentFile 当前文件（可选，用于排除自身）
 * @returns 是否存在冲突
 */
export function isFilenameConflict(filename: string, existingFiles: string[], currentFile?: string): boolean {
	return existingFiles.some(f => {
		// 排除当前文件
		if (currentFile && f === currentFile) {
			return false;
		}
		return f === `${filename}.md`;
	});
}

/**
 * 生成唯一的文件名（避免冲突）
 * @param summaryPart 概括部分（7-13个汉字）
 * @param existingFiles 现有文件列表
 * @param currentFile 当前文件（可选）
 * @returns 唯一的文件名（不含扩展名）
 */
export function generateUniqueFilename(
	summaryPart: string,
	existingFiles: string[],
	currentFile?: string
): string {
	const dateTimestamp = generateDateTimestamp();
	let filename = `${summaryPart}-${dateTimestamp}`;
	let counter = 0;
	const maxAttempts = 100;

	// 如果有冲突，添加序号
	while (isFilenameConflict(filename, existingFiles, currentFile) && counter < maxAttempts) {
		counter++;
		filename = `${summaryPart}-${dateTimestamp}-${counter}`;
	}

	return filename;
}

/**
 * 根据概括内容生成文件名
 * @param summary 概括内容（LLM生成的7-13个汉字）
 * @param existingFiles 现有文件列表
 * @param currentFile 当前文件（可选）
 * @returns 唯一的文件名（不含扩展名）
 */
export function generateFilenameFromSummary(
	summary: string,
	existingFiles: string[],
	currentFile?: string
): string {
	// 确保概括部分在7-13个汉字之间
	let summaryPart = summary.trim();

	if (summaryPart.length > 13) {
		summaryPart = summaryPart.substring(0, 13);
	} else if (summaryPart.length < 7) {
		// 如果概括太短，填充到7个字
		while (summaryPart.length < 7) {
			summaryPart += '之';
		}
	}

	return generateUniqueFilename(summaryPart, existingFiles, currentFile);
}

/**
 * 验证文件名格式
 * @param filename 文件名（不含扩展名）
 * @returns 是否符合格式要求
 */
export function validateFilenameFormat(filename: string): boolean {
	// 格式: [7-13个汉字]-[YYYYMMDD] 或 [7-13个汉字]-[YYYYMMDD]-[数字]
	const pattern = /^([\u4e00-\u9fa5]{7,13})-(\d{8})(-\d+)?$/;
	return pattern.test(filename);
}

/**
 * 从文件名中提取概括部分
 * @param filename 文件名（不含扩展名）
 * @returns 概括部分，如果格式无效则返回 null
 */
export function extractSummaryFromFilename(filename: string): string | null {
	const match = filename.match(/^([\u4e00-\u9fa5]{7,13})-(\d{8})(-\d+)?$/);
	return match ? match[1] : null;
}

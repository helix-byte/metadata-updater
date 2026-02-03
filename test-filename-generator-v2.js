/**
 * 测试文件名生成器 v2 (使用时间戳)
 */

function generateDateTimestamp() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}${month}${day}`;
}

function isFilenameConflict(filename, existingFiles, currentFile) {
	return existingFiles.some(f => {
		if (currentFile && f === currentFile) {
			return false;
		}
		return f === `${filename}.md`;
	});
}

function generateUniqueFilename(summaryPart, existingFiles, currentFile) {
	const dateTimestamp = generateDateTimestamp();
	let filename = `${summaryPart}-${dateTimestamp}`;
	let counter = 0;
	const maxAttempts = 100;

	while (isFilenameConflict(filename, existingFiles, currentFile) && counter < maxAttempts) {
		counter++;
		filename = `${summaryPart}-${dateTimestamp}-${counter}`;
	}

	return filename;
}

function generateFilenameFromSummary(summary, existingFiles, currentFile) {
	let summaryPart = summary.trim();

	if (summaryPart.length > 13) {
		summaryPart = summaryPart.substring(0, 13);
	} else if (summaryPart.length < 7) {
		while (summaryPart.length < 7) {
			summaryPart += '之';
		}
	}

	return generateUniqueFilename(summaryPart, existingFiles, currentFile);
}

// 测试
console.log('=== 文件名生成器测试 v2 (时间戳版) ===\n');

const existingFiles = ['异或逻辑探讨之-20260202.md', '编程技巧交流之-20260202.md'];

// 测试 1: 正常情况（6个字会被填充到7个字）
const test1 = generateFilenameFromSummary('异或逻辑探讨', existingFiles);
console.log('测试 1 - 正常情况:');
console.log(`  输入: "异或逻辑探讨" (6个字)`);
console.log(`  输出: "${test1}"`);
console.log(`  预期: "异或逻辑探讨之-20260202-1" (填充后为7字，因为已存在)\n`);

// 测试 2: 冲突检测
const test2 = generateFilenameFromSummary('编程技巧交流', existingFiles);
console.log('测试 2 - 冲突检测:');
console.log(`  输入: "编程技巧交流" (6个字)`);
console.log(`  输出: "${test2}"`);
console.log(`  预期: "编程技巧交流之-20260202-1" (填充后为7字，因为已存在)\n`);

// 测试 3: 太短的概括
const test3 = generateFilenameFromSummary('逻辑', existingFiles);
console.log('测试 3 - 太短的概括:');
console.log(`  输入: "逻辑"`);
console.log(`  输出: "${test3}"`);
console.log(`  预期: "逻辑之之之之之-20260202" (填充到7字)\n`);

// 测试 4: 太长的概括
const test4 = generateFilenameFromSummary('这是一个非常非常长的概括超过十三个字', existingFiles);
console.log('测试 4 - 太长的概括:');
console.log(`  输入: "这是一个非常非常长的概括超过十三个字"`);
console.log(`  输出: "${test4}"`);
console.log(`  预期: "这是一个非常非常长的概括超-20260202" (截断到13字)\n`);

// 测试 5: 正好 13 个字
const test5 = generateFilenameFromSummary('哲学思考与人生意义', existingFiles);
console.log('测试 5 - 正好 13 个字:');
console.log(`  输入: "哲学思考与人生意义"`);
console.log(`  输出: "${test5}"`);
console.log(`  预期: "哲学思考与人生意义-20260202"\n`);

// 测试 6: 正好 7 个字
const test6 = generateFilenameFromSummary('编程入门', existingFiles);
console.log('测试 6 - 正好 7 个字:');
console.log(`  输入: "编程入门"`);
console.log(`  输出: "${test6}"`);
console.log(`  预期: "编程入门之之之-20260202" (填充到7字)\n`);

// 测试 7: 多次冲突
const existingFiles2 = [
	'异或逻辑探讨之-20260202.md',
	'异或逻辑探讨之-20260202-1.md',
	'异或逻辑探讨之-20260202-2.md'
];
const test7 = generateFilenameFromSummary('异或逻辑探讨', existingFiles2);
console.log('测试 7 - 多次冲突:');
console.log(`  输入: "异或逻辑探讨" (6个字)`);
console.log(`  输出: "${test7}"`);
console.log(`  预期: "异或逻辑探讨之-20260202-3" (已存在 -1, -2)\n`);

console.log('=== 测试完成 ===');

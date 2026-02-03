/**
 * 测试文件名生成器
 */

// 从 filenameGenerator.ts 复制的函数（用于测试）

const THOUSAND_CHARACTER_POOL = `
天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐吊民伐罪周发商汤坐朝问道垂拱平章爱育黎首臣伏戎羌遐迩一体率宾归王鸣凤在竹白驹食场化被草木赖及万方盖此身发四大五常恭惟鞠养岂敢毁伤女慕贞洁男效才良知过必改得能莫忘罔谈彼短靡恙己长信使可覆器欲难量墨悲丝染诗赞羔羊景行维贤克念作圣德建名立形端表正空谷传声虚堂习听祸因恶积福缘善庆尺璧非宝寸阴是竞资父事君曰严与敬孝当竭力忠则尽命临深履薄夙兴温凊似兰斯馨如松之盛川流不息渊澄取映容止若思言辞安定笃初诚美慎终宜令荣业所基籍甚无竟学优登仕摄职从政存以甘棠去而益咏乐殊贵贱礼别尊卑上和下睦夫唱妇随外受傅训入奉母仪诸姑伯叔犹子比儿孔怀兄弟同气连枝交友投分切磨箴规仁慈隐恻造次弗离节义廉退颠沛匪亏性静情逸心动神疲守真志满逐物意移坚持雅操好爵自縻都邑华夏东西二京背邙面洛浮渭据泾宫殿盘郁楼观飞惊图写禽兽画彩仙灵丙舍傍启甲帐对楹肆筵设席鼓瑟吹笙升阶纳陛弁转疑星右通广内左达承明既集坟典亦聚群英杜稿钟隶漆书壁经府罗将相路侠槐卿户封八县家给千兵高冠陪辇驱毂振缨世禄侈富车驾肥轻策功茂实勒碑刻铭磻溪伊尹佐时阿衡奄宅曲阜微旦孰营桓公匡合济弱扶倾绮回汉惠说感武丁俊乂密勿多士寔宁晋楚更霸赵魏困横假途灭虢践土会盟何遵约法韩弊烦刑起翦颇牧用军最精宣威沙漠驰誉丹青九州禹迹百郡秦并岳宗泰岱禅主云亭雁门紫塞鸡田赤城昆池碣石巨野洞庭旷远绵邈岩岫杳冥治本于农务兹稼穑俶载南亩我艺黍稷税熟贡新劝赏黜陟孟轲敦素史鱼秉直庶几中庸劳谦谨敕聆音察理鉴貌辨色贻厥嘉猷勉其植植省躬讥诫宠增抗极殆辱近耻林皋幸即两疏见机解组谁逼索居闲处沉默寂寥求古寻论散虑逍遥欣奏累遣戚谢欢招渠荷的历园莽抽条枇杷晚翠梧桐早凋陈根委翳落叶飘摇游鹍独运凌摩绛霄
`.trim().split('').filter(char => char.trim() !== '');

function generateRandomThousandChars(length) {
	const chars = [];
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * THOUSAND_CHARACTER_POOL.length);
		chars.push(THOUSAND_CHARACTER_POOL[randomIndex]);
	}
	return chars.join('');
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
	const summaryLength = summaryPart.length;
	const randomLength = 20 - summaryLength;

	let attempts = 0;
	const maxAttempts = 100;

	while (attempts < maxAttempts) {
		const randomPart = generateRandomThousandChars(randomLength);
		const filename = `${summaryPart}-${randomPart}`;

		if (!isFilenameConflict(filename, existingFiles, currentFile)) {
			return filename;
		}

		attempts++;
	}

	// 如果多次尝试后仍有冲突，添加时间戳作为后备方案
	const timestamp = Date.now().toString().slice(-4);
	const randomPart = generateRandomThousandChars(randomLength - 4) + timestamp;
	return `${summaryPart}-${randomPart}`;
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
console.log('=== 文件名生成器测试 ===\n');

const existingFiles = ['异或逻辑探讨-天地玄黄.md', '编程技巧交流-日月盈昃.md'];

// 测试 1: 正常情况
const test1 = generateFilenameFromSummary('异或逻辑探讨', existingFiles);
console.log('测试 1 - 正常情况:');
console.log(`  输入: "异或逻辑探讨"`);
console.log(`  输出: "${test1}"`);
console.log(`  长度: ${test1.length} (期望: 21)\n`);

// 测试 2: 冲突检测
const test2 = generateFilenameFromSummary('编程技巧交流', existingFiles);
console.log('测试 2 - 冲突检测:');
console.log(`  输入: "编程技巧交流"`);
console.log(`  输出: "${test2}"`);
console.log(`  长度: ${test2.length} (期望: 21)\n`);

// 测试 3: 太短的概括
const test3 = generateFilenameFromSummary('逻辑', existingFiles);
console.log('测试 3 - 太短的概括:');
console.log(`  输入: "逻辑"`);
console.log(`  输出: "${test3}"`);
console.log(`  长度: ${test3.length} (期望: 21)\n`);

// 测试 4: 太长的概括
const test4 = generateFilenameFromSummary('这是一个非常非常长的概括超过十三个字', existingFiles);
console.log('测试 4 - 太长的概括:');
console.log(`  输入: "这是一个非常非常长的概括超过十三个字"`);
console.log(`  输出: "${test4}"`);
console.log(`  长度: ${test4.length} (期望: 21)\n`);

// 测试 5: 正好 13 个字
const test5 = generateFilenameFromSummary('哲学思考与人生意义', existingFiles);
console.log('测试 5 - 正好 13 个字:');
console.log(`  输入: "哲学思考与人生意义"`);
console.log(`  输出: "${test5}"`);
console.log(`  长度: ${test5.length} (期望: 21)\n`);

// 测试 6: 正好 7 个字
const test6 = generateFilenameFromSummary('编程入门', existingFiles);
console.log('测试 6 - 正好 7 个字:');
console.log(`  输入: "编程入门"`);
console.log(`  输出: "${test6}"`);
console.log(`  长度: ${test6.length} (期望: 21)\n`);

console.log('=== 测试完成 ===');

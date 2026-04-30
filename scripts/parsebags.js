import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 确保无论在哪里运行脚本，路径都能精准回退寻找
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdFile = path.resolve(__dirname, '../rules/equipment/armors/bag.md'); 
const outputFile = path.resolve(__dirname, '../.vitepress/theme/database/bag.js');

function parseMarkdownToData() {
  let allEquipments = [];

  try {
    if (!fs.existsSync(mdFile)) {
      console.error(`❌ 找不到源文件: ${mdFile}`);
      return;
    }

    const content = fs.readFileSync(mdFile, 'utf-8');
    
    // 使用多行模式 (^#) 进行切分，这比之前的切分更精准
    const blocks = content.split(/(?=^###\s)/m);

    blocks.forEach((block, index) => {
      // 必须匹配标题，且允许标题后带任意空格
      const nameMatch = block.match(/^###\s+(.*)/m);
      if (!nameMatch) return;

      // 【核心修复】：使用 [：:\s]+ 完美兼容中文冒号、英文冒号和多余的空格
      const tagsMatch = block.match(/(小型|中型|大型)/); 
      const producerMatch = block.match(/生产商[：:\s]+(.*)/);
      const priceTextMatch = block.match(/价值[：:\s]+.*?(\d+两(?:\d+钱)?)/);
      const capacityMatch = block.match(/容量[：:\s]+(\d+)/);

      if (nameMatch) {
        // 计算纯数字价格逻辑
        let priceNum = 0;
        if (priceTextMatch) {
          const text = priceTextMatch[1];
          const liang = text.match(/(\d+)两/) ? parseInt(text.match(/(\d+)两/)[1]) : 0;
          const qian = text.match(/(\d+)钱/) ? parseInt(text.match(/(\d+)钱/)[1]) : 0;
          priceNum = liang + (qian * 0.1); 
        }

        allEquipments.push({
          id: `bag_${index}_${Date.now()}`,
          name: nameMatch[1].trim(),
          category: "背包",
          tags: [
            tagsMatch ? "规格: " + tagsMatch[1] : "", 
            producerMatch ? producerMatch[1].trim() : ""
          ].filter(Boolean),
          capacity: capacityMatch ? parseInt(capacityMatch[1]) : 0,
          priceText: priceTextMatch ? priceTextMatch[1] : "0两",
          price: priceNum,
          link: `/rules/equipment/armors/bag`
        });
      }
    });

    const outputContent = `export const bags = ${JSON.stringify(allEquipments, null, 2)};`;
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`✅ 成功从 bag.md 抓取了 ${allEquipments.length} 个背包，已生成数据文件！`);
    
  } catch (error) {
    console.error("❌ 解析失败：", error.message);
  }
}

parseMarkdownToData();
import fs from 'fs';
import path from 'path';

// 【关键修改 1】：这里直接精确指向你的具体文件 bag.md
const mdFile = path.join(process.cwd(), 'rules/equipment/armors/bag.md'); 
// 生成的数据依然放在 theme 目录下
const outputFile = path.join(process.cwd(), '.vitepress/theme/equipmentData.js');

function parseMarkdownToData() {
  let allEquipments = [];

  try {
    // 【关键修改 2】：直接读取这一个文件，不需要 readdirSync(扫描文件夹) 了
    const content = fs.readFileSync(mdFile, 'utf-8');
    
    // 按区块切分（假设每个背包都以 #### 开头）
    const blocks = content.split(/(?=#### )/);

    blocks.forEach((block, index) => {
      if (!block.startsWith('####')) return;

      // 使用正则表达式提取信息
      const nameMatch = block.match(/####\s+(.*)/);
      const tagsMatch = block.match(/(小型|中型|大型)/); 
      const producerMatch = block.match(/生产商：\s*(.*)/);
      const priceTextMatch = block.match(/价值：.*?(\d+两(?:[1-9]钱)?)/);
      const capacityMatch = block.match(/容量：\s*(\d+)/);

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
            tagsMatch ? "规格: " + tagsMatch[1] : "", // 这里加上了我们之前说的前缀！
            producerMatch ? producerMatch[1].trim() : ""
          ].filter(Boolean),
          capacity: capacityMatch ? parseInt(capacityMatch[1]) : 0,
          priceText: priceTextMatch ? priceTextMatch[1] : "0两",
          price: priceNum,
        });
      }
    });

    // 将提取的数据写入 JS 文件
    const outputContent = `export const equipments = ${JSON.stringify(allEquipments, null, 2)};`;
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`✅ 成功从 bag.md 抓取了 ${allEquipments.length} 个背包，已生成数据文件！`);
    
  } catch (error) {
    console.error("❌ 读取文件失败，请检查路径是否拼错：", error.message);
  }
}

parseMarkdownToData();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用你代码里提供的最新路径
const mdFile = path.resolve('rules/item/vehicleDN.md'); 
const outputFile = path.resolve('.vitepress/theme/database/vehicle.js');

function parseVehiclesToData() {
  let allVehicles = [];

  try {
    if (!fs.existsSync(mdFile)) {
      console.error(`❌ 找不到源文件: ${mdFile}`);
      return;
    }

    const content = fs.readFileSync(mdFile, 'utf-8');
    
    // 【核心修复】：像 bag 一样，直接用 #### 标题进行切分，无视任何 ::: details
    const blocks = content.split(/(?=^####\s)/m);

    blocks.forEach((block, index) => {
      // 只处理以 #### 开头的区块
      const nameMatch = block.match(/^####\s+(.*)/m);
      if (!nameMatch) return;

      // 全部使用基础英文冒号匹配
      const companyMatch = block.match(/公司:\s*(.*)/);
      const priceTextMatch = block.match(/价值:\s*(.*)/);
      const envMatch = block.match(/环境:\s*(.*)/);
      const powerMatch = block.match(/动力:\s*(.*)/);
      const typeMatch = block.match(/种类:\s*(.*)/);
      const seriesMatch = block.match(/系列:\s*(.*)/);

      const name = nameMatch[1].trim();

      // 【拦截器】：文档里有些 #### 是公司简介（比如“#### 弧光动力科技”）
      // 真正的载具肯定有“价值”或者“环境”，如果没有这两个字段，说明它是简介，跳过它。
      if (!priceTextMatch && !envMatch) return;

      // 提取价格数字 (兼容 "1500 两" 或 "12000+ 两")
      let priceNum = 0;
      let priceText = "议价";
      if (priceTextMatch) {
        priceText = priceTextMatch[1].trim();
        const numMatch = priceText.match(/\d+/);
        if (numMatch) priceNum = parseInt(numMatch[0]);
      }

      allVehicles.push({
        id: `vec_${index}_${Date.now()}`,
        name: name,
        category: "载具",
        tags: [
          envMatch ? `环境: ${envMatch[1].trim()}` : "",
          powerMatch ? `动力: ${powerMatch[1].trim()}` : "",
          typeMatch ? `种类: ${typeMatch[1].trim()}` : "",
          seriesMatch ? `系列: ${seriesMatch[1].trim()}` : "",
          companyMatch ? companyMatch[1].trim() : ""
        ].filter(Boolean),
        desc: "详细技术规格请查阅蜃都载具图鉴。", // 简化描述，防止报错
        priceText: priceText,
        price: priceNum,
        link: `/rules/item/vehicleDN`
      });
    });

    const outputContent = `export const vehicles = ${JSON.stringify(allVehicles, null, 2)};`;
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`✅ 成功从 vehicleDN.md 抓取了 ${allVehicles.length} 个载具！`);
    
  } catch (error) {
    console.error("❌ 解析失败：", error.message);
  }
}

parseVehiclesToData();
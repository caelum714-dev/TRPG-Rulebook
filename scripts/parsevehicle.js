import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 路径解析
const mdFile = path.resolve(__dirname, '../rules/equipment/vehicles/vehicleDN.md'); 
const outputFile = path.resolve(__dirname, '../.vitepress/theme/database/vehicle.js');

function parseVehiclesToData() {
  let allVehicles = [];

  try {
    if (!fs.existsSync(mdFile)) {
      console.error("❌ 找不到源文件:", mdFile);
      return;
    }

    const content = fs.readFileSync(mdFile, 'utf-8');
    
    // 改用更稳健的切分方式：按 ::: details ◢ 切分
    const blocks = content.split(/::: details ◢/);

    blocks.forEach((block, index) => {
      // 匹配 #### 后的名称
      const nameMatch = block.match(/####\s+(.*)/);
      if (!nameMatch) return;

      // 【核心改进】：使用 [：:] 兼容中英文冒号，使用 \s* 兼容可能存在的空格
      const getField = (fieldName) => {
        const regex = new RegExp(`${fieldName}[\\s：:]+(.*)`, 'i');
        const match = block.match(regex);
        return match ? match[1].trim() : null;
      };

      const company = getField("公司");
      const priceText = getField("价值");
      const env = getField("环境");
      const power = getField("动力");
      const vehicleType = getField("种类");
      const series = getField("系列");

      // 提取描述：寻找分类信息之后的正文内容
      const lines = block.split('\n');
      const lastFieldIndex = lines.findIndex(l => l.includes('种类') || l.includes('动力'));
      let description = "";
      if (lastFieldIndex !== -1) {
        description = lines.slice(lastFieldIndex + 1)
          .join(' ')
          .replace(/:::/g, '')
          .replace(/####.*/g, '')
          .trim();
      }
      if (description.length > 120) description = description.substring(0, 120) + '...';

      // 价格数值处理 (提取数字部分，兼容 "1500 两" 或 "12000+")
      let priceNum = 0;
      if (priceText) {
        const numMatch = priceText.match(/\d+/);
        priceNum = numMatch ? parseInt(numMatch[0]) : 0;
      }

      allVehicles.push({
        id: `vec_${index}_${Date.now()}`,
        name: nameMatch[1].trim(),
        category: "载具",
        tags: [
          env ? `环境: ${env}` : "",
          power ? `动力: ${power}` : "",
          vehicleType ? `种类: ${vehicleType}` : "",
          series ? `系列: ${series}` : "",
          company ? company : ""
        ].filter(Boolean),
        desc: description || "暂无详细说明。",
        priceText: priceText ? (priceText.includes('两') ? priceText : priceText + ' 两') : "议价",
        price: priceNum,
        link: `/rules/equipment/vehicles/vehicleDN`
      });
    });

    const outputContent = `export const vehicles = ${JSON.stringify(allVehicles, null, 2)};`;
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`✅ 成功从 vehicleDN.md 抓取了 ${allVehicles.length} 个载具！`);
    
  } catch (error) {
    console.error("❌ 解析失败：", error);
  }
}

parseVehiclesToData();
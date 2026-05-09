import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 请确认源文件文件夹路径
const mdDir = path.resolve('rules/2.equipment/weapons'); 
const outputFile = path.resolve('.vitepress/theme/database/3.weapon.js');

function parseWeaponsToData() {
  let allWeapons = [];
  let globalWeaponIndex = 0; 

  try {
    if (!fs.existsSync(mdDir)) {
      console.error(`❌ 找不到目标文件夹: ${mdDir}`);
      return;
    }

    const files = fs.readdirSync(mdDir);
    let processedFilesCount = 0;

    files.forEach(file => {
      // 过滤掉非 .md 文件，并且绝对跳过 index.md
      if (!file.endsWith('.md') || file.toLowerCase() === 'index.md') {
        return;
      }

      const mdFile = path.join(mdDir, file);
      const content = fs.readFileSync(mdFile, 'utf-8');
      processedFilesCount++;
      
      // 按 ### 标题切分区块 (容错版，支持2~4个#)
      const blocks = content.split(/(?=^#{2,4}\s)/m);

      blocks.forEach((block) => {
        // 提取武器名
        const nameMatch = block.match(/^#{2,4}\s+(.*)/m);
        if (!nameMatch) return;
        const name = nameMatch[1].trim();

        // 提取基础字段 (容错版，兼容有无加粗**)
        const categoryMatch = block.match(/\*?\*?【分类】\*?\*?\s*[:：]\s*(.*)/);
        const rangeMatch = block.match(/\*?\*?【射程】\*?\*?\s*[:：]\s*(.*)/); // 
        const sizeMatch = block.match(/\*?\*?【大小】\*?\*?\s*[:：]\s*(.*)/);
        const companyMatch = block.match(/\*?\*?【公司】\*?\*?\s*[:：]\s*(.*)/);
        const valueMatchStr = block.match(/\*?\*?【价值】\*?\*?\s*[:：]\s*(.*)/);
        
        const socialCreditMatch = block.match(/\*?\*?【社会信用等级】\*?\*?\s*[:：]\s*(.*)/);
        const bonusSourceMatch = block.match(/\*?\*?【加成来源】\*?\*?\s*[:：]\s*(.*)/);
        const damageMatch = block.match(/\*?\*?【伤害】\*?\*?\s*[:：]\s*(.*)/);

        // 【拦截器】如果连价值或分类都没有，直接跳过 (说明大概率是世界观前言)
        if (!valueMatchStr && !categoryMatch) return;

        // ==========================================
        // 1. 解析大小、负重 与 ✨双持
        // ==========================================
        let sizeNum = 0;
        let isHeavy = false;
        let isTwoHanded = false; // ✨ 新增双持布尔值
        
        if (sizeMatch) {
          const sizeText = sizeMatch[1];
          const numMatch = sizeText.match(/\d+/); 
          if (numMatch) sizeNum = parseInt(numMatch[0]);
          
          if (sizeText.includes('负重')) isHeavy = true; 
          if (sizeText.includes('双持')) isTwoHanded = true; // ✨ 新增双持判定
        }

        // ==========================================
        // 2. 解析价值 (大类、细分、数值)
        // ==========================================
        let rarityMajor = "未知";
        let rarityMinor = "";
        let price = 0;
        let rawValue = "";

        if (valueMatchStr) {
          rawValue = valueMatchStr[1].trim();
          const valRegex = /(.*?级)([A-Z]?)[^\d]*(\d+)/;
          const parsedVal = rawValue.match(valRegex);

          if (parsedVal) {
            rarityMajor = parsedVal[1];
            rarityMinor = parsedVal[2];
            price = parseInt(parsedVal[3]);
          } else {
            const fallbackNum = rawValue.match(/\d+/);
            if (fallbackNum) price = parseInt(fallbackNum[0]);
            const fallbackRarity = rawValue.match(/(.*?级)/);
            if (fallbackRarity) rarityMajor = fallbackRarity[1];
          }
        }

        // ==========================================
        // 3. ✨ 解析加成来源 (剔除括号，并按 / 切分为数组)
        // ==========================================
        let cleanBonusSources = [];
        if (bonusSourceMatch) {
          let rawBonus = bonusSourceMatch[1].trim();
          
          // 替换掉所有 (...) 或 （...） 中的内容为空
          let noParentheses = rawBonus.replace(/\([^)]*\)|（[^）]*）/g, '');
          
          // ✨ 核心修复：使用正则 /[/,，、]/ 同时支持斜杠、英文逗号、中文逗号甚至中文顿号切分！
          cleanBonusSources = noParentheses.split(/[/,，、]/).map(s => s.trim()).filter(Boolean);
        }

        // ==========================================
        // 4. 解析伤害 (剔除括号，提取分类)
        // ==========================================
        let rawDamage = "";
        let damageType = "";
        let armorPierceLevel = "";

        if (damageMatch) {
          rawDamage = damageMatch[1].trim();

          let cleanDamage = rawDamage
            .replace(/\s*(?:\([^)]*\)|（[^）]*）)\s*$/, "")
            .trim();

          // 提取穿甲等级，例如 "1d12, 2级穿刺" -> "2"
          const armorPierceMatch = cleanDamage.match(/[，,]\s*(\d+)级/);
          if (armorPierceMatch) {
            armorPierceLevel = Number(armorPierceMatch[1])
          }

          // 提取伤害类型，例如 "1d12, 2级穿刺" -> "穿刺"
          const typeMatch = cleanDamage.match(/级(.+)$/);
          if (typeMatch) {
            damageType = typeMatch[1].trim();
          }
        }

        // ==========================================
        // 5. 解析射程
        // ==========================================
        let range = rangeMatch ? rangeMatch[1].trim() : "";

        // ==========================================
        // 6. 战术、配件、额外效果 (布尔值提取)
        // ==========================================
        const hasTactics = /战术[:：]/m.test(block);
        const hasAccessories = /【配件】/.test(block);
        const hasExtraEffect = /【额外效果】/.test(block);

        // 7. 组装最终数据对象
        allWeapons.push({
          id: `wpn_${globalWeaponIndex++}`, 
          sourceFile: file,           
          name: name,
          category: categoryMatch ? categoryMatch[1].trim() : "",
          range: range,                           // ✨ 提取出的射程文本
          company: companyMatch ? companyMatch[1].trim() : "",
          socialCredit: socialCreditMatch ? socialCreditMatch[1].trim() : "",
          bonusSources: cleanBonusSources,        // ✨ 数组格式的纯净加成来源 (例: ["体术", "灵巧"])
          rawDamage: rawDamage,     
          damageType: damageType,
          armorPierceLevel: armorPierceLevel,   
          size: sizeNum,
          isHeavy: isHeavy,         
          isTwoHanded: isTwoHanded,               
          rarityMajor: rarityMajor, 
          rarityMinor: rarityMinor, 
          price: price,             
          hasTactics: hasTactics,   
          hasAccessories: hasAccessories,
          hasExtraEffect: hasExtraEffect,
          rawValue: rawValue        
        });
      });
    });

    const outputContent = `export const weapons = ${JSON.stringify(allWeapons, null, 2)};`;
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`✅ 成功扫描了 ${processedFilesCount} 个文件，并抓取了总计 ${allWeapons.length} 把武器的数据！(已新增 射程、双持 及 纯净版加成来源提取)`);
    
  } catch (error) {
    console.error("❌ 解析失败：", error.message);
  }
}

parseWeaponsToData();
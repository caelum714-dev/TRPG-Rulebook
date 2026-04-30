---
layout: page
title: 交易终端
---

<script setup>
import { ref, computed } from 'vue'
import ShopTerminal from './.vitepress/theme/ShopTerminal.vue'

// 1. 引入扁平化数据库
// 这里使用了 as 关键字重命名，方便区分不同类型的数据
import { bags } from './.vitepress/theme/database/bag.js'
// 【未来扩展预留】：当你有了载具、武器和防具数据后，像下面这样解除注释并引入
import { vehicles } from './.vitepress/theme/database/vehicle.js'
// import { weapons } from './.vitepress/theme/database/weapon.js'
// import { armors } from './.vitepress/theme/database/armor.js'

// 2. 状态控制：如果 activeTab 是 null，就显示主页；如果有值，就显示对应的商店
const activeTab = ref(null)

// 3. 配置扇区信息（架构重组：组合并分配数据）
const shopSectors = {
  '单兵战术武装': {
    icon: '⚔️',
    title: '战术武装许可',
    desc: '未经蜃都安保局备案的动能枪械、近战冷兵器、战术护甲与单兵护盾。[暂未开放]',
    // 【未来应用】：使用展开语法 (...) 将武器和防具数组合并到一起
    // data: [...weapons, ...armors]
    data: [] 
  },
  '后勤与远行保障': {
    icon: '📦',
    title: '后勤与远行中转',
    desc: '包含战术背包、生存消耗品及载具中转调度。出城探险者的第一站。',
    // 【核心修改】：使用展开语法。现在只有 bags，以后加上载具就是 data: [...bags, ...vehicles]
    data: [...bags, ...vehicles] 
  },
  '黑市情报网络': {
    icon: '📡',
    title: '加密情报与骇入',
    desc: '售卖高权限加密信息、目标坐标、骇入套件与电子战插件。[暂未开放]',
    data: [] // 作为第三支柱的占位符，保持UI平衡
  }
}

// 获取当前选中的数据
const currentGoods = computed(() => {
  return activeTab.value ? shopSectors[activeTab.value].data : []
})
</script>

<div v-if="!activeTab" class="landing-page">
  <div class="terminal-header">
    <h1 class="glitch-text">💱 万神都地下链路</h1>
    <p class="warning-text">⚠️ 警告：您正在访问未授权的交易网络。请规划您的资金，所有交易一经确认概不退换。</p>
  </div>

  <div class="sector-grid">
    <div 
      v-for="(sector, key) in shopSectors" 
      :key="key"
      class="sector-card"
      :class="{ disabled: sector.data.length === 0 }"
      @click="sector.data.length > 0 ? activeTab = key : null"
    >
      <div class="sector-icon">{{ sector.icon }}</div>
      <div class="sector-info">
        <h3 class="sector-title">{{ sector.title }}</h3>
        <p class="sector-desc">{{ sector.desc }}</p>
      </div>
      <div class="entry-status">
        <span v-if="sector.data.length > 0" class="status-open">>> 点击登入</span>
        <span v-else class="status-locked">>> 频道加密</span>
      </div>
    </div>
  </div>
</div>


<div v-else class="shop-interface">
  
  <div class="shop-nav-bar">
    <button class="back-btn" @click="activeTab = null">← 返回主终端</button>
    <div class="shop-tabs">
      <button 
        v-for="(sector, key) in shopSectors" 
        :key="key" 
        v-show="sector.data.length > 0" 
        class="tab-btn" 
        :class="{ active: activeTab === key }" 
        @click="activeTab = key"
      >
        {{ key }}
      </button>
    </div>
  </div>

  <ShopTerminal :goods="currentGoods" :shopTitle="shopSectors[activeTab].title" />

</div>



<style scoped>
/* 样式部分保持你原本优秀的设计不变 */
.landing-page { max-width: 900px; margin: 0 auto; padding-top: 40px; }
.terminal-header { text-align: center; margin-bottom: 50px; border-bottom: 1px solid #333; padding-bottom: 20px; }
.glitch-text { font-size: 2.5rem; font-weight: bold; color: #d9a05b; letter-spacing: 2px; margin-bottom: 10px; }
.warning-text { color: #ff5555; font-family: monospace; font-size: 0.95rem; }

.sector-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.sector-card { background: var(--vp-c-bg-soft); border: 1px solid #444; border-radius: 8px; padding: 20px; cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.sector-card:hover:not(.disabled) { border-color: #d9a05b; transform: translateY(-3px); box-shadow: 0 4px 15px rgba(217, 160, 91, 0.1); }
.sector-card.disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); }

.sector-icon { font-size: 2.5rem; margin-bottom: 15px; }
.sector-title { margin: 0 0 10px 0; font-size: 1.3rem; color: var(--vp-c-text-1); border: none; padding: 0;}
.sector-desc { font-size: 0.9rem; color: var(--vp-c-text-2); line-height: 1.5; flex: 1; margin: 0; }

.entry-status { margin-top: 20px; font-family: monospace; font-weight: bold; text-align: right; }
.status-open { color: #5b9e7b; }
.status-locked { color: #888; }

.shop-interface { margin-top: 20px; }
.shop-nav-bar { display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; padding: 10px 20px; border-radius: 8px; border: 1px solid #333; margin-bottom: 20px; }
.back-btn { color: #888; background: none; border: none; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
.back-btn:hover { color: #fff; }

.shop-tabs { display: flex; gap: 10px; }
.tab-btn { padding: 6px 16px; background: transparent; border: 1px solid #444; color: #888; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.9rem;}
.tab-btn:hover { color: #d9a05b; border-color: #d9a05b; }
.tab-btn.active { background: #d9a05b; color: #000; border-color: #d9a05b; }

@media (max-width: 768px) {
  .shop-nav-bar { flex-direction: column; gap: 15px; align-items: flex-start; }
}
</style>
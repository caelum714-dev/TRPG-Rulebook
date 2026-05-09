<template>
  <div class="compare-modal-overlay" @click.self="$emit('close')">
    <div class="compare-modal">
      <div class="modal-header">
        <h3 class="glitch-text">TACTICAL ANALYSIS</h3>
        <button class="close-btn" @click="$emit('close')">✖</button>
      </div>

      <div class="weapons-header">
        <div class="weapon-title left-weapon">
          {{ w1.name }}
          <span v-if="w1IsRad" class="rad-badge">辐射</span>
        </div>
        <div class="vs-badge">VS</div>
        <div class="weapon-title right-weapon">
          <span v-if="w2IsRad" class="rad-badge">辐射</span>
          {{ w2.name }}
        </div>
      </div>

      <div class="chart-container">
        <div class="stat-row" v-for="stat in stats" :key="stat.key">
          <div class="side-container left-side">
            <span class="val-label" :class="{ 'winner-text': isWinner(stat, 1), 'rad-text': stat.key === 'avgDmg' && w1IsRad }">
              {{ stat.w1ValDisplay }}
            </span>
            <div class="bar-track">
              <div 
                class="bar" 
                :class="{ 'winner': isWinner(stat, 1), 'rad-bar': stat.key === 'avgDmg' && w1IsRad }"
                :style="{ width: getPercentage(stat, 1) + '%' }">
              </div>
            </div>
          </div>
          
          <div class="stat-label">{{ stat.label }}</div>
          
          <div class="side-container right-side">
            <div class="bar-track">
              <div 
                class="bar" 
                :class="{ 'winner': isWinner(stat, 2), 'rad-bar': stat.key === 'avgDmg' && w2IsRad }"
                :style="{ width: getPercentage(stat, 2) + '%' }">
              </div>
            </div>
            <span class="val-label" :class="{ 'winner-text': isWinner(stat, 2), 'rad-text': stat.key === 'avgDmg' && w2IsRad }">
              {{ stat.w2ValDisplay }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  weapons: { type: Array, required: true }
})

defineEmits(['close'])

const w1 = computed(() => props.weapons[0] || {})
const w2 = computed(() => props.weapons[1] || {})

// --- 核心解析逻辑 (完全保留你原始的代码) ---

// 1. 解析辐射 (真伤判定)
const checkRadiation = (w) => {
  const source = (w.tags || []).join(',') + (w.description || '') + (w.damageType || '')
  return source.includes('辐射') || source.includes('真伤')
}
const w1IsRad = computed(() => checkRadiation(w1.value))
const w2IsRad = computed(() => checkRadiation(w2.value))

// 2. 解析穿甲/穿刺等级 (保留正则逻辑)
const parseAPLevel = (w) => {
  const source = (w.tags || []).join(',') + (w.description || '')
  const matches = [...source.matchAll(/(\d+)级/g)]
  if (matches.length > 0) {
    return Math.max(...matches.map(m => parseInt(m[1])))
  }
  return 0
}

// 3. 解析伤害骰子 (保留原逻辑)
const parseDamage = (dmgStr) => {
  if (!dmgStr) return { avg: 0, max: 0, display: '0' }
  const match = String(dmgStr).match(/(\d+)d(\d+)/i)
  if (match) {
    const n = parseInt(match[1]), m = parseInt(match[2])
    return { avg: n * ((m + 1) / 2), max: n * m, display: dmgStr }
  }
  const val = parseFloat(dmgStr) || 0
  return { avg: val, max: val, display: dmgStr }
}

const w1Dmg = computed(() => parseDamage(w1.value.rawDamage || w1.value.damage))
const w2Dmg = computed(() => parseDamage(w2.value.rawDamage || w2.value.damage))

// --- 新增：射程区间处理逻辑 ---
const getRangeInfo = (rangeData) => {
  const rangeWeight = { '贴身': 1, '近程': 2, '中程': 3, '远程': 4, '超远程': 5 }
  // 处理数组或字符串格式
  const rangeStr = Array.isArray(rangeData) ? rangeData.join('-') : String(rangeData || 'N/A')
  
  // 计算权重（取区间中的最大值）
  let maxWeight = 0
  Object.keys(rangeWeight).forEach(key => {
    if (rangeStr.includes(key)) maxWeight = Math.max(maxWeight, rangeWeight[key])
  })
  
  return { display: rangeStr, weight: maxWeight }
}

// --- 统计维度 (在保留原项基础上，新增战术、配件、射程) ---
const stats = computed(() => {
  const r1 = getRangeInfo(w1.value.range)
  const r2 = getRangeInfo(w2.value.range)

  return [
    {
      key: 'avgDmg', label: '期望输出', 
      w1Val: w1Dmg.value.avg, w2Val: w2Dmg.value.avg, 
      w1ValDisplay: w1Dmg.value.avg.toFixed(1), w2ValDisplay: w2Dmg.value.avg.toFixed(1),
      higherIsBetter: true 
    },
    {
      key: 'ap', label: '穿透等级', 
      w1Val: parseAPLevel(w1.value), w2Val: parseAPLevel(w2.value), 
      w1ValDisplay: 'Lv.' + parseAPLevel(w1.value), w2ValDisplay: 'Lv.' + parseAPLevel(w2.value),
      higherIsBetter: true
    },
    {
      key: 'range', label: '最佳射程',
      w1Val: r1.weight, w2Val: r2.weight,
      w1ValDisplay: r1.display, w2ValDisplay: r2.display,
      higherIsBetter: true
    },
    {
      key: 'tactics', label: '战术位',
      w1Val: w1.value.hasTactics ? 1 : 0, w2Val: w2.value.hasTactics ? 1 : 0,
      w1ValDisplay: w1.value.hasTactics ? '✓' : '✕', w2ValDisplay: w2.value.hasTactics ? '✓' : '✕',
      higherIsBetter: true
    },
    {
      key: 'acc', label: '配件位',
      w1Val: w1.value.hasAccessories? 1 : 0, w2Val: w2.value.hasAccessories? 1 : 0,
      w1ValDisplay: w1.value.hasAccessories? '✓' : '✕', w2ValDisplay: w2.value.hasAccessories? '✓' : '✕',
      higherIsBetter: true
    },
    {
      key: 'size', label: '装载大小', 
      w1Val: parseFloat(w1.value.size) || 0, w2Val: parseFloat(w2.value.size) || 0,
      w1ValDisplay: w1.value.size || '0', w2ValDisplay: w2.value.size || '0',
      higherIsBetter: false 
    },
    {
      key: 'price', label: '市场价格', 
      w1Val: parseInt(w1.value.price) || 0, w2Val: parseInt(w2.value.price) || 0,
      w1ValDisplay: w1.value.price, w2ValDisplay: w2.value.price,
      higherIsBetter: false 
    }
  ]
})

const getPercentage = (stat, playerNum) => {
  const maxVal = Math.max(stat.w1Val, stat.w2Val)
  if (maxVal === 0) return 10 
  const val = playerNum === 1 ? stat.w1Val : stat.w2Val
  return Math.max((val / maxVal) * 90, 10)
}

const isWinner = (stat, playerNum) => {
  if (stat.key === 'avgDmg') {
    if (w1IsRad.value && !w2IsRad.value) return playerNum === 1
    if (w2IsRad.value && !w1IsRad.value) return playerNum === 2
  }
  if (stat.w1Val === stat.w2Val) return false
  return stat.higherIsBetter 
    ? (playerNum === 1 ? stat.w1Val > stat.w2Val : stat.w2Val > stat.w1Val)
    : (playerNum === 1 ? stat.w1Val < stat.w2Val : stat.w2Val < stat.w1Val)
}
</script>

<style scoped>
/* Main Container */
.compare-modal {
  background: #1a1a1a; /* Dark gray background from image */
  border: 1px dashed #444;
  padding: 40px;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.glitch-text {
  color: #d4af37;
  text-align: center;
  letter-spacing: 2px;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.weapons-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-bottom: 1px dashed #444;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.weapon-title {
  font-size: 1.8rem;
  font-weight: bold;
}

/* Stat Row Grid */
.stat-row {
  display: grid;
  grid-template-columns: 1fr 120px 1fr; /* Two bars with a center label */
  align-items: center;
  margin-bottom: 25px;
}

.stat-label {
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  text-transform: uppercase;
}

/* Bar Containers */
.bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05); /* The dark track behind the bar */
  height: 12px;
  border-radius: 6px;
  position: relative;
}

/* Align values to the outside */
.left-bar-container { flex-direction: row-reverse; }
.right-bar-container { flex-direction: row; }

/* The Actual Progress Bar */
.bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s ease-out;
}

/* Tactical Green (Winner/Higher) */
.bar.winner {
  background: #98FB98;
  box-shadow: 0 0 10px rgba(152, 251, 152, 0.4);
}

/* Tactical Red (Lower) */
.bar:not(.winner) {
  background: #CD5C5C;
  opacity: 0.6;
}

/* Radiation Override */
.radiation-bar {
  background: linear-gradient(90deg, #00ff41, #98FB98) !important;
}

/* Value Labels */
.val-label {
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  width: 60px;
}

.left-bar-container .val-label { color: #98FB98; text-align: right; }
.right-bar-container .val-label { color: #CD5C5C; text-align: left; }

/* Invert colors if the logic dictates higher is better */
.winner-text { color: #98FB98 !important; }
.loser-text { color: #CD5C5C !important; }
</style>
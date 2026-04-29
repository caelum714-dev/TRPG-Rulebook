<template>
  <div class="shop-container">
    
    <div class="catalog-section">
      <div class="section-header">
        <h3 class="section-title">📦 {{ shopTitle }}</h3>
        <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">× 清空所有筛选</button>
      </div>

      <div class="category-tabs" v-if="categories.length > 0">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="cat-btn"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          [ {{ cat }} ]
        </button>
      </div>
      
      <div class="filter-panel" v-if="hasAnyFilterOptions">
        
        <div class="filter-row" v-if="filterOptions.brands.length > 0">
          <div class="filter-label">【公司】</div>
          <div class="filter-options">
            <button v-for="b in filterOptions.brands" :key="b"
                    class="tag-btn" :class="{ active: filters.brand.includes(b) }"
                    @click="toggleFilter('brand', b)">
              {{ b }}
            </button>
          </div>
        </div>

        <div class="filter-row" v-for="group in filterOptions.dynamic" :key="group.label">
          <div class="filter-label">【{{ group.label }}】</div>
          <div class="filter-options">
            <button v-for="opt in group.options" :key="opt"
                    class="tag-btn" :class="{ active: filters.dynamic[group.label] && filters.dynamic[group.label].includes(opt) }"
                    @click="toggleFilter('dynamic', opt, group.label)">
              {{ opt.split(':')[1].trim() }}
            </button>
          </div>
        </div>

        <div class="filter-row" v-if="filterOptions.capacities.length > 0">
          <div class="filter-label">【容量】</div>
          <div class="filter-options">
            <button v-for="c in filterOptions.capacities" :key="c"
                    class="tag-btn" :class="{ active: filters.capacity.includes(c) }"
                    @click="toggleFilter('capacity', c)">
              {{ c }} 空间
            </button>
          </div>
        </div>

      </div>

      <div class="product-list">
        <div v-for="item in filteredItems" :key="item.id" class="product-card">
          <div class="product-info">
            <div class="p-name">{{ item.name }}</div>
            <div class="p-desc">{{ item.desc }}</div>
            <div class="p-tags">
              <span v-if="item.category" class="p-tag category-tag">{{ item.category }}</span>
              <span v-if="item.capacity" class="p-tag cap-tag">📦 容量: {{ item.capacity }}</span>
              
              <span v-for="t in item.tags" :key="t" class="p-tag tag-group">
                <template v-if="t && t.includes(':')">
                  <span class="tag-prefix">{{ t.split(':')[0] }}</span>
                  <span class="tag-value">{{ t.split(':')[1] }}</span>
                </template>
                <template v-else>{{ t }}</template>
              </span>
            </div>
          </div>
          <div class="product-action">
            <div class="p-price">{{ item.priceText }}</div>
            <button class="add-btn" @click="addToCart(item)">+ 拿取</button>
          </div>
        </div>
        <div v-if="filteredItems.length === 0" class="empty-state">
          无匹配物资，请尝试放宽筛选条件，或切换至其他物资分类。
        </div>
      </div>
    </div>

    <div class="cart-section">
      <h3 class="section-title">📝 携行清单</h3>
      <div class="cart-items">
        <div v-if="cart.length === 0" class="empty-cart">尚未选择任何物资。</div>
        <div v-for="(cartItem, index) in cart" :key="index" class="cart-item">
          <div class="c-info">
            <div class="c-name">{{ cartItem.name }}</div>
            <div v-if="cartItem.capacity" class="c-cap">+{{ cartItem.capacity }} 容量</div>
          </div>
          <div class="c-right">
            <span class="c-price">{{ cartItem.priceText }}</span>
            <button class="remove-btn" @click="removeFromCart(index)">×</button>
          </div>
        </div>
      </div>
      <div class="cart-summary">
        <div class="summary-row">
          <span>预期总容量提升：</span>
          <span class="highlight-text">{{ totalCapacity }}</span>
        </div>
        <div class="summary-row total-cost">
          <span>总计申领预算：</span>
          <span class="total-price">{{ formatCurrency(totalPrice) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  goods: { type: Array, required: true, default: () => [] },
  shopTitle: { type: String, default: "物资调度终端" }
})

// ==========================================
// 【核心新增逻辑】：二级分类导航
// ==========================================

// 1. 从所有传入数据中提取出有哪些二级类别（比如：'背包', '载具'）
const categories = computed(() => {
  const cats = new Set(props.goods.map(item => item.category).filter(Boolean))
  return Array.from(cats)
})

// 2. 当前激活的二级分类
const activeCategory = ref('')

// 3. 当前分类下的所有商品
const categoryGoods = computed(() => {
  if (!activeCategory.value) return props.goods
  return props.goods.filter(item => item.category === activeCategory.value)
})

// === 进阶版多维度筛选逻辑 ===
const filters = ref({
  brand: [],
  capacity: [],
  dynamic: {}
})

const hasActiveFilters = computed(() => {
  if (filters.value.brand.length > 0) return true
  if (filters.value.capacity.length > 0) return true
  for (const key in filters.value.dynamic) {
    if (filters.value.dynamic[key].length > 0) return true
  }
  return false
})

const clearFilters = () => {
  filters.value = { brand: [], capacity: [], dynamic: {} }
}

// 监听外层大频道切换（比如从后勤切到武装），重置二级标签和筛选
watch(() => props.goods, () => {
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0]
  } else {
    activeCategory.value = ''
  }
  clearFilters()
}, { immediate: true })

// 监听内层二级标签切换（比如从背包切到载具），清空筛选器，防止把载具给过滤没了
watch(activeCategory, () => {
  clearFilters()
})

// 自动提取选项 (注意：这里改成了遍历 categoryGoods，确保筛选面板只显示当前分类的选项)
const filterOptions = computed(() => {
  const groups = { brand: new Set(), capacity: new Set() }
  const dynamicPrefixes = {} 

  categoryGoods.value.forEach(item => {
    if (item.capacity) groups.capacity.add(item.capacity)
    if (item.tags) {
      item.tags.forEach(t => {
        if (t.includes(':')) {
          const prefix = t.split(':')[0].trim()
          if (!dynamicPrefixes[prefix]) dynamicPrefixes[prefix] = new Set()
          dynamicPrefixes[prefix].add(t)
        } else {
          groups.brand.add(t)
        }
      })
    }
  })

  return {
    brands: Array.from(groups.brand),
    capacities: Array.from(groups.capacity).sort((a, b) => a - b),
    dynamic: Object.keys(dynamicPrefixes).map(key => ({
      label: key,
      options: Array.from(dynamicPrefixes[key])
    }))
  }
})

// 判断当前类别下是否有任何筛选选项，如果没有就隐藏整个筛选面板
const hasAnyFilterOptions = computed(() => {
  return filterOptions.value.brands.length > 0 || 
         filterOptions.value.capacities.length > 0 || 
         filterOptions.value.dynamic.length > 0
})

const toggleFilter = (type, value, dynamicGroupLabel = null) => {
  if (type === 'brand' || type === 'capacity') {
    const targetArray = filters.value[type]
    const idx = targetArray.indexOf(value)
    if (idx > -1) targetArray.splice(idx, 1)
    else targetArray.push(value)
  } else if (type === 'dynamic') {
    if (!filters.value.dynamic[dynamicGroupLabel]) {
      filters.value.dynamic[dynamicGroupLabel] = []
    }
    const targetArray = filters.value.dynamic[dynamicGroupLabel]
    const idx = targetArray.indexOf(value)
    if (idx > -1) targetArray.splice(idx, 1)
    else targetArray.push(value)
  }
}

// 基于筛选条件进行过滤 (注意：这里在 categoryGoods 基础上继续过滤)
const filteredItems = computed(() => {
  return categoryGoods.value.filter(item => {
    const matchBrand = filters.value.brand.length === 0 || filters.value.brand.some(b => item.tags && item.tags.includes(b))
    const matchCapacity = filters.value.capacity.length === 0 || filters.value.capacity.includes(item.capacity)
    let matchDynamic = true
    for (const prefix in filters.value.dynamic) {
      const selectedOptions = filters.value.dynamic[prefix]
      if (selectedOptions && selectedOptions.length > 0) {
        const hasMatch = selectedOptions.some(opt => item.tags && item.tags.includes(opt))
        if (!hasMatch) {
          matchDynamic = false
          break
        }
      }
    }
    return matchBrand && matchCapacity && matchDynamic
  })
})

// === 购物车逻辑 (保持不变) ===
const cart = ref([])
const addToCart = (item) => cart.value.push({ ...item })
const removeFromCart = (index) => cart.value.splice(index, 1)
const totalCapacity = computed(() => cart.value.reduce((sum, item) => sum + (item.capacity || 0), 0))
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + (item.price || 0), 0))
const formatCurrency = (num) => {
  if (num === 0) return "0两"
  const liang = Math.floor(num)
  const qian = Math.round((num - liang) * 10)
  if (qian === 0) return `${liang}两`
  if (liang === 0) return `${qian}钱`
  return `${liang}两${qian}钱`
}
</script>

<style scoped>
/* 整体布局 */
.shop-container { display: flex; gap: 20px; margin-top: 20px; align-items: flex-start; }
.catalog-section { flex: 2; }
.cart-section { flex: 1; background: var(--vp-c-bg-soft); padding: 15px; border-radius: 8px; border: 1px solid var(--vp-c-divider); position: sticky; top: 80px; }

/* 头部样式 */
.section-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--vp-c-divider); padding-bottom: 10px; margin-bottom: 15px; }
.section-title { margin-top: 0; font-size: 1.2rem; margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
.clear-btn { font-size: 0.85rem; color: #ff5555; background: none; border: none; cursor: pointer; transition: 0.2s; }
.clear-btn:hover { text-decoration: underline; }

/* ======================================= */
/* 【新增】：二级导航 Tag 样式 */
/* ======================================= */
.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.cat-btn {
  background: #111;
  color: #888;
  border: 1px solid #444;
  padding: 8px 16px;
  font-family: monospace;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}
.cat-btn:hover {
  color: #fff;
  border-color: #777;
}
.cat-btn.active {
  background: #d9a05b;
  color: #000;
  border-color: #d9a05b;
  font-weight: bold;
}

/* 独立筛选面板样式 */
.filter-panel { background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px 15px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.filter-row { display: flex; align-items: flex-start; gap: 10px; border-bottom: 1px dashed #333; padding-bottom: 12px; }
.filter-row:last-child { border-bottom: none; padding-bottom: 0; }
.filter-label { font-weight: bold; color: #888; min-width: 60px; padding-top: 4px; }
.filter-options { display: flex; flex-wrap: wrap; gap: 8px; flex: 1; }

/* 按钮样式强化 */
.tag-btn { background: var(--vp-c-bg-alt); border: 1px solid #444; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; color: #ccc; }
.tag-btn:hover { border-color: #d9a05b; color: #fff; }
.tag-btn.active { background: #d9a05b; color: #000; border-color: #d9a05b; font-weight: bold; }

/* 产品卡片样式 */
.product-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--vp-c-divider); border-radius: 6px; margin-bottom: 10px; background: var(--vp-c-bg); }
.p-name { font-weight: bold; font-size: 1.1rem; color: var(--vp-c-text-1); margin-bottom: 4px; }
.p-desc { font-size: 0.85rem; color: var(--vp-c-text-2); margin-bottom: 10px; line-height: 1.4; }
.p-tags { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.p-tag { font-size: 0.75rem; background: var(--vp-c-bg-soft); padding: 2px 6px; border-radius: 4px; color: var(--vp-c-text-2); }
.category-tag { border: 1px solid #5b9e7b; color: #5b9e7b; background: transparent; }
.cap-tag { background: #3d4f45; color: #a4d8bd; }
.tag-group { padding: 0 !important; background: transparent !important; display: flex; align-items: center; }
.tag-prefix { color: #888; background: #2a2a2a; padding: 2px 5px; border-radius: 4px 0 0 4px; font-size: 0.7rem; }
.tag-value { color: #d9a05b; background: #333; padding: 2px 6px; border-radius: 0 4px 4px 0; font-weight: bold; }

.product-action { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 80px;}
.p-price { color: #d9a05b; font-weight: bold; }
.add-btn { background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.add-btn:hover { background: #5b9e7b; color: #fff; border-color: #5b9e7b; }

.cart-items { min-height: 100px; max-height: 400px; overflow-y: auto; margin-bottom: 15px; }
.cart-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed var(--vp-c-divider); }
.c-info { display: flex; flex-direction: column; gap: 4px; }
.c-name { font-size: 0.9rem; font-weight: bold; }
.c-cap { font-size: 0.8rem; color: #5b9e7b; }
.c-right { display: flex; align-items: center; gap: 10px; }
.c-price { color: #d9a05b; font-size: 0.9rem; }
.remove-btn { color: #ff5555; cursor: pointer; background: none; border: none; font-size: 1.2rem; }
.cart-summary { border-top: 2px solid var(--vp-c-divider); padding-top: 15px; display: flex; flex-direction: column; gap: 8px; }
.summary-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
.highlight-text { color: #5b9e7b; font-weight: bold; }
.total-cost { font-size: 1.1rem; font-weight: bold; margin-top: 5px; }
.total-price { color: #d9a05b; font-size: 1.3rem; }
.empty-state, .empty-cart { color: var(--vp-c-text-3); font-size: 0.9rem; text-align: center; padding: 20px 0; }

@media (max-width: 768px) {
  .shop-container { flex-direction: column; }
  .cart-section { width: 100%; position: static; }
}
</style>
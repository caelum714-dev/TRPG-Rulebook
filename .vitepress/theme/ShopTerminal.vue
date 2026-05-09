<template>
  <div class="shop-container">
    
    <div class="catalog-section">
      <div class="section-header">
        <h3 class="section-title">📦 {{ shopTitle }}</h3>
        <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">重置所有筛选</button>
      </div>

      <div class="category-tabs" v-if="categories.length > 0">
        <button 
          v-for="cat in categories" :key="cat"
          class="cat-btn" :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      
      <div class="filter-panel" v-if="hasAnyFilterOptions">
        <div class="filter-row" v-for="group in filterOptions" :key="group.label">
          <div class="filter-label">【{{ group.label }}】</div>
          <div class="filter-options">
            <button v-for="opt in group.options" :key="opt"
                    class="tag-btn" :class="{ active: isFilterActive(group.label, opt) }"
                    @click="toggleFilter(group.label, opt)">
              {{ formatTagName(opt) }}
            </button>
          </div>
        </div>
      </div>

      <div class="product-list">
        <div v-for="item in filteredItems" :key="item.id" class="product-card">
          <div class="product-info">
            <div class="p-name">{{ item.name }}</div>
            <div class="p-desc">{{ item.rawValue || item.desc }}</div>
            <div class="p-tags">
              <span v-if="item.capacity" class="p-tag cap-tag">占用: {{ item.capacity }}</span>
              <span v-for="t in item.tags" :key="t" class="p-tag">{{ t }}</span>
            </div>
          </div>
          <div class="product-action">
            <div class="p-price">{{ formatCurrency(item.price) }}</div>
            <button class="add-btn" @click="addToCart(item)">拿取</button>
          </div>
        </div>
        
        <div v-if="filteredItems.length === 0" class="empty-state">
          该分类下暂无物资，或筛选条件过严。
        </div>
      </div>
    </div>

    <div class="cart-section">
      <h3 class="section-title">📝 携行清单</h3>
      <div class="cart-items">
        <div v-if="globalCart.length === 0" class="empty-cart">清单为空</div>
        <div v-for="cartItem in globalCart" :key="cartItem.id" class="cart-item">
          <div class="c-info">
            <div class="c-name">{{ cartItem.name }} <span v-if="cartItem.quantity > 1">×{{ cartItem.quantity }}</span></div>
            <div class="c-price">{{ formatCurrency(cartItem.price * cartItem.quantity) }}</div>
          </div>
          <div class="c-controls">
            <button @click="removeFromCart(cartItem)">-</button>
            <button @click="addToCart(cartItem)">+</button>
          </div>
        </div>
      </div>
      <div class="cart-summary" v-if="globalCart.length > 0">
        <div class="total-row">
          <span>预计支出：</span>
          <span class="total-price">{{ formatCurrency(totalPrice) }}</span>
        </div>
        <button class="clear-cart-btn" @click="clearCart">清空清单</button>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
// 全局购物车状态（跨组件共享）
const globalCart = ref([])
</script>

<script setup>
const props = defineProps({
  goods: { type: Array, required: true, default: () => [] },
  shopTitle: { type: String, default: "物资调度终端" }
})

// 1. 数据标准化适配器
const normalizedGoods = computed(() => {
  return props.goods.map(item => {
    const _item = { ...item }
    // 转换武器 size 到 capacity
    if (_item.size !== undefined) _item.capacity = _item.size
    
    // 组装万能标签数组
    let t = _item.tags ? [..._item.tags] : []
    if (_item.company) t.push(`公司: ${_item.company}`)
    if (_item.rarityMajor) t.push(`价值: ${_item.rarityMajor}`)
    if (_item.damageType) t.push(`伤害: ${_item.damageType}`)
    if (_item.range) t.push(`射程: ${_item.range}`)
    if (_item.isHeavy) t.push('负重')
    if (_item.isTwoHanded) t.push('双持')
    if (_item.hasTactics) t.push('战术')
    if (_item.hasAccessories) t.push('配件位')
    
    if (_item.bonusSources && _item.bonusSources.length > 0) {
      _item.bonusSources.forEach(bonus => {
         t.push(`加成: ${bonus}`) 
      })
    }


    _item.tags = t
    return _item
  })
})

// 2. 分类逻辑
const categories = computed(() => {
  return Array.from(new Set(normalizedGoods.value.map(i => i.category).filter(Boolean)))
})
const activeCategory = ref('')

// 3. 筛选逻辑（极简重构）
const activeFilters = ref({}) // 格式: { "价值": ["工业级"], "特性": ["⚖️ 负重"] }

const clearFilters = () => { activeFilters.value = {} }

// 监听 goods 变化，重置分类
watch(() => props.goods, (newVal) => {
  activeCategory.value = categories.value.length > 0 ? categories.value[0] : ''
  clearFilters()
}, { immediate: true })

// 核心：生成当前分类下的可选标签组
const filterOptions = computed(() => {
  const groups = {}
  const currentCategoryItems = normalizedGoods.value.filter(i => i.category === activeCategory.value)
  
  currentCategoryItems.forEach(item => {
    item.tags.forEach(tag => {
      let label = "特性", value = tag
      if (tag.includes(':')) {
        [label, value] = tag.split(':').map(s => s.trim())
      }
      if (!groups[label]) groups[label] = new Set()
      groups[label].add(tag) // 存储完整标签
    });
  })
  
  return Object.keys(groups).map(label => ({
    label,
    options: Array.from(groups[label])
  }))
})

const hasAnyFilterOptions = computed(() => filterOptions.value.length > 0)
const hasActiveFilters = computed(() => Object.values(activeFilters.value).some(v => v.length > 0))

const isFilterActive = (label, fullTag) => {
  return activeFilters.value[label]?.includes(fullTag) || false
}

const toggleFilter = (label, fullTag) => {
  if (!activeFilters.value[label]) activeFilters.value[label] = []
  const idx = activeFilters.value[label].indexOf(fullTag)
  if (idx > -1) activeFilters.value[label].splice(idx, 1)
  else activeFilters.value[label].push(fullTag)
}

// 4. 最终过滤输出（修复点：如果没有选筛选，则显示全部）
const filteredItems = computed(() => {
  let items = normalizedGoods.value.filter(i => i.category === activeCategory.value)
  
  // 遍历每一个筛选组
  Object.keys(activeFilters.value).forEach(label => {
    const selectedInGroup = activeFilters.value[label]
    if (selectedInGroup.length > 0) {
      // 组内逻辑：只要物品包含该组中任意一个选中的标签，就保留 (OR)
      // 组间逻辑：必须同时满足各个已选组 (AND)
      items = items.filter(item => selectedInGroup.some(tag => item.tags.includes(tag)))
    }
  })
  return items
})

// 5. 辅助函数
const formatTagName = (tag) => tag.includes(':') ? tag.split(':')[1].trim() : tag
const formatCurrency = (n) => n ? `${Math.floor(n)}两` : '议价'

// 6. 购物车动作
const addToCart = (item) => {
  const exist = globalCart.value.find(i => i.id === item.id)
  if (exist) exist.quantity++
  else globalCart.value.push({ ...item, quantity: 1 })
}
const removeFromCart = (item) => {
  const exist = globalCart.value.find(i => i.id === item.id)
  if (exist.quantity > 1) exist.quantity--
  else globalCart.value = globalCart.value.filter(i => i.id !== item.id)
}
const clearCart = () => globalCart.value = []
const totalPrice = computed(() => globalCart.value.reduce((s, i) => s + (i.price * i.quantity), 0))

</script>

<style scoped>
.shop-container { display: flex; gap: 20px; font-family: monospace; color: #ccc; }
.catalog-section { flex: 3; }
.cart-section { flex: 1; background: #1a1a1a; padding: 15px; border-radius: 4px; border: 1px solid #333; position: sticky; top: 20px; height: fit-content; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.section-title { color: #d9a05b; margin: 0; }

.category-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.cat-btn { background: #222; border: 1px solid #444; color: #888; padding: 6px 12px; cursor: pointer; }
.cat-btn.active { background: #d9a05b !important; color: #000 !important; font-weight: bold; }

.filter-panel { background: #111; padding: 15px; border: 1px solid #333; margin-bottom: 20px; }
.filter-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #222; padding-bottom: 10px; }
.filter-label { color: #666; font-size: 0.8rem; min-width: 60px; }
.filter-options { display: flex; gap: 8px; flex-wrap: wrap; }
.tag-btn { background: #222; border: 1px solid #444; color: #ccc; font-size: 0.8rem; padding: 2px 8px; cursor: pointer; border-radius: 3px; }
.tag-btn.active { border-color: #d9a05b; color: #d9a05b; }

.product-card { background: #1a1a1a; border: 1px solid #333; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; }
.p-name { font-weight: bold; font-size: 1.1rem; color: #fff; margin-bottom: 5px; }
.p-desc { font-size: 0.85rem; color: #888; margin-bottom: 10px; }
.p-tags { display: flex; gap: 5px; }
.p-tag { font-size: 0.7rem; background: #222; padding: 2px 5px; border-radius: 3px; color: #666; }
.cap-tag { color: #5b9e7b; border: 1px solid #5b9e7b; }

.p-price { color: #d9a05b; font-weight: bold; margin-bottom: 5px; text-align: right; }
.add-btn { background: #d9a05b; color: #000; border: none; padding: 5px 15px; cursor: pointer; font-weight: bold; }

.cart-item { border-bottom: 1px dashed #333; padding: 10px 0; display: flex; justify-content: space-between; align-items: center; }
.total-row { display: flex; justify-content: space-between; margin-top: 15px; font-weight: bold; }
.total-price { color: #d9a05b; font-size: 1.2rem; }
.clear-btn, .clear-cart-btn { background: none; border: 1px solid #555; color: #888; cursor: pointer; font-size: 0.7rem; }
.empty-state, .empty-cart { padding: 30px; text-align: center; color: #444; }
</style>
<template>
  <div class="shop-container">
    
    <div class="catalog-section">
      <h3 class="section-title">📦 {{ shopTitle }}</h3>
      
      <div class="filter-area">
        <button 
          v-for="tag in allAvailableTags" 
          :key="tag"
          class="tag-btn"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
        <button v-if="selectedTags.length > 0" class="clear-btn" @click="selectedTags = []">清空筛选</button>
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
                <template v-else>
                  {{ t }}
                </template>
              </span>
            </div>
          </div>
          <div class="product-action">
            <div class="p-price">{{ item.priceText }}</div>
            <button class="add-btn" @click="addToCart(item)">+ 拿取</button>
          </div>
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
import { ref, computed } from 'vue'

// 1. 接收外部传参
const props = defineProps({
  goods: {
    type: Array,
    required: true,
    default: () => []
  },
  shopTitle: {
    type: String,
    default: "物资调度终端"
  }
})

// 2. 筛选逻辑（你之前缺少的 selectedTags 在这里！）
const selectedTags = ref([])

const allAvailableTags = computed(() => {
  const tags = new Set()
  props.goods.forEach(item => {
    if (item.tags) item.tags.forEach(t => tags.add(t))
  })
  return Array.from(tags)
})

const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

const filteredItems = computed(() => {
  if (selectedTags.value.length === 0) return props.goods
  return props.goods.filter(item => {
    return selectedTags.value.every(selectedTag => item.tags && item.tags.includes(selectedTag))
  })
})

// 3. 购物车与计算逻辑（你之前缺失的部分！）
const cart = ref([])

const addToCart = (item) => {
  cart.value.push({ ...item })
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const totalCapacity = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.capacity || 0), 0)
})

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price || 0), 0)
})

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
.shop-container { display: flex; gap: 20px; margin-top: 20px; align-items: flex-start; }
.catalog-section { flex: 2; }
.cart-section { flex: 1; background: var(--vp-c-bg-soft); padding: 15px; border-radius: 8px; border: 1px solid var(--vp-c-divider); position: sticky; top: 80px; }
.section-title { margin-top: 0; font-size: 1.2rem; border-bottom: 1px solid var(--vp-c-divider); padding-bottom: 10px; }

.filter-area { margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.tag-btn { background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
.tag-btn:hover { border-color: #5b9e7b; }
.tag-btn.active { background: #5b9e7b; color: #fff; border-color: #5b9e7b; }
.clear-btn { font-size: 0.85rem; color: #888; text-decoration: underline; cursor: pointer; background: none; border: none; }

.product-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--vp-c-divider); border-radius: 6px; margin-bottom: 10px; background: var(--vp-c-bg); }
.p-name { font-weight: bold; font-size: 1.1rem; color: var(--vp-c-text-1); margin-bottom: 4px; }
.p-desc { font-size: 0.85rem; color: var(--vp-c-text-2); margin-bottom: 10px; line-height: 1.4; }
.p-tags { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.p-tag { font-size: 0.75rem; background: var(--vp-c-bg-soft); padding: 2px 6px; border-radius: 4px; color: var(--vp-c-text-2); }
.category-tag { border: 1px solid #5b9e7b; color: #5b9e7b; background: transparent; }
.cap-tag { background: #3d4f45; color: #a4d8bd; }

/* 胶囊标签特效 CSS */
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
.empty-cart { color: var(--vp-c-text-3); font-size: 0.9rem; text-align: center; padding: 20px 0; }

@media (max-width: 768px) {
  .shop-container { flex-direction: column; }
  .cart-section { width: 100%; position: static; }
}
</style>
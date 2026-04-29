---
layout: page  # 【魔法开关】：这会让页面变成全屏无侧边栏的沉浸模式！
title: 黑市采购终端
---

<script setup>
// 因为在根目录，所以只需要进 .vitepress 就行
// import ShopTerminal from './.vitepress/theme/ShopTerminal.vue'
// import { equipments } from './.vitepress/theme/equipmentData.js'

// 如果你以后有了 weaponData.js，也可以在这里一起 import
// import { weapons } from './.vitepress/theme/weaponData.js'
// const allGoods = [...equipments, ...weapons] // 把所有货源拼在一起！
</script>

# 💱 万神都黑市交易网

欢迎访问地下链路。请规划您的资金，所有交易一经确认概不退换。

<div style="margin-top: 2rem;">
  <ShopTerminal :goods="equipments" shopTitle="全品类物资调度中心" />
</div>
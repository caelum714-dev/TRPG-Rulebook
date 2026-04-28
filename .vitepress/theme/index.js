// .vitepress/theme/index.js

// 1. 引入 VitePress 官方的默认主题
import DefaultTheme from 'vitepress/theme'

// 2. 引入你自己的 CSS 样式文件（名字要和第三步建的文件名一致）
import './style.css' 

// 引入 Vue 和 VitePress 的相关 API，用于写页面逻辑
import { watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'

export default {
  // 继承官方主题（保留官方的导航栏、侧边栏等一切好用的东西）
  extends: DefaultTheme, 

  // setup() 函数会在每次页面加载时执行
  setup() {
    const route = useRoute()

    // 自动展开折叠面板的逻辑
    const autoOpenDetails = () => {
      if (typeof window === 'undefined') return 
      
      const hash = decodeURIComponent(window.location.hash)
      if (!hash) return

      setTimeout(() => {
        try {
          const targetElement = document.querySelector(hash)
          if (targetElement) {
            const parentDetails = targetElement.closest('details')
            if (parentDetails && !parentDetails.hasAttribute('open')) {
              parentDetails.setAttribute('open', '')
            }
          }
        } catch (error) {
          // 忽略查询选择器错误
        }
      }, 150)
    }

    // 页面初次加载时执行
    onMounted(() => {
      autoOpenDetails() 
    })

    // 页面内路由（点击链接/搜索）变化时执行
    watch(
      () => route.path + route.hash, 
      () => autoOpenDetails()
    )
  }
}
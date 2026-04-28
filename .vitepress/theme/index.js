import DefaultTheme from 'vitepress/theme'
import { watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import './style.css' // 确保这里是你真实的 css 文件名

export default {
  extends: DefaultTheme,
  
  setup() {
    const route = useRoute()

    const autoOpenDetails = () => {
      if (typeof window === 'undefined') return 
      
      const hash = decodeURIComponent(window.location.hash)
      if (!hash) return

      // 【修改1】把延迟调大到 300ms，确保搜索弹窗完全关闭、Vue 渲染完毕
      setTimeout(() => {
        try {
          const id = hash.slice(1)
          const targetElement = document.getElementById(id)
          
          if (targetElement) {
            // 【核心修改】：开启“剥洋葱”模式，向上遍历并打开所有层级的 details
            let currentElement = targetElement;
            
            while (currentElement) {
              const parentDetails = currentElement.closest('details')
              
              if (parentDetails) {
                // 如果找到了 details，且没打开，就打开它
                if (!parentDetails.hasAttribute('open')) {
                  parentDetails.setAttribute('open', '')
                }
                // 把起点移到这个 details 的外面，继续向更外层寻找
                currentElement = parentDetails.parentElement
              } else {
                // 如果找不到更多的 details 了，说明已经到了最外层，跳出循环
                break 
              }
            }
            
            // 等所有“俄罗斯套娃”都被打开后，再执行平滑滚动！
            setTimeout(() => {
               targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 50) 
          }
        } catch (error) {
          console.warn("自动展开面板时发生小错误:", error)
        }
      }, 300) 
      
      // ... 后面的代码保持不变 ...
    }

    onMounted(() => {
      autoOpenDetails() 
    })

    watch(
      () => route.path + route.hash, 
      () => autoOpenDetails()
    )
  }
}
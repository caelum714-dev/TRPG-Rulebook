import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "蜃都群屿规则书",
  description: "我受够了word文档！",
  themeConfig: {
    // 顶部导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '规则书', link: '/rules/standard-attributes' }
    ],

    // 左侧侧边栏
    sidebar: [
      {
        text: '📖 角色创建',
        items: [
          { text: '本格属性', link: '/rules/standard-attributes' },
          { text: '多维自我 (ALTER EGO, 被动能力)', link: '/rules/alter-ego' },
          { text: '数值属性', link: '/rules/numerical-attributes' },
          { text: '理念等级', link: '/rules/character-level' }

        ]
      }
    ],

    // 右上角的社交链接（不想显示可以把这块删掉，但要保留括号）
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
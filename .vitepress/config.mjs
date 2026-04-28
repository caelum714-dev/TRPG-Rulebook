import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "蜃都群屿规则书",
  description: "我受够了word文档！",
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        _renderDetailedResults: true,
        miniSearch: {
      searchOptions: {
        combineWith: 'AND' // 将默认的 OR 组合逻辑改成 AND（必须同时包含）
      }
    },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索规则书...',
                buttonAriaLabel: '搜索规则书'
              },
              modal: {
                noResultsText: '未找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    
    nav: [
      { text: '首页', link: '/' },
      { text: '规则书', link: '/rules/based-rule/index' }
    ],

    // 左侧侧边栏
    sidebar: [
      {
        text: '📖 角色创建',
        collapsed: false, // 装备大类默认展开
        items: [
          { text: '本格属性', link: '/rules/based-rule/standard-attributes' },
          { text: '多维自我 (ALTER EGO, 被动能力)', link: '/rules/based-rule/alter-ego' },
          { text: '数值属性', link: '/rules/based-rule/numerical-attributes' },
          { text: '理念等级', link: '/rules/based-rule/character-level' }
        ] 
      },

      {   
        text: '📦 装备书',
        collapsed: false, // 装备大类默认展开
        items: [
          { text: '装备使用须知', link: '/rules/equipment/index' },
          {
            text: '🗡️ 武器书 (按类型分类)',
            collapsed: true, // 
            items: [
              { text: '导言', link: '/rules/equipment/weapons/index'},
              { text: '自赋能兵械', link: '/rules/equipment/weapons/weaponsZF'},
              { text: '动能兵械', link: '/rules/equipment/weapons/weaponsDN' },
              { text: '自导器', link: '/rules/equipment/weapons/daoqiZD' },
              { text: '导器', link: '/rules/equipment/weapons/daoqi' },
              { text: '祭器', link: '/rules/equipment/weapons/JiQi' },
            ]
          },
          {
            text: '🛡️ 防具库',
            link: '/rules/equipment/armors'
          }
        ]
      },
      
      {
        text: '🗺️ 地理志',
        collapsed: false, // 地理大类默认展开
        items: [
          { text: '地理志总览', link: '/rules/geography/index' },
          { text: '上层区', link: '/rules/geography/upper-zone' },
          { text: '中层区', link: '/rules/geography/middle-zone' },
          { text: '下层区', link: '/rules/geography/lower-zone' },]
      }
    ],

    // 右上角的社交链接（不想显示可以把这块删掉，但要保留括号）
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
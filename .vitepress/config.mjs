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
        combineWith: 'AND' 
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
      { text: '规则书', link: '/rules/based-rule/index' },
      { text: '🛒 黑市终端', link: '/shop' }
    ],

    // 左侧侧边栏
    sidebar: [
      {
        text: '基础规则书',
        collapsed: false, // 装备大类默认展开
        items: [
          {
            text: '基础属性篇',
            collapsed: true, // 基础属性默认折叠
            items: [
              { text: '导言', link: '/rules/1.based-rule/1.character-attribute/'},
              { text: '本格属性', link: '/rules/1.based-rule/1.character-attribute/standard-attributes' },
              { text: '多维自我 (ALTER EGO, 被动能力)', link: '/rules/1.based-rule/1.character-attribute/alter-ego' },
              { text: '数值属性', link: '/rules/1.based-rule/1.character-attribute/numerical-attributes' },
              { text: '理念等级', link: '/rules/1.based-rule/1.character-attribute/character-level' },
            ]
          },

          { text: '属性检定篇', link: '/rules/1.based-rule/attributecheck' },
          {
            text: '战斗规则篇',
            collapsed: true, // 
            items: [
              { text: '导言', link: '/rules/1.based-rule/3.battle-rule/'},
              { text: '战斗流程', link: '/rules/1.based-rule/3.battle-rule/1.battle process'},
              { text: '基础回合规则', link: '/rules/1.based-rule/3.battle-rule/2.turn' },
              { text: '进攻手段', link: 'rules/1.based-rule/3.battle-rule/3.attack' },
              { text: '防御手段', link: '/rules/1.based-rule/3.battle-rule/4.defend' },
              { text: '特殊行动', link: '/rules/1.based-rule/3.battle-rule/5.special' },
              { text: '战斗距离', link: '/rules/1.based-rule/3.battle-rule/6.distence' },
            ]
          },
        ] 
      },

      {   
        text: ' 装备书',
        collapsed: false, 
        items: [
          {
            text: '🗡️ 武器书 (按类型分类)',
            collapsed: true, // 
            items: [
              { text: '装备使用须知', link: '/rules/2.equipment/weapons/'},
              { text: '自赋能兵械', link: '/rules/2.equipment/weapons/weaponsZF'},
              { text: '动能兵械', link: '/rules/2.equipment/weapons/weaponsDN' },
              { text: '自导器', link: '/rules/2.equipment/weapons/daoqiZD' },
              { text: '导器', link: '/rules/2.equipment/weapons/daoqi' },
              { text: '祭器', link: '/rules/2.equipment/weapons/JiQi' },
            ]
          },

          {
            text: '🛡️ 防具库',
            collapsed: true,
            items: [
              { text: '防具', link: '/rules/2.equipment/armors/armor'},
              { text: '护盾', link: '/rules/2.equipment/armors/shield' },
              { text: '背包', link: '/rules/2.equipment/armors/bag' },
            ]
          }
        ]
      },
      
      {
        text: '物品书',
        collapsed: false,
        items: [
          { text: '载具', link: '/rules/3.item/vehicleDN' }
        ]
      },

      {
        text: ' 地理志',
        collapsed: false, 
        items: [
          { text: '地理志总览', link: '/rules/4.geography/' },
          { text: '上层区', link: '/rules/4.geography/upper-zone' },
          { text: '中层区', link: '/rules/4.geography/middle-zone' },
          { text: '下层区', link: '/rules/4.geography/lower-zone' },]
      },

      {
        text: '经济系统',
        collapsed: false,
        items: [
          { text: '货币体系', link: '/rules/5.economy/currency' },
        ]
      }

    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
import { CaseScenario, RecordType, DatabaseRecord } from '../types';

const INITIAL_RECORD: DatabaseRecord = {
  id: 'SYS-TUTORIAL',
  type: RecordType.SYSTEM,
  title: '新手教程：消失的午餐',
  tags: ['教学', '简单'],
  accessLevel: 0,
  isInitial: true,
  unlockKeywords: [],
  content: `=== 模拟演练 ===
案发时间：1996年3月29日 12:30
地点：行天宫后二楼 [练团室]
受害人：贝斯手 玛莎

案情：
玛莎放在冰箱里的限定款“咸酥鸡”不翼而飞。
这是极其严重的挑衅行为。

目标：
1. 搜索并阅读 [练团室] 的档案。
2. 找出偷吃咸酥鸡的“凶手”。
`,
};

const RECORDS: DatabaseRecord[] = [
  INITIAL_RECORD,

  // --- 地点 ---
  {
    id: 'LOC_BREAKROOM',
    type: RecordType.LOCATION,
    title: '地点：练团室',
    tags: ['现场'],
    prerequisiteId: 'SYS-TUTORIAL',
    unlockKeywords: ['练团室', 'breakroom', 'room'],
    accessLevel: 1,
    content: `
      一个由 [漫画] 堆成的小录音室，墙角放着几把 [吉他]。
      
      冰箱门开着。
      桌子上有一个空的 [咸酥鸡盒子]。
      垃圾桶里有一张揉皱的 [购物小票]。
      
      当时只有主唱 [阿信] 在里面休息。
    `,
  },

  // --- 物品 (交互教学) ---
  {
    id: 'ITEM_BOX',
    type: RecordType.ITEM,
    title: '物品：咸酥鸡盒子',
    tags: ['证物', '指纹'],
    prerequisiteId: 'LOC_BREAKROOM',
    unlockKeywords: ['盒子', 'box', '甜甜圈'],
    accessLevel: 1,
    content: `
      只要几块碎屑的空盒子。
      
      表面看起来很干净，但也许上面留下了偷吃者的痕迹？
      如果有 [手电筒] 照一下就好了。
    `,
    // 交互教学：使用物品
    interaction: {
      type: 'use-item',
      requiredRecordId: 'ITEM_FLASHLIGHT',
      hintText: '肉眼看不出什么。试试拖入能显现痕迹的工具。',
      successMessage: '手电筒照射下，一枚清晰的指纹显现出来！',
      unlockedContent: `
        [指纹比对结果]
        指纹属于：阿信。
        
        这证明他在吃完后碰过盒子，并且试图擦掉痕迹（但没擦干净）。
      `
    }
  },
  
  {
    id: 'ITEM_FLASHLIGHT',
    type: RecordType.ITEM,
    title: '物品：手电筒',
    tags: ['工具'],
    prerequisiteId: 'P_WANG', // 从嫌疑人身上搜到
    unlockKeywords: ['手电筒', 'light'],
    accessLevel: 1,
    content: `
      从练团室找到的手电筒。
      可以用来检测指纹和液体残留。
    `,
  },

  // --- 嫌疑人 ---
  {
    id: 'P_WANG',
    type: RecordType.SUSPECT,
    title: '嫌疑人：阿信',
    tags: ['主唱'],
    prerequisiteId: 'LOC_BREAKROOM',
    unlockKeywords: ['阿信', '主唱', 'ashin'],
    accessLevel: 1,
    content: `
      正在角落里拼 [乐高] 的主唱。
      嘴角似乎有一点油渍。
      
      随身携带：[手电筒]。
    `,
    crossExamination: [
      {
        triggerRecordId: 'DEFAULT',
        topic: '基本口供',
        content: '"咸酥鸡？我没见唉！我在减肥，只吃沙拉。不信你去翻垃圾桶里的 [购物小票]。"'
      },
      {
        triggerRecordId: 'ITEM_BOX', // 当指纹被发现后（盒子被解锁）
        topic: '关于：盒子上的指纹',
        content: '"(满头大汗) 那个... 我只是帮忙扔盒子！我真的没吃！我发四！"'
      }
    ]
  },

  // --- 动机 ---
  {
    id: 'DOC_RECEIPT',
    type: RecordType.DOC,
    title: '档案：购物小票',
    tags: ['动机'],
    prerequisiteId: 'LOC_BREAKROOM',
    unlockKeywords: ['小票', 'receipt', '购物单'],
    accessLevel: 1,
    content: `
      垃圾桶里的小票。
      
      内容：
      - 蔬菜沙拉 x1
      - 无糖苏打水 x1
      
      备注：
      购买时间是昨天。
      这意味着阿信今天中午可能根本没吃午饭，他处于极度饥饿状态。
    `,
  },

  // --- 隐藏彩蛋 (Easter Eggs) ---
  {
    id: 'EGG_5525',
    type: RecordType.EASTEREGG,
    title: '彩蛋：5525',
    tags: ['粉丝专属'],
    prerequisiteId: 'P_WANG', // Mentioned in P_WANG
    unlockKeywords: ['5525', '5526','5525+1'],
    accessLevel: 1,
    content: `
      少了你，我们就不是，五月天！
      
      (系统提示：恭喜发现隐藏彩蛋！这是一个与案件无关的冷知识。)
    `,
  }
];

export const case19960329: CaseScenario = {
  systemName: "泉天下最完美的阵容",
  caseId: "19960329",
  caseTitle: "新手教程：消失的午餐",
  isHidden: true, // 隐藏关卡
  initialRecord: INITIAL_RECORD,
  records: RECORDS,
  solution: {
    culpritId: 'P_WANG', // 阿信
    evidenceId: 'ITEM_BOX', // 盒子（上有指纹）
    motiveId: 'DOC_RECEIPT', // 饥饿/减肥
    validEvidenceIds: ['ITEM_BOX'], 
    validMotiveIds: ['DOC_RECEIPT'],
    explanation: "阿信因为节食减肥（动机：小票显示只吃沙拉），处于极度饥饿状态。他趁练团室无人偷吃了玛莎的咸酥鸡，并试图擦除痕迹。但他没想到利用随身的[手电筒]可以检测到他在[盒子]上残留的指纹（铁证）。嘴角的油渍也是佐证。",
    confession: `
(阿信放下了乐高，瘫倒在地上)

“好吧！是我吃的！

那个咸酥鸡的金黄色... 就在那里闪闪发光，像是在呼唤我。我已经吃了一周的草，我感觉自己快变成羊了。

我只是想闻一闻，真的。但是当我回过神来的时候，它已经... 消失了。

玛莎，再给我一次机会吧！”
    `
  }
};
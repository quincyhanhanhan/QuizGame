import { CaseScenario, RecordType, DatabaseRecord } from '../types';

/* 
  ========================================================================
  🕵️‍♂️ DetectiveOS 案件开发模版 v3.0 (全功能版)
  ========================================================================
  
  【如何使用】
  1. 复制此文件，重命名为 `case[你的案件名].ts` (例如: casePudding.ts)。
  2. 修改下方的 RECORDS 和 caseData。
  3. 在 `scenarios/registry.ts` 中引入你的新文件，并加入 `CASE_REGISTRY`。
  
  【核心概念】
  - prerequisiteId (前置ID): 只有当玩家获得了前置线索，才能搜索到当前线索。这构成了线索树。
  - unlockKeywords (搜索词): 玩家输入这些词时，如果满足前置条件，就会解锁该档案。
  - interaction (交互): 为档案添加“锁”。可以是密码锁，也可以是物品锁。
  - crossExamination (口供): 嫌疑人的对话系统，可根据获得的证物解锁新对话。
*/

// ==========================================
// 1. 初始档案 (进入系统即显示的简报)
// ==========================================

const INITIAL_RECORD_1: DatabaseRecord = {
  id: 'SYS-001',           // 【必填】唯一ID
  type: RecordType.SYSTEM, // 类型：系统通告
  title: '案件简报: 布丁失窃案', 
  tags: ['必读', '起始'],
  accessLevel: 0,
  isInitial: true,         // 【关键】标记为初始解锁，无需搜索
  unlockKeywords: [],      
  content: `=== 案情综述 ===
案发时间：今天中午 12:30
地点：公司公共休息室
受害人：程序员小李

案情：
小李放在冰箱里的限量版布丁被偷吃了。现场只剩下一个空勺子。
这是对程序员尊严的严重挑衅。

初步行动：
请调查 [休息室] 并询问相关人员。`,
};

const INITIAL_RECORD_2: DatabaseRecord = {
  id: 'SYS-002',
  type: RecordType.SYSTEM,
  title: '嫌疑人名单',
  tags: ['名单'],
  accessLevel: 0,
  isInitial: true,         // 支持多个初始档案
  unlockKeywords: [],
  content: `目前休息室附近只有两个人：
1. 产品经理 (PM)
2. 设计师 (Designer)`,
};

// ==========================================
// 2. 档案数据库 (所有线索)
// ==========================================

const RECORDS: DatabaseRecord[] = [
  // 必须包含上面定义的初始档案
  INITIAL_RECORD_1,
  INITIAL_RECORD_2,

  // --- 示例 A：地点与基础搜索 ---
  {
    id: 'LOC_BREAKROOM',
    type: RecordType.LOCATION,
    title: '地点：休息室',
    tags: ['现场'],
    // 【逻辑】只有看到 SYS-001 后，搜 "休息室" 才能解锁此条目
    prerequisiteId: 'SYS-001', 
    unlockKeywords: ['休息室', 'breakroom', '厨房'], 
    accessLevel: 1,
    content: `
      这里是案发现场。
      冰箱门半掩着。
      
      桌上有一个 [空盒子]。
      垃圾桶里有一张揉皱的 [小票]。
      角落里有一个上锁的 [储物柜]。
    `,
  },

  // --- 示例 B：密码锁交互 ---
  {
    id: 'ITEM_RECEIPT',
    type: RecordType.ITEM,
    title: '物品：购物小票',
    tags: ['线索'],
    prerequisiteId: 'LOC_BREAKROOM',
    unlockKeywords: ['小票', 'receipt', '纸'],
    accessLevel: 1,
    content: `
      一张便利店的电子小票二维码。
      系统提示：需要输入 4 位取件码才能查看详细购买记录。
      (提示：试试常见的默认密码，或者找找有没有写着数字的纸条)
    `,
    // 【交互：密码锁】
    interaction: {
      type: 'password',          
      correctPassword: '1234',   // 正确答案
      hintText: '请输入4位取件码', 
      successMessage: '验证通过，正在加载云端数据...',
      // 解锁后追加显示的内容：
      unlockedContent: `
        [已解锁详情]
        购买物品：
        1. 限量布丁 x1
        2. 特辣鸭脖 x1
        
        购买人：小李 (受害人)
      `
    }
  },

  // --- 示例 C：物品锁交互 (拖拽解锁) ---
  {
    id: 'LOC_LOCKER',
    type: RecordType.LOCATION, // 或 ITEM
    title: '设施：储物柜',
    tags: ['未解密'],
    prerequisiteId: 'LOC_BREAKROOM',
    unlockKeywords: ['储物柜', '柜子', 'locker'],
    accessLevel: 2,
    content: `
      属于产品经理的私人储物柜。
      挂着一把黄铜挂锁，无法直接打开。
    `,
    // 【交互：物品使用】
    interaction: {
      type: 'use-item',          
      requiredRecordId: 'ITEM_KEY', // 【必须】对应下方定义的钥匙ID
      hintText: '柜门紧锁。需要 [钥匙] 才能打开。',
      successMessage: '咔哒一声，锁开了。',
      unlockedContent: `
        柜子里放着一瓶胃药。
        说明书上写着："用于缓解食用辛辣食物后的胃痛。"
        
        (分析：有人刚吃了很辣的东西？)
      `
    }
  },

  // --- 示例 D：嫌疑人与动态口供 ---
  {
    id: 'P_PM',
    type: RecordType.SUSPECT,
    title: '嫌疑人：产品经理',
    tags: ['PM'],
    prerequisiteId: 'SYS-002',
    unlockKeywords: ['产品经理', 'PM', '经理'],
    // 【可选】支持图片 URL
    imageUrl: 'https://picsum.photos/200/200?random=10', 
    accessLevel: 1,
    content: `
      看起来脸色苍白，一直在喝水。
      口袋里似乎装着什么金属物件 ([钥匙])。
    `,
    // 【口供系统】
    crossExamination: [
      {
        triggerRecordId: 'DEFAULT', // 默认显示的口供
        topic: '基本口供',
        content: '"布丁？没看见。我一直在改需求，哪有空吃东西。"'
      },
      {
        triggerRecordId: 'LOC_LOCKER', // 【关键】只有当玩家解锁了 储物柜 后，才会出现此选项
        topic: '关于：胃药',
        content: '"(捂着肚子) 好吧... 我是吃了点辣的。但我没吃布丁！布丁是甜的！"'
      },
      {
        triggerRecordId: 'EVID_SPOON', // 当发现凶器勺子后
        topic: '关于：勺子',
        content: '"...那个勺子是我用来吃外卖的，怎么会在案发现场？这...这解释不清了啊。"'
      }
    ]
  },

  // 配合示例 C 的钥匙
  {
    id: 'ITEM_KEY',
    type: RecordType.ITEM,
    title: '物品：一串钥匙',
    tags: ['工具'],
    prerequisiteId: 'P_PM', // 从 PM 身上搜到
    unlockKeywords: ['钥匙', 'key'],
    accessLevel: 1,
    content: `从产品经理口袋里掉出来的钥匙。标签上写着 "Locker"。`,
  },

  // --- 示例 E：核心证物 ---
  {
    id: 'ITEM_BOX',
    type: RecordType.ITEM,
    title: '物品：空盒子',
    tags: ['痕迹'],
    prerequisiteId: 'LOC_BREAKROOM',
    unlockKeywords: ['盒子', 'box', '空盒'],
    accessLevel: 1,
    content: `布丁的包装盒。里面空空如也。`,
  },
  {
    id: 'EVID_SPOON',
    type: RecordType.EVIDENCE, // 标记为证物 (黄色)
    title: '证物：沾着辣油的勺子',
    tags: ['铁证'],
    prerequisiteId: 'ITEM_BOX', // 进一步检查盒子发现
    unlockKeywords: ['勺子', 'spoon'],
    accessLevel: 2,
    content: `
      在盒子底部发现的塑料勺子。
      
      异常点：
      勺子上没有布丁残留，反而沾满了红色的 [辣油]。
      
      推论：
      偷吃者可能刚吃完极辣的东西，甚至混淆了味觉。
    `,
  },
  
  // --- 示例 F：动机文档 ---
  {
    id: 'DOC_MOTIVE',
    type: RecordType.DOC,
    title: '档案：加班记录表',
    tags: ['动机'],
    prerequisiteId: 'SYS-002',
    unlockKeywords: ['加班', '记录', 'schedule'],
    accessLevel: 2,
    content: `
      记录显示：
      产品经理已经连续加班一周吃泡面了。
      他极度渴望一点“真正的食物”来慰藉心灵。
    `,
  }
];

// ==========================================
// 3. 结案配置 (Solution)
// ==========================================

export const templateCase: CaseScenario = {
  systemName: "案件开发模版 v3.0", // 顶部显示的系统名称
  caseId: "CASE-PUDDING",         // 启动页输入的 ID
  caseTitle: "消失的布丁案 (开发示例)",
  initialRecord: INITIAL_RECORD_1, // 必须与上面的初始档案变量一致
  records: RECORDS,
  
  isHidden: false, // 设为 true 则必须手动输入 ID 才能进入
  
  solution: {
    // 【判定逻辑】
    // 下面三个 ID 对应界面上三个槽位的正确填入值
    culpritId: 'P_PM',            // 真凶：产品经理
    
    // 支持数组：只要玩家填入数组中的任意一个 ID 就算对
    validEvidenceIds: ['EVID_SPOON'], // 铁证：沾辣油的勺子
    validMotiveIds: ['DOC_MOTIVE', 'LOC_LOCKER'], // 动机：加班饿了 / 胃药证明吃了辣
    
    // 【为了兼容旧代码，以下两个字段也必须填，填数组里的第一个即可】
    evidenceId: 'EVID_SPOON', 
    motiveId: 'DOC_MOTIVE',

    // 【结案陈词】
    explanation: "产品经理因为连续加班（动机），饥不择食偷吃了布丁。但他刚吃完特辣鸭脖（储物柜里的胃药佐证），导致味觉迟钝，并没有尝出布丁的味道，反而把鸭脖上的辣油沾到了勺子上（铁证），留下了决定性的证据。",
    
    // 【罪犯自白】 (可选，结案后弹窗显示)
    confession: `
(产品经理推了推眼镜，无奈地叹气)

“需求改了一万遍，我太饿了...

那一刻，冰箱里的布丁在发光。我刚啃完鸭脖，嘴里全是火，我以为布丁能救我的命。

结果吃下去全是辣味！我甚至没尝出它是限量的！

别抓我，需求文档还没写完...”
    `
  }
};
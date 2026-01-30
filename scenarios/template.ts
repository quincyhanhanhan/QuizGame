import { CaseScenario, RecordType, DatabaseRecord } from '../types';

/* 
  ===========================================
  🕵️‍♂️ 侦探终端 (DetectiveOS) 案件开发模版 v2.0
  ===========================================
  
  开发步骤:
  1. 复制此文件，重命名为 `case[你的案件名].ts` (例如: caseBankHeist.ts)。
  2. 在 `scenarios/registry.ts` 中引入你的新文件，并加入到 `CASE_REGISTRY` 中。
  3. 按照下方的注释填写档案数据。
*/

// ==========================================
// 1. 核心定义
// ==========================================

// 初始档案 - 玩家进入游戏后默认解锁的第一份文件
// * 技巧：你可以设置多份 `isInitial: true` 的档案，实现"多个案件简报"的效果。
const BRIEFING_RECORD_1: DatabaseRecord = {
  id: 'SYS-001',          // 【必填】唯一ID，用于系统内部索引
  type: RecordType.SYSTEM, // 类型：系统通告
  title: '简报 A: 报警记录', 
  tags: ['起始', '必读'],
  accessLevel: 0,
  isInitial: true,        // 【关键】标记为初始解锁
  unlockKeywords: [],     // 初始档案不需要关键词
  content: `=== 自动报警系统 ===
接警时间：2024-06-01 09:00
报案人：银行经理
事件：金库大门被非法开启，但现场无强行破坏痕迹。`,
};

const BRIEFING_RECORD_2: DatabaseRecord = {
  id: 'SYS-002',
  type: RecordType.SYSTEM,
  title: '简报 B: 嫌疑人列表',
  tags: ['嫌疑人'],
  accessLevel: 0,
  isInitial: true,        // 【关键】这是第二份初始解锁的简报
  unlockKeywords: [],
  content: `警方已控制以下相关人员，请侦探进行排查：
1. 大堂经理 (Manager)
2. 保安队长 (Security)`,
};

// ==========================================
// 2. 档案数据库 (所有可搜索线索)
// ==========================================

const RECORDS: DatabaseRecord[] = [
  // 必须包含上面定义的初始档案
  BRIEFING_RECORD_1,
  BRIEFING_RECORD_2,

  // --- 示例 A：普通地点档案 ---
  {
    id: 'LOC_VAULT',
    type: RecordType.LOCATION,
    title: '地点：地下金库',
    tags: ['案发现场'],
    
    // 【解锁逻辑】
    // 只有当 'SYS-001' 被解锁后，玩家搜 '金库' 才能找到这份档案。
    // 如果不填 prerequisiteId，则只要玩家猜到关键词就能搜到。
    prerequisiteId: 'SYS-001', 
    unlockKeywords: ['金库', 'vault', '地下室'], 
    
    accessLevel: 1,
    content: `金库大门敞开。里面的保险箱全部被清空。
地面上有一张被揉皱的 [纸条]。`,
  },

  // --- 示例 B：需要交互解锁的物品 (密码锁) ---
  {
    id: 'ITEM_PHONE',
    type: RecordType.ITEM,
    title: '物品：加密的手机',
    tags: ['证物'],
    prerequisiteId: 'LOC_VAULT',
    unlockKeywords: ['手机', 'phone', '移动设备'],
    accessLevel: 2,
    content: `这是在现场发现的一部黑色手机。屏幕上显示需要输入4位密码。
    
(提示：请在下方输入密码解锁)`,
    
    // 【交互逻辑 - 密码】
    interaction: {
      type: 'password',          // 类型：密码
      correctPassword: '1998',   // 正确答案
      hintText: '请输入4位数字密码 (提示：可能是某人的生日)', 
      successMessage: '解锁成功！正在读取短信记录...',
      unlockedContent: `
=== 短信记录 ===
"老板，货已经到手了。老地方见。"
"记得销毁证据。"
      `
    }
  },

  // --- 示例 C：需要交互解锁的物品 (拖入证物解锁) ---
  {
    id: 'LOC_SAFE',
    type: RecordType.LOCATION,
    title: '地点：经理办公室保险箱',
    tags: ['未解密'],
    prerequisiteId: 'SYS-002',
    unlockKeywords: ['保险箱', 'safe', 'office'],
    accessLevel: 2,
    content: `一个老式的机械保险箱。看起来需要某种特定的钥匙或卡片才能打开。`,

    // 【交互逻辑 - 物品使用】
    interaction: {
      type: 'use-item',          // 类型：使用物品
      requiredRecordId: 'ITEM_KEY', // 【必须】需要拖入的物品ID (假设你定义了一个ID为 ITEM_KEY 的物品)
      hintText: '保险箱已上锁。需要 [钥匙] 才能开启。',
      successMessage: '咔哒一声，保险箱开了。',
      unlockedContent: `
保险箱里只有一张照片，照片上是保安队长和劫匪的合影。
这证明他们是同伙！
      `
    }
  },

  // --- 示例 D：嫌疑人 (带动态证词) ---
  {
    id: 'P_MANAGER',
    type: RecordType.SUSPECT,
    title: '嫌疑人：大堂经理',
    tags: ['经理'],
    prerequisiteId: 'SYS-002',
    unlockKeywords: ['经理', 'manager', '大堂经理'],
    accessLevel: 1,
    content: `看起来很紧张，一直在擦汗。
"我...我当时在吃饭，什么都没看见。"`,
    
    // 【关联询问】
    // 当玩家获得了某些证据后，嫌疑人的档案会自动更新出新的对话
    crossExamination: [
      {
        triggerRecordId: 'ITEM_PHONE', // 当玩家解锁了 '手机' (ITEM_PHONE) 后
        topic: '关于：手机短信',
        content: '"好吧！那手机是我的...但我只是欠了赌债，我没想抢银行啊！"'
      }
    ]
  },
  
  // 假设的物品，用于示例C的解锁
  {
    id: 'ITEM_KEY',
    type: RecordType.ITEM,
    title: '物品：奇怪的钥匙',
    tags: ['钥匙'],
    prerequisiteId: 'P_MANAGER',
    unlockKeywords: ['钥匙', 'key'],
    accessLevel: 1,
    content: `从经理身上搜出的钥匙。不知道是开哪里的。`,
  }
];

// ==========================================
// 3. 结案配置 (Solution)
// ==========================================

export const templateCase: CaseScenario = {
  systemName: "案件开发模版 v2.0", // 页面顶部显示的系统名
  caseId: "CASE-TEMPLATE-V2",     // 在启动页输入的ID
  caseTitle: "银行金库失窃案 (开发示例)",
  initialRecord: BRIEFING_RECORD_1, // 虽然这里只填一个，但在 records 数组里把其他设为 isInitial: true 也可以
  records: RECORDS,
  
  solution: {
    // 下面三个 ID 对应 Accusation 页面三个槽位的正确答案
    culpritId: 'P_MANAGER',      // 凶手/主谋 ID
    evidenceId: 'ITEM_PHONE',    // 关键证据 ID (遗留代码，推荐使用 validEvidenceIds)
    motiveId: 'LOC_SAFE',        // 动机/关联档案 ID (遗留代码)
    
    // 允许的正确答案列表 (支持多解)
    validEvidenceIds: ['ITEM_PHONE', 'LOC_SAFE'], 
    validMotiveIds: ['LOC_SAFE', 'ITEM_KEY'],
    
    // 结案成功后显示的剧情文本
    explanation: "经理因为欠下巨额赌债（动机），勾结外人实施了盗窃。但他不小心遗落了手机（关键证据），暴露了通信记录，最终被警方识破。"
  }
};
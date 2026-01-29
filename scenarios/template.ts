import { CaseScenario, RecordType, DatabaseRecord } from '../types';

/* 
  === 案件模版说明 ===
  
  1. 复制此文件并重命名 (例如: caseNew01.ts)。
  2. 在 constants.ts 中引入你的新文件并将其赋值给 ACTIVE_CASE。
  3. 按照下方结构填写内容。
*/

// --- 初始记录 (玩家看到的第一份文件) ---
const INITIAL_RECORD: DatabaseRecord = {
  id: 'SYS-INIT', // 唯一ID
  type: RecordType.SYSTEM,
  title: '案件简报: [案件名称]',
  tags: ['起始'],
  accessLevel: 0,
  isInitial: true,
  unlockKeywords: [], // 初始记录不需要关键词
  content: `=== 案件简报 ===
案发时间：
地点：
受害人：

现场综述：
[在此处描述案发现场的基本情况...]

行动指南：
[提示玩家应该从哪里开始搜索，例如：建议搜索 '尸体' 或 '卧室']`,
};

// --- 档案列表 (所有可搜索的词条) ---
const RECORDS: DatabaseRecord[] = [
  INITIAL_RECORD,
  
  // 示例：地点
  /*
  {
    id: 'LOC_SCENE',
    type: RecordType.LOCATION,
    title: '地点：案发现场',
    tags: ['现场'],
    prerequisiteId: 'SYS-INIT', // 前置条件：必须先解锁 SYS-INIT 才能搜到这个（或者靠逻辑判断）
    unlockKeywords: ['现场', '卧室', 'living room'], // 玩家搜这些词会出这个档案
    accessLevel: 1,
    content: `房间很乱...`,
  },
  */

  // 示例：嫌疑人 (带动态证词)
  /*
  {
    id: 'P_SUSPECT_A',
    type: RecordType.SUSPECT,
    title: '嫌疑人：张三',
    tags: ['目击者'],
    prerequisiteId: 'LOC_SCENE',
    unlockKeywords: ['张三', 'zhang san'],
    accessLevel: 1,
    content: `我是无辜的...`,
    crossExamination: [
      {
        triggerRecordId: 'ITEM_WEAPON', // 当玩家解锁了 'ITEM_WEAPON' 后，此条目会出现
        topic: '关于：凶器',
        content: '好吧，那把刀确实是我的，但我只是用来切水果...'
      }
    ]
  },
  */
];

// --- 导出案件配置 ---
export const templateCase: CaseScenario = {
  systemName: "侦探终端 v1.0", // 顶栏显示的系统名称
  caseId: "CASE-TEMPLATE",
  caseTitle: "未命名案件",
  initialRecord: INITIAL_RECORD,
  records: RECORDS,
  solution: {
    culpritId: 'P_SUSPECT_ID', // 凶手的 Record ID
    evidenceId: 'EVID_MAIN_ID', // 主要证据 Record ID (用于向后兼容，主要用 validEvidenceIds)
    motiveId: 'DOC_MOTIVE_ID',  // 主要动机 Record ID (用于向后兼容)
    
    // 允许玩家提交的正确答案列表 (支持多解)
    validEvidenceIds: ['EVID_MAIN_ID', 'EVID_ALT_ID'], 
    validMotiveIds: ['DOC_MOTIVE_ID'],
    
    // 结案成功后显示的复盘文本
    explanation: "凶手是... 因为... 证据是..."
  }
};
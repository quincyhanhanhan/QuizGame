import { CaseScenario, RecordType, DatabaseRecord } from '../types';

const INITIAL_RECORD: DatabaseRecord = {
  id: 'SYS-001',
  type: RecordType.SYSTEM,
  title: '案件简报: CASE-X92',
  tags: ['起始', '必读'],
  accessLevel: 0,
  isInitial: true,
  unlockKeywords: [],
  content: `=== 案件简报 ===
案发时间：2024年5月14日 22:30
地点：[深蓝大厦42层] CEO办公室
受害人：[郭峰] (45岁, 创始人)

现场综述：
警方接到自动报警后赶到现场，发现郭峰趴在办公桌上已确认死亡。
现场门窗完好，无强行闯入痕迹。
案发时大楼高层区域已被封锁，仅有少数人员拥有权限。

初步行动指南：
建议侦探先对 [深蓝大厦42层] 进行详细检索，并调查受害人 [郭峰] 的背景。`,
};

const RECORDS: DatabaseRecord[] = [
  INITIAL_RECORD,
  
  // --- LOCATIONS ---
  {
    id: 'LOC_42F',
    type: RecordType.LOCATION,
    title: '地点：42层 CEO办公室',
    tags: ['现场', '案发地'],
    prerequisiteId: 'SYS-001',
    unlockKeywords: ['42层', '42F', '办公室', 'CEO办公室', '案发现场', 'office'],
    accessLevel: 1,
    content: `
      区域描述：
      郭峰的私人办公室，空间开阔，拥有独立的新风系统。
      
      现场勘查重点：
      1. 办公桌：桌面上有一杯喝了一半的 [威士忌]、一支 [钢笔]，以及一台锁定的 [平板] 电脑。
      2. 抽屉：半开着，里面似乎有一张 [门禁卡]。
      3. 设施：房间角落有一个隐蔽的 [通风管道] 检修口。
      4. 门禁记录：案发前一小时内，只有秘书 [林雅] 进入过该房间。
    `,
  },
  {
    id: 'LOC_41F',
    type: RecordType.LOCATION,
    title: '地点：41层 服务器机房',
    tags: ['机房', '设施'],
    prerequisiteId: 'SYS-001', 
    unlockKeywords: ['41层', '41F', '机房', '服务器', 'server room'],
    accessLevel: 2,
    content: `
      区域描述：
      放置公司核心服务器的恒温机房。噪音巨大，通常无人值守。
      
      人员踪迹：
      CTO [陈默] 声称案发时他正独自在此处维护系统。
      
      设施检查：
      机房中央有一台主 [控制台] (Terminal)，屏幕上闪烁着红色的安全警告。
    `,
  },

  // --- INTERACTIVE ITEMS (NEW) ---
  {
    id: 'ITEM_TABLET',
    type: RecordType.ITEM,
    title: '物品：郭峰的平板',
    tags: ['私人物品', '加密'],
    prerequisiteId: 'LOC_42F',
    unlockKeywords: ['平板', '电脑', 'tablet', 'ipad'],
    accessLevel: 1,
    content: `
      放在办公桌上的iPad Pro。屏幕亮着，显示系统已锁定。
      
      屏幕提示：
      "请输入4位PIN码。提示：深蓝项目启动日 (MMDD)"
      (你记得案件简报中提到的案发日期 5月14日 似乎就是这一天)
    `,
    interaction: {
      type: 'password',
      correctPassword: '0514',
      hintText: '请输入4位数字 (MMDD)',
      successMessage: '访问权限已获取，正在加载备忘录...',
      unlockedContent: `
      === 备忘录：Project DeepBlue ===
      状态：试验阶段
      
      5月1日：河豚毒素提取顺利，纯度极高。
      5月10日：陈默那个懦夫又来阻止我，他不懂这是为了人类进化！
      5月14日：今天就是启动日。没有什么能阻挡我。
      
      (获得了新关键词：深蓝项目, DeepBlue, 试验)
      `
    }
  },
  {
    id: 'ITEM_ID_CARD',
    type: RecordType.ITEM,
    title: '物品：CEO门禁卡',
    tags: ['钥匙'],
    prerequisiteId: 'LOC_42F',
    unlockKeywords: ['门禁卡', 'ID卡', '卡片', 'card'],
    accessLevel: 1,
    content: `在抽屉夹层发现的磁卡，印有郭峰的照片和 "LEVEL 5 ACCESS" (最高权限) 字样。`
  },
  {
    id: 'LOC_TERMINAL',
    type: RecordType.LOCATION, 
    title: '设施：机房控制台',
    tags: ['未授权', '锁'],
    prerequisiteId: 'LOC_41F',
    unlockKeywords: ['控制台', '终端', 'terminal', 'computer'],
    accessLevel: 2,
    content: `
      机房的主控电脑。屏幕显示 "仅限管理员访问"。
      需要刷入管理员级别的 [门禁卡] 才能查看系统日志。
    `,
    interaction: {
      type: 'use-item',
      requiredRecordId: 'ITEM_ID_CARD',
      hintText: '系统已锁定。请刷入管理员ID卡 (将门禁卡拖入此处)。',
      successMessage: '身份验证通过。正在导出关键时间段日志...',
      unlockedContent: `
        [系统日志 - 2024-05-14]
        
        22:15:00 > 警告：冷却风扇系统被手动关闭 (操作员: Root/ChenMo)
        22:25:00 > 冷却风扇系统重新启动
        
        分析：
        风扇关闭会导致机房噪音骤减，且停止空气对流。这可能是为了掩盖在该时间段内爬行 [通风管道] 产生的声音。
      `
    }
  },

  // --- PEOPLE ---
  {
    id: 'P_GUO',
    type: RecordType.DOC,
    title: '档案：郭峰 (受害人)',
    tags: ['死者', 'CEO'],
    prerequisiteId: 'SYS-001',
    unlockKeywords: ['郭峰', 'Guo Feng', '死者', '受害人', '老板'],
    accessLevel: 1,
    content: `
      身份：深蓝科技创始人兼CEO。
      
      近期状况：
      极度痴迷于脑机接口研究。
      
      人际关系：
      - 与CTO [陈默] 因技术理念不合，关系已破裂。
      - 与秘书 [林雅] 存在金钱纠纷。
    `,
  },
  {
    id: 'P_LIN',
    type: RecordType.SUSPECT,
    title: '嫌疑人：林雅',
    tags: ['秘书', '第一发现人'],
    prerequisiteId: 'LOC_42F', // Found from Office log
    unlockKeywords: ['林雅', 'Lin Ya', '秘书', '助理'],
    imageUrl: 'https://picsum.photos/200/200?random=2',
    accessLevel: 1,
    content: `
      身份：郭峰的行政秘书，负责安排行程和生活起居。
      
      基本证词：
      "我真的什么都不知道！我只是按惯例给他送了酒进去，然后就去茶水间了。"
    `,
    crossExamination: [
      {
        triggerRecordId: 'ITEM_WHISKEY',
        topic: '关于：威士忌',
        content: '"是的，那杯威士忌是我倒的。酒瓶就在柜子里，谁都能拿到。我倒酒的时候他还在打电话骂人。我绝对没有下毒！"'
      },
      {
        triggerRecordId: 'P_GUO',
        topic: '关于：债务问题',
        content: '"...既然你们都查到了。没错，我欠了高利贷，求郭总借我钱，但他拒绝了。但我没必要杀他啊，杀了他我找谁要钱去？"'
      }
    ]
  },
  {
    id: 'P_CHEN',
    type: RecordType.SUSPECT,
    title: '嫌疑人：陈默',
    tags: ['CTO', '合伙人'],
    prerequisiteId: 'SYS-001', // Can be found via search easily
    unlockKeywords: ['陈默', 'Chen Mo', 'CTO', '技术官'],
    imageUrl: 'https://picsum.photos/200/200?random=1',
    accessLevel: 2,
    content: `
      身份：公司联合创始人，技术天才。
      
      基本证词：
      "郭峰是个疯子，但他死了对公司是损失。案发时我在41层机房修服务器，根本没上过42层。你们可以查监控。"
    `,
    crossExamination: [
      {
        triggerRecordId: 'DOC_PROJECT',
        topic: '关于：深蓝项目',
        content: '"那个项目必须被停止！他在用活人做实验！我警告过他无数次... 但我通过董事会弹劾他就行了，没必要杀人。"'
      },
      {
        triggerRecordId: 'LOC_VENT',
        topic: '关于：通风管道',
        content: '"(眼神闪烁) 通风管道？大厦结构图确实显示机房和楼上是通的...但这能说明什么？我是个写代码的，又不是特工，难道我还能爬管道不成？"'
      },
      {
        triggerRecordId: 'EVID_HANDKERCHIEF',
        topic: '关于：沾油的手帕',
        content: '"...... 那条手帕确实是我的。我... 我那天在机房擦汗丢了。至于为什么会出现在管道里，还要沾上毒... 我无法解释。但我没有杀人！"'
      }
    ]
  },

  // --- ITEMS & EVIDENCE ---
  {
    id: 'ITEM_WHISKEY',
    type: RecordType.ITEM,
    title: '物品：威士忌酒杯',
    tags: ['载体'],
    prerequisiteId: 'LOC_42F',
    unlockKeywords: ['威士忌', '酒杯', '酒', 'Whiskey', 'Glass'],
    accessLevel: 1,
    content: `
      物品描述：
      一个昂贵的水晶杯，残留着少量威士忌。
      
      化验结果：
      酒液中无毒。但在 **杯口边缘** 检测到高浓度的 [河豚毒素]。
      推测凶手将毒药涂抹在了杯沿上。
    `,
  },
  {
    id: 'ITEM_PEN',
    type: RecordType.ITEM,
    title: '物品：钢笔',
    tags: ['私人物品'],
    prerequisiteId: 'LOC_42F',
    unlockKeywords: ['钢笔', '笔', 'Pen'],
    accessLevel: 1,
    content: `
      物品描述：
      一支定制的万宝龙钢笔，笔尖已经干涸。
      郭峰死时手里紧紧攥着它。
      
      指纹提取：
      只有郭峰本人的指纹。
    `,
  },
  {
    id: 'LOC_VENT',
    type: RecordType.LOCATION,
    title: '地点：通风管道',
    tags: ['通道', '隐蔽'],
    prerequisiteId: 'LOC_42F',
    unlockKeywords: ['通风管道', '排气口', '管道', 'vent', 'duct'],
    accessLevel: 2,
    content: `
      勘查记录：
      连接42层CEO室与41层机房的空气循环管道。
      管道内壁有明显的剐蹭痕迹，灰尘被扰动，说明近期有人从中爬过。
      
      在管道中部发现了一件遗落物：[手帕]。
    `,
  },
  {
    id: 'EVID_HANDKERCHIEF',
    type: RecordType.EVIDENCE,
    title: '证物：被遗弃的手帕',
    tags: ['铁证'],
    prerequisiteId: 'LOC_VENT',
    unlockKeywords: ['手帕', '布', 'handkerchief'],
    accessLevel: 3,
    content: `
      物品描述：
      一条男士格纹手帕，被团成一团塞在管道缝隙里。
      
      痕迹分析：
      1. 沾有大量黑色机油（与41层机房设备的润滑油成分一致）。
      2. 检测到 [河豚毒素] 残留。
      3. 角落绣有姓名缩写： "C.M."。
    `,
  },
  
  // --- DOCUMENTS ---
  {
    id: 'DOC_PROJECT',
    type: RecordType.DOC,
    title: '文件：深蓝项目 (Project DeepBlue)',
    tags: ['机密', '动机'],
    prerequisiteId: 'ITEM_TABLET', // Unlocked via Tablet content keywords primarily
    unlockKeywords: ['深蓝项目', '深蓝计划', 'Project DeepBlue', 'DeepBlue'],
    accessLevel: 3,
    content: `
      加密等级：绝密
      
      项目摘要：
      利用神经毒素（主要成分为 [河豚毒素]）刺激大脑皮层，试图强行突破人脑算力限制。
      
      备注：
      该项目不仅非法，且极其危险。CTO [陈默] 曾多次发邮件威胁要向警方举报该项目。
    `,
  },
  {
    id: 'DOC_TOXIN',
    type: RecordType.AUTOPSY,
    title: '科普：河豚毒素',
    tags: ['毒药'],
    prerequisiteId: 'ITEM_WHISKEY', // Found from Whiskey analysis
    unlockKeywords: ['河豚毒素', '毒药', '毒素', 'toxin', 'poison'],
    accessLevel: 2,
    content: `
      毒理学报告：
      一种强效神经毒素。
      
      来源追踪：
      公司采购记录显示，郭峰以上市研发名义，在一个月前批准购入了一批高纯度河豚毒素用于 [深蓝项目]。
      这批毒素存放在41层机房的保险柜里，只有郭峰和陈默有钥匙。
    `,
  }
];

export const caseX92: CaseScenario = {
  systemName: "天网档案系统 (SkyNet Archives) v5.0",
  caseId: "MD20240902",
  caseTitle: "深蓝大厦CEO毒杀案",
  initialRecord: INITIAL_RECORD,
  records: RECORDS,
  solution: {
    culpritId: 'P_CHEN', // 陈默
    evidenceId: 'EVID_HANDKERCHIEF', // 手帕
    motiveId: 'DOC_PROJECT', // 深蓝项目
    validEvidenceIds: ['EVID_HANDKERCHIEF'], 
    validMotiveIds: ['DOC_PROJECT'],
    explanation: "陈默利用维护服务器的便利，在22:15关闭风扇系统掩盖声音，通过[通风管道]从41层爬至42层。他利用对[深蓝项目]中[河豚毒素]的接触权限获取毒药，并涂抹在郭峰的酒杯口。他在爬回管道时遗落了沾有机油和毒素的[手帕]，这成为了铁证。"
  }
};
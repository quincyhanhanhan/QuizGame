import { CaseScenario, RecordType, DatabaseRecord } from '../types';

const INITIAL_RECORD: DatabaseRecord = {
  id: 'SYS-START',
  type: RecordType.SYSTEM,
  title: '案情综述 (MD20230401)',
  tags: ['起始', '必读'],
  accessLevel: 0,
  isInitial: true,
  unlockKeywords: [],
  content: `=== 案件简报 ===
【编号】 MD20230401
【标题】 玻璃后的盲点
【时间】 2023年4月1日 20:45
【地点】 临江市公安局·旧北区办公楼（拆迁待定中）
【天气】 台风“黑格比”过境，特大暴雨

案发经过：
旧办公楼即将废弃，仅剩少量人员留守。
20:45，实习警员 [陈宇] 发现副局长赵卫民在办公室内死亡。
门窗紧闭，初步判断为密室杀人。
现场充斥着一股淡淡的酸味。

初步行动：
请先询问第一发现人 [陈宇] 或查看 [法医] 报告。`,
};

const RECORDS: DatabaseRecord[] = [
  INITIAL_RECORD,

  // --- 1. 核心现场 ---
  {
    id: 'LOC_OFFICE',
    type: RecordType.LOCATION,
    title: '地点：局长办公室',
    tags: ['现场', '酸味'],
    prerequisiteId: 'SYS-START',
    unlockKeywords: ['办公室', '现场', 'office', '301'],
    accessLevel: 1,
    content: `
      环境：
      老旧办公楼的独立房间，到处积满灰尘。
      
      气味：
      房间内有一股极淡的、类似醋酸（酸味）的味道。
      
      出口：
      唯一的出口是一扇 [木门]，侧面有一扇通向走廊的 [窗户]。
    `,
  },
  {
    id: 'BODY_ZHAO',
    type: RecordType.ITEM,
    title: '物品：赵局的尸体',
    tags: ['死者'],
    prerequisiteId: 'LOC_OFFICE',
    unlockKeywords: ['尸体', '死者', 'body', 'victim'],
    accessLevel: 1,
    content: `
      死者状态：
      腹部中刀，死不瞑目。衣着整齐。
      
      随身物品：
      - 右侧裤兜里鼓鼓囊囊，搜出了 [钥匙串]。
      - 左侧口袋有一部 [手机]。
      - 腹部插着一把 [匕首]。
      
      (可检索: "赵卫民" 查看详细背景)
    `,
  },
  {
    id: 'P_ZHAO',
    type: RecordType.DOC,
    title: '档案：赵卫民 (受害人)',
    tags: ['背景'],
    prerequisiteId: 'BODY_ZHAO',
    unlockKeywords: ['赵卫民', '局长', '受害人', 'zhao'],
    accessLevel: 1,
    content: `
      身份：
      临江市公安局副局长，分管后勤与财务。
      
      评价：
      风评极差。据传利用职权在旧楼拆迁项目中捞取油水，并且私生活作风有问题。
      最近似乎正在针对内勤部门进行“合规审计”。
    `,
  },
  {
    id: 'ITEM_DAGGER',
    type: RecordType.EVIDENCE,
    title: '物品：凶器匕首',
    tags: ['凶器'],
    prerequisiteId: 'BODY_ZHAO',
    unlockKeywords: ['匕首', '刀', 'knife', 'dagger'],
    accessLevel: 1,
    content: `
      一把制式警用匕首，深深插入死者腹部。
      刀柄上被擦拭得很干净，没有指纹。
      这是一把没有刀鞘的刀。
    `,
  },

  // --- 2. 密室构成 ---
  {
    id: 'LOC_DOOR',
    type: RecordType.LOCATION,
    title: '物件：木门',
    tags: ['门锁'],
    prerequisiteId: 'LOC_OFFICE',
    unlockKeywords: ['木门', '门', 'door'],
    accessLevel: 1,
    content: `
      结构：
      实木门，略显陈旧。装有老式 [球形锁]。
      
      观察窗：
      门扇上方有一块长方形的观察窗 [玻璃]。
      
      状态：
      门锁完好，案发时处于锁闭状态。
      撞击导致门框边缘有轻微裂痕，但锁舌依然紧扣。
    `,
  },
  {
    id: 'INFO_LOCK',
    type: RecordType.DOC,
    title: '科普：球形锁结构',
    tags: ['机械'],
    prerequisiteId: 'LOC_DOOR',
    unlockKeywords: ['球形锁', '锁结构', 'lock mechanism'],
    accessLevel: 1,
    content: `
      型号：Type-80 老式球形门锁。
      
      闭锁机制：
      - 内侧：把手上有一个圆形按钮。按下按钮后，外侧把手即被锁定空转。
      - 外侧：只能使用钥匙开启，或者从内部转动把手解锁。
      
      结论：
      这种锁如果从外部没有钥匙，想锁上门通常需要有人在里面按下按钮并拉上门（这会把自己锁在里面）。
      或者... 利用某种机械机关？
    `,
  },
  {
    id: 'LOC_WINDOW',
    type: RecordType.LOCATION,
    title: '物件：侧面窗户',
    tags: ['百叶窗'],
    prerequisiteId: 'LOC_OFFICE',
    unlockKeywords: ['窗户', '百叶窗', 'window'],
    accessLevel: 1,
    content: `
      通向走廊的窗户。
      
      状态：
      案发时百叶窗是拉下的（处于闭合状态）。
      从内部插上了插销，玻璃完好无损，积满灰尘。
    `,
  },
  {
    id: 'ITEM_KEYS',
    type: RecordType.ITEM,
    title: '物品：钥匙串',
    tags: ['关键物品'],
    prerequisiteId: 'BODY_ZHAO',
    unlockKeywords: ['钥匙', 'key', 'keys'],
    accessLevel: 1,
    content: `
      从死者裤兜搜出的钥匙串。
      经测试，只能从外部打开这扇木门。
      
      结论：
      证实案发时门是锁死的，且钥匙在死者身上，形成了密室。
    `,
  },

  // --- 3. 现场细节 & 密码谜题 ---
  {
    id: 'ITEM_CALENDAR',
    type: RecordType.ITEM,
    title: '物件：办公桌日历',
    tags: ['线索'],
    prerequisiteId: 'LOC_OFFICE',
    unlockKeywords: ['日历', '日期', 'calendar', 'date'],
    accessLevel: 1,
    content: `
      桌上的台历。
      今天的日期被红笔圈了出来。
      这似乎是个特殊的日子。
    `,
  },
  {
    id: 'ITEM_PHONE',
    type: RecordType.ITEM,
    title: '物品：赵局的手机',
    tags: ['加密'],
    prerequisiteId: 'BODY_ZHAO',
    unlockKeywords: ['手机', 'phone', 'mobile'],
    accessLevel: 2,
    content: `
      最新款智能手机，设置了4位数字密码。
      屏幕上有多次指纹解锁失败的痕迹。
      
      提示：需要密码才能查看内容。
    `,
    interaction: {
      type: 'password',
      correctPassword: '0401',
      hintText: '请输入4位数字密码 (提示：桌面上可能有相关记录)',
      successMessage: '解锁成功。正在导出隐藏文件夹...',
      unlockedContent: `
        [已解锁内容]
        
        1. 文件夹 "卷宗":
           里面是一张 [内部审计通知书] 的草稿照片。
           
        2. [短信记录]:
           最后一条未发出的草稿。
      `
    }
  },
  {
    id: 'DOC_AUDIT',
    type: RecordType.DOC,
    title: '档案：内部审计通知书',
    tags: ['动机'],
    prerequisiteId: 'ITEM_PHONE', // Unlocked via interaction
    unlockKeywords: ['审计', '通知书', 'audit'],
    accessLevel: 3,
    content: `
      照片内容：
      赵局已经掌握了某人挪用公款的铁证，并准备第二天提交审计局。
      
      被举报人姓名栏写着：刘雨薇 (内勤)。
    `,
  },
  {
    id: 'DATA_SMS',
    type: RecordType.DOC,
    title: '档案：短信记录',
    tags: ['动机'],
    prerequisiteId: 'ITEM_PHONE', // Unlocked via interaction
    unlockKeywords: ['短信', 'sms', 'message'],
    accessLevel: 2,
    content: `
      赵局手机里的最后一条未发出短信：
      “我知道是你拿了钱，今晚来我办公室，如果你愿意……我可以考虑放过你。”
      
      分析：
      这暗示了赵局对刘雨薇存在性胁迫意图。
    `,
  },
  {
    id: 'ITEM_TRASH',
    type: RecordType.ITEM,
    title: '物品：垃圾桶',
    tags: ['痕迹'],
    prerequisiteId: 'LOC_OFFICE',
    unlockKeywords: ['垃圾桶', 'trash', 'bin'],
    accessLevel: 1,
    content: `
      办公室角落的垃圾桶。
      里面只有一些废纸团，但在桶边缘沾染了一些半透明的、有弹性的 [胶状碎屑]。
    `,
  },

  // --- 4. 嫌疑人 (逐步解锁) ---
  
  // 第一梯队：第一发现人 & 法医
  {
    id: 'P_C',
    type: RecordType.SUSPECT,
    title: '嫌疑人：陈宇 (新警)',
    tags: ['发现人'],
    prerequisiteId: 'SYS-START',
    unlockKeywords: ['新警', '实习', '陈宇', '小陈'],
    accessLevel: 1,
    content: `
      第一个发现尸体并撞门进入的人。
      
      证词：
      "我来找赵局签字。敲门没人应，但是手机一直在响。我就叫来了在走廊抽烟的 [老李] 和在楼下修电路的 [老王] 一起撞开了门。"
    `,
  },
  {
    id: 'P_D',
    type: RecordType.SUSPECT,
    title: '嫌疑人：赵雪 (法医)',
    tags: ['法医'],
    prerequisiteId: 'SYS-START',
    unlockKeywords: ['法医', '赵雪', '医生'],
    accessLevel: 1,
    content: `
      随身携带勘查箱。死亡时间推定：20:00-20:30之间。
      
      提示：
      "我在二楼技术科有个临时的 [化验台]，如果你们在现场发现了什么不明物质，可以拿来给我化验。"
    `,
  },
  {
    id: 'LOC_LAB',
    type: RecordType.LOCATION,
    title: '地点：化验台',
    tags: ['交互点'],
    prerequisiteId: 'P_D', // 法医引出
    unlockKeywords: ['化验台', '化验', 'lab', 'test'],
    accessLevel: 1,
    content: `
      位于二楼技术科的简易化验设备。可以对微量物证进行成分分析。
      
      (提示：将可疑物品拖入此处进行化验)
    `,
    interaction: {
      type: 'use-item',
      requiredRecordId: 'CLUE_CUFF', // 需要袖口
      hintText: '等待样本输入...',
      successMessage: '光谱分析完成。成分匹配中...',
      unlockedContent: `
        [化验报告]
        样本来源：刘雨薇的袖口
        主要成分：酸性硅酮密封胶（俗称玻璃胶）
        状态：未完全固化
        
        结论：
        嫌疑人近期接触过大量未干的玻璃胶。这与现场垃圾桶内的残留物一致。
      `
    }
  },

  // 第二梯队：由陈宇引出
  {
    id: 'P_B',
    type: RecordType.SUSPECT,
    title: '嫌疑人：李建国 (老刑警)',
    tags: ['目击者'],
    prerequisiteId: 'P_C',
    unlockKeywords: ['刑警', '李建国', '老李', '老刑警'],
    accessLevel: 1,
    content: `
      案发时他在走廊尽头抽烟。
      
      证词：
      “我没看到任何人进出局长办公室。这走廊一眼就能望到头。哦对了，只有内勤 [小刘] 抱着一大堆东西路过 [走廊]，说是去送档案。”
    `,
  },
  {
    id: 'P_A',
    type: RecordType.SUSPECT,
    title: '嫌疑人：王强 (后勤)',
    tags: ['后勤'],
    prerequisiteId: 'P_C',
    unlockKeywords: ['后勤', '王强', '老王'],
    accessLevel: 1,
    content: `
      身份：后勤处长。
      案发时声称在楼下 [仓库] 整理库存，听到陈宇喊叫才跑上来的。
      他的 [工具包] 就放在手边。
    `,
  },
  {
    id: 'LOC_WAREHOUSE',
    type: RecordType.LOCATION,
    title: '地点：一楼仓库',
    tags: ['搜查'],
    prerequisiteId: 'P_A',
    unlockKeywords: ['仓库', 'warehouse', 'storage'],
    accessLevel: 2,
    content: `
      堆放着旧办公楼的杂物。
      
      搜查记录：
      在角落发现了一张新的采购单，显示上周采购了一批标准门窗玻璃，以及大量 [玻璃胶] 和工具。
      但仓库里并没有看到新玻璃的实物。
    `,
  },

  // 第三梯队：由李建国引出
  {
    id: 'P_E',
    type: RecordType.SUSPECT,
    title: '嫌疑人：刘雨薇 (内勤)',
    tags: ['关键嫌疑人'],
    prerequisiteId: 'P_B',
    unlockKeywords: ['内勤', '刘雨薇', '小刘'],
    accessLevel: 1,
    content: `
      案发前抱着一摞高过头顶的 [档案盒] 经过走廊。
      她说档案太重，走得很慢。
      
      观察：
      她的 [袖口] 处有一块奇怪的污渍。
    `,
  },

  // --- 5. 深入调查 & 手法破解 ---
  {
    id: 'CLUE_CUFF',
    type: RecordType.EVIDENCE,
    title: '物品：刘雨薇的袖口',
    tags: ['待化验'],
    prerequisiteId: 'P_E',
    unlockKeywords: ['袖口', 'cuff', 'uniform'],
    accessLevel: 2,
    content: `
      内勤刘雨薇的制服袖口处，沾有一点点还没完全干透的半透明胶状物。
      看起来很像是胶水，或者是鼻涕？
      
      (需要进一步分析成分，或许可以找法医帮忙)
    `,
  },
  {
    id: 'CLUE_GLASS',
    type: RecordType.LOCATION,
    title: '物件：异常洁净的玻璃',
    tags: ['疑点', '核心诡计'],
    prerequisiteId: 'LOC_DOOR', // Need to see the door first
    unlockKeywords: ['玻璃', 'glass', '观察窗'],
    accessLevel: 2,
    content: `
      关于门上观察窗的疑点：
      
      既然房间有酸味（疑似挥发物），且办公室到处是积灰（说明很久没深度打扫），为什么门上的这块观察窗玻璃却是一尘不染、崭新发亮的？
      
      推测：
      这块玻璃是新的，或者刚被替换过。
    `,
  },
  {
    id: 'ITEM_TOOLKIT',
    type: RecordType.ITEM,
    title: '物品：王强的工具包',
    tags: ['搜查'],
    prerequisiteId: 'P_A',
    unlockKeywords: ['工具包', 'tools', 'kit'],
    accessLevel: 2,
    content: `
      在后勤王强的工具包里发现了铲刀、螺丝刀。
      还有一管已经用了一半的工业用 [玻璃胶]。
      
      (王强解释：最近楼里到处漏水，这是修补用的。)
    `,
  },
  {
    id: 'INFO_SILICONE',
    type: RecordType.DOC,
    title: '档案：玻璃胶特性说明',
    tags: ['科普'],
    prerequisiteId: 'ITEM_TRASH', // Found debris
    unlockKeywords: ['玻璃胶', '硅胶', 'silicone', 'glue'],
    accessLevel: 2,
    content: `
      工业用酸性玻璃胶。
      
      特性：
      固化过程中会释放 **醋酸** 味（与现场气味吻合）。
      表干时间为10-20分钟。
      这意味着如果凶手使用了玻璃胶，作案时间离被发现很近，胶水还没完全干透。
    `,
  },
  {
    id: 'LOC_HALLWAY',
    type: RecordType.LOCATION,
    title: '地点：走廊',
    tags: ['环境'],
    prerequisiteId: 'P_B', // B mentioned it
    unlockKeywords: ['走廊', 'hallway', 'corridor'],
    accessLevel: 1,
    content: `
      灯光昏暗。
      
      视线测试：
      根据李建国的站位，如果刘雨薇抱着高过头顶的档案盒路过，巨大的盒子会形成视线遮挡，挡住她身侧对着门的那一面。
      李建国无法看清她在门前具体做了什么动作。
    `,
  },
  {
    id: 'DATA_CCTV',
    type: RecordType.EVIDENCE,
    title: '物件：走廊监控录像',
    tags: ['时间线'],
    prerequisiteId: 'LOC_HALLWAY',
    unlockKeywords: ['监控', 'cctv', 'video'],
    accessLevel: 2,
    content: `
      画面显示：
      刘雨薇抱着档案盒进入了监控盲区（即赵局门口）。
      
      异常：
      她在盲区停留了约 3 分钟。
      （通常路过只需要 10 秒）。
    `,
  },
  {
    id: 'ITEM_BOX',
    type: RecordType.ITEM,
    title: '物品：档案盒',
    tags: ['容器'],
    prerequisiteId: 'P_E',
    unlockKeywords: ['档案盒', 'box', 'files'],
    accessLevel: 2,
    content: `
      在刘雨薇的工位找到了那一摞档案盒。
      里面装满了旧文件。
      
      疑点：
      其中两个盒子的内侧边缘有奇怪的磨损痕迹，像是被硬物撑开过。
    `,
    interaction: {
      type: 'use-item',
      requiredRecordId: 'DOC_INVENTORY', // Need to combine with inventory list info
      hintText: '档案盒内部似乎暗藏玄机。需要对比 [库存清单] 或相关数据来验证猜想。',
      successMessage: '对比尺寸数据... 吻合！',
      unlockedContent: `
        [手法解析]
        
        将档案盒拆开测量，发现由于盒子很大，中间可以正好夹带一块标准尺寸的 [玻璃] 板。
        
        结论：
        刘雨薇是利用搬运档案的机会，将新玻璃运到门口，并带走旧玻璃（或碎片）的。
      `
    }
  },
  {
    id: 'DOC_INVENTORY',
    type: RecordType.DOC,
    title: '档案：后勤库存清单',
    tags: ['数据'],
    prerequisiteId: 'LOC_WAREHOUSE', // Found in warehouse
    unlockKeywords: ['清单', '库存', 'inventory', 'list'],
    accessLevel: 2,
    content: `
      记录显示：
      上周警局采购了一批标准尺寸的门窗玻璃。
      
      当前库存状态：
      显示 **少了一块**。
      借出记录为空。
    `,
  },
  {
    id: 'LOC_TRASH_STATION',
    type: RecordType.LOCATION,
    title: '物品：垃圾处理站',
    tags: ['销赃地'],
    prerequisiteId: 'LOC_HALLWAY', // General search of surroundings
    unlockKeywords: ['垃圾站', '垃圾', 'garbage'],
    accessLevel: 2,
    content: `
      在警局楼下的垃圾分类站进行搜查。
      
      发现：
      一块被 [透明胶带] 紧紧缠绕住的破碎玻璃板。
      这应该就是被替换下来的旧玻璃。
    `,
  },
  {
    id: 'ITEM_TAPE',
    type: RecordType.ITEM,
    title: '物品：透明胶带卷',
    tags: ['工具'],
    prerequisiteId: 'LOC_TRASH_STATION',
    unlockKeywords: ['胶带', 'tape'],
    accessLevel: 2,
    content: `
      在碎玻璃上贴满了这种宽胶带。
      
      作用分析：
      这是为了防止敲碎玻璃时发出巨响，并防止碎片散落一地。
      这是典型的消音破窗手法。
    `,
  },
  
  // --- 6. 其他线索 ---
  {
    id: 'DOC_BILL',
    type: RecordType.DOC,
    title: '档案：医疗账单',
    tags: ['动机'],
    prerequisiteId: 'P_E',
    unlockKeywords: ['账单', '医院', 'bill'],
    accessLevel: 2,
    content: `
      在刘雨薇的抽屉深处发现的。
      她母亲身患重病，急需巨额手术费。
      
      比对：
      账单日期与公款缺失日期吻合。
    `,
  },
  {
    id: 'ITEM_BANDAID',
    type: RecordType.ITEM,
    title: '物品：赵雪的创可贴',
    tags: ['误导'],
    prerequisiteId: 'P_D',
    unlockKeywords: ['创可贴', 'bandaid'],
    accessLevel: 2,
    content: `
      撕下法医赵雪手上的创可贴检查。
      
      结果：
      伤口边缘平整，是普通的纸张割伤。
      排除是被玻璃划伤的可能性。
    `,
  }
];

export const caseMD20230401: CaseScenario = {
  systemName: "天网档案系统 (SkyNet Archives) v5.0",
  caseId: "MD20230401",
  caseTitle: "玻璃后的盲点",
  initialRecord: INITIAL_RECORD,
  records: RECORDS,
  solution: {
    culpritId: 'P_E', // 内勤刘雨薇
    evidenceId: 'CLUE_CUFF', // 袖口的玻璃胶 (需化验后)
    motiveId: 'DOC_AUDIT', // 审计书/挪用公款
    validEvidenceIds: ['CLUE_CUFF', 'ITEM_BOX', 'CLUE_GLASS'], 
    validMotiveIds: ['DOC_AUDIT', 'DATA_SMS', 'DOC_BILL'],
    explanation: "刘雨薇利用职务之便，提前偷取了玻璃。案发时利用搬运档案盒（夹层藏玻璃）作掩护，在门口利用胶带静音破窗，伸手入内打开[球形锁]杀人。随后清理现场，换上新玻璃，并用酸性玻璃胶固定。由于胶水未干散发酸味，且袖口沾染了胶渍（经[化验台]证实），最终暴露。动机是为母亲治病挪用公款被赵局发现，且遭到赵局的性勒索。",
    confession: `
(刘雨薇瘫坐在审讯椅上，双手掩面，声音颤抖)

“我没想杀他的... 真的没想。

我妈妈得了尿毒症，每天的透析费像山一样压着我。我只是一时糊涂，挪用了那笔备用金。我想着等年底奖金发了就补上的...

但是赵卫民发现了。他叫我去办公室，我以为我要坐牢了。可他... 他把手放在我的腿上，说只要我‘听话’，这件事就可以当没发生过。那条短信... 你们看到了吧？那是压死我的最后一根稻草。

那天晚上，我抱着档案盒走过走廊，雨下得很大，就像我的心情一样绝望。我知道玻璃胶还没干透，会有味道，但我顾不了那么多了。我用胶带贴满玻璃，敲碎它的时候，声音被雷声盖住了，连老李都没听见。

当我把刀插进他肚子的时候，他还在笑... 那种恶心的笑。

我后悔吗？我只后悔没能陪妈妈走完最后一段路。”
    `
  }
};
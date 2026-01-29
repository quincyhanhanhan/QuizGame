import React, { useState, useEffect } from 'react';
import { 
  DatabaseRecord, 
  Page, 
  RecordType, 
  GameState,
  AccusationSlot,
  CaseScenario,
  Message
} from './types';
import { sendMessageToGemini } from './services/geminiService';
import { AVAILABLE_CASES, getScenario } from './scenarios/registry';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;
const DragIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 111.731-1A3 3 0 0013 8a3.001 3.001 0 00-2 2.855V11a1 1 0 11-2 0v-.145c.001-1.625 1.126-2.954 2.767-2.999.044-.001.088-.006.133-.006zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;

enum SidebarFilter {
  ALL = '全部',
  PEOPLE = '人物',
  LOCATION = '地点',
  ITEM = '物品',
  DOCS = '档案'
}

const GUIDE_STEPS = [
  {
    title: "系统概览",
    icon: <DatabaseIcon />,
    content: "欢迎使用天网档案系统。你的目标是通过检索数据库，还原案件真相。界面左侧是【档案索引】，中间是【阅读器】，上方是【指令栏】。"
  },
  {
    title: "关键词检索",
    icon: <SearchIcon />,
    content: "在上方输入框输入关键词来检索。系统会检查所有【已解锁】档案的正文和口供。只有当关键词在现有线索中被提及时，或者满足前置逻辑，新的档案才会被解锁。"
  },
  {
    title: "动态证词",
    icon: <ChatIcon />,
    content: "嫌疑人的口供不是一成不变的。当你获得关键证据后，相关人物的档案会【更新】，解锁新的【关联询问】。请留意侧边栏的 NEW DATA 标记和高亮提示。"
  },
  {
    title: "辅助功能",
    icon: <SparklesIcon />,
    content: "卡关了吗？点击指令栏右侧的【AI 分析】获取模糊提示。你也可以点击侧边栏顶部的标签来筛选显示，理清复杂的线索关系。"
  },
  {
    title: "最终结案",
    icon: <AlertIcon />,
    content: "当你理清了凶手、关键定罪证据和作案动机后，点击右上角的【结案通道】。将任意已解锁的档案拖入三个槽位中。只有逻辑完全闭环才能成功结案。"
  }
];

// ----------------------------------------------------------------------
// COMPONENT: LAUNCHER (Start Screen)
// ----------------------------------------------------------------------

interface LauncherProps {
  onLaunch: (scenario: CaseScenario) => void;
}

const Launcher: React.FC<LauncherProps> = ({ onLaunch }) => {
  const [inputId, setInputId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConnect = (caseId: string) => {
    const scenario = getScenario(caseId);
    if (scenario) {
      onLaunch(scenario);
    } else {
      setError(`ERROR: CASE ID '${caseId}' NOT FOUND`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-mono">
       {/* Background Grid Animation */}
       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{
              backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}>
       </div>

       <div className="z-10 w-full max-w-2xl bg-slate-900/80 border border-police-500/50 rounded-lg p-10 shadow-[0_0_100px_rgba(14,165,233,0.15)] backdrop-blur-md relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-police-500 to-transparent"></div>
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tighter">DetectiveOS</h1>
            <p className="text-police-500 text-sm tracking-[0.3em] uppercase">Crime Investigation Terminal</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-widest"> Manual Override / Case Search</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputId}
                  onChange={(e) => {
                    setInputId(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect(inputId)}
                  placeholder="ENTER CASE ID..." 
                  className="flex-1 bg-black border border-slate-700 p-4 text-white placeholder-slate-600 focus:border-police-500 outline-none transition-all uppercase"
                />
                <button 
                  onClick={() => handleConnect(inputId)}
                  className="bg-police-900 hover:bg-police-800 text-police-100 border border-police-700 px-8 font-bold transition-colors"
                >
                  CONNECT
                </button>
              </div>
              {error && <div className="text-red-500 text-xs mt-2 animate-shake">{error}</div>}
            </div>

            <div className="pt-8 border-t border-slate-800">
               <label className="block text-xs text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Detected Signals (Available Cases)
               </label>
               <div className="grid gap-3">
                 {AVAILABLE_CASES.map(c => (
                   <button 
                    key={c.id}
                    onClick={() => handleConnect(c.id)}
                    className="flex items-center justify-between p-4 border border-slate-800 hover:border-police-500 hover:bg-police-900/20 bg-black/50 transition-all group text-left"
                   >
                     <div>
                       <div className="text-police-400 font-bold text-sm group-hover:text-white transition-colors">{c.id}</div>
                       <div className="text-slate-400 text-xs mt-1">{c.title}</div>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity text-police-500">
                        ACCESS {'>'}
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="absolute bottom-2 right-4 text-[10px] text-slate-700">
             SYS_VER 5.0.2 // ONLINE
          </div>
       </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: GAME INTERFACE (The main app logic)
// ----------------------------------------------------------------------

interface GameInterfaceProps {
  scenario: CaseScenario;
  onExit: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ scenario, onExit }) => {
  const { records: RECORDS, initialRecord: INITIAL_RECORD, solution: SOLUTION, systemName: SYSTEM_NAME } = scenario;

  const [currentPage, setCurrentPage] = useState<Page>(Page.DATABASE);
  const [unlockedRecordIds, setUnlockedRecordIds] = useState<string[]>(
    RECORDS.filter(r => r.isInitial).map(r => r.id)
  );
  
  // Tabs State
  const [tabs, setTabs] = useState<string[]>([INITIAL_RECORD.id]);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_RECORD.id);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>(SidebarFilter.ALL);
  
  // Read State Tracking
  const [viewedState, setViewedState] = useState<Record<string, number>>({
    [INITIAL_RECORD.id]: 0 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [gameState, setGameState] = useState<GameState>(GameState.INVESTIGATING);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Guide State
  const [showGuide, setShowGuide] = useState(false);
  const [guidePage, setGuidePage] = useState(0);

  // Accusation State
  const [slots, setSlots] = useState<AccusationSlot[]>([
    { id: 'culprit', label: '真凶', question: '谁是凶手？', acceptedTypes: [RecordType.SUSPECT], filledRecordId: null },
    { id: 'evidence', label: '铁证', question: '最直接的定罪证物？', acceptedTypes: [RecordType.EVIDENCE, RecordType.ITEM], filledRecordId: null },
    { id: 'motive', label: '动机', question: '凶手的杀人动机？', acceptedTypes: [RecordType.DOC], filledRecordId: null },
  ]);
  const [resultMessage, setResultMessage] = useState<string>('');

  const getUnlockedRecords = () => RECORDS.filter(r => unlockedRecordIds.includes(r.id));

  // --- Read/Unread Logic ---
  
  const getVisibleCrossExamsCount = (record: DatabaseRecord) => {
    if (!record.crossExamination) return 0;
    return record.crossExamination.filter(ce => unlockedRecordIds.includes(ce.triggerRecordId)).length;
  };

  const isRecordUnread = (record: DatabaseRecord) => {
    if (viewedState[record.id] === undefined) return true;
    const currentVisibleCount = getVisibleCrossExamsCount(record);
    const lastViewedCount = viewedState[record.id];
    return currentVisibleCount > lastViewedCount;
  };

  const markRecordAsRead = (recordId: string) => {
    const record = RECORDS.find(r => r.id === recordId);
    if (record) {
      const currentCount = getVisibleCrossExamsCount(record);
      setViewedState(prev => ({
        ...prev,
        [recordId]: currentCount
      }));
    }
  };

  // --- Helpers ---
  const getRecordColor = (type: RecordType, isUnread: boolean) => {
    const baseOpacity = isUnread ? 'opacity-100' : 'opacity-60';
    let colorClass = '';
    switch (type) {
      case RecordType.SUSPECT: colorClass = `text-red-400 border-red-900/50 bg-red-900/${isUnread ? '20' : '5'}`; break;
      case RecordType.LOCATION: colorClass = `text-green-400 border-green-900/50 bg-green-900/${isUnread ? '20' : '5'}`; break;
      case RecordType.EVIDENCE: 
      case RecordType.ITEM: colorClass = `text-yellow-400 border-yellow-900/50 bg-yellow-900/${isUnread ? '20' : '5'}`; break;
      case RecordType.DOC: colorClass = `text-blue-400 border-blue-900/50 bg-blue-900/${isUnread ? '20' : '5'}`; break;
      case RecordType.AUTOPSY: colorClass = `text-slate-400 border-slate-700 bg-slate-800/${isUnread ? '50' : '20'}`; break;
      default: colorClass = `text-slate-400 border-slate-800`;
    }
    return `${colorClass} ${baseOpacity} ${isUnread ? 'shadow-[0_0_10px_rgba(255,255,255,0.05)]' : ''}`;
  };

  const getRecordBadgeColor = (type: RecordType) => {
    switch (type) {
      case RecordType.SUSPECT: return 'bg-red-500 text-black';
      case RecordType.LOCATION: return 'bg-green-500 text-black';
      case RecordType.EVIDENCE: 
      case RecordType.ITEM: return 'bg-yellow-500 text-black';
      case RecordType.DOC: return 'bg-blue-500 text-black';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getRecordDisplayType = (type: RecordType) => {
    if (type === RecordType.EVIDENCE) return RecordType.ITEM;
    return type;
  }

  // --- Search & Unlock Logic ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (errorMsg) setErrorMsg(null);
  };

  const executeSearch = () => {
    if (!searchQuery.trim()) return;

    setErrorMsg(null);
    setNotification(null);
    const lowerQuery = searchQuery.toLowerCase().trim();

    const potentialMatches = RECORDS.filter(r => 
      r.unlockKeywords.some(k => lowerQuery.includes(k.toLowerCase()) || k.toLowerCase() === lowerQuery)
    );

    if (potentialMatches.length === 0) {
      setErrorMsg("系统未找到该关键词的相关档案");
      return;
    }

    const unlockedRecords = getUnlockedRecords();
    
    let combinedContext = "";
    unlockedRecords.forEach(r => {
      combinedContext += `${r.title} ${r.content} `;
      if (r.crossExamination) {
        r.crossExamination.forEach(ce => {
           if (unlockedRecordIds.includes(ce.triggerRecordId)) {
             combinedContext += `${ce.topic} ${ce.content} `;
           }
        });
      }
    });
    combinedContext = combinedContext.toLowerCase();

    const accessibleMatches = potentialMatches.filter(targetRecord => {
      const prereqMet = !targetRecord.prerequisiteId || unlockedRecordIds.includes(targetRecord.prerequisiteId);
      const mentionedInContext = targetRecord.unlockKeywords.some(keyword => 
        combinedContext.includes(keyword.toLowerCase())
      );
      return prereqMet || mentionedInContext;
    });

    if (accessibleMatches.length === 0) {
      setErrorMsg("权限不足：系统档案中暂无此前置线索记录");
      return;
    }

    const newUnlocks = accessibleMatches.filter(r => !unlockedRecordIds.includes(r.id));

    if (newUnlocks.length > 0) {
      setUnlockedRecordIds(prev => [...prev, ...newUnlocks.map(u => u.id)]);
      setNotification(`检索成功：解密 ${newUnlocks.length} 份新档案 (请查看侧边栏)`);
      setTimeout(() => setNotification(null), 4000);
      setSearchQuery('');
    } else {
      const record = accessibleMatches[0];
      setNotification(`档案 [${record.title}] 已存在`);
      setTimeout(() => setNotification(null), 2000);
      openRecord(record.id); 
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  // --- Tab Logic ---

  const openRecord = (recordId: string) => {
    markRecordAsRead(recordId);
    if (tabs.includes(recordId)) {
      setActiveTabId(recordId);
      return;
    }
    if (tabs.length < 3) {
      setTabs(prev => [...prev, recordId]);
      setActiveTabId(recordId);
    } else {
      setTabs(prev => [...prev.slice(1), recordId]);
      setActiveTabId(recordId);
    }
  };

  const closeTab = (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(id => id !== recordId);
    setTabs(newTabs);
    if (activeTabId === recordId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : '');
    }
  };

  // --- Hint Logic with Gemini ---
  
  const generateHint = async () => {
    setHintMessage("正在连接 AI 核心分析数据库...");
    
    // We provide context to the AI about what is unlocked and what is locked but available next
    const currentContext = `
      已解锁档案ID: ${unlockedRecordIds.join(', ')}。
      用户当前正在寻找新的线索。
    `;
    
    const contextData = {
      records: RECORDS,
      caseTitle: scenario.caseTitle,
      initialBrief: INITIAL_RECORD.content
    };

    const response = await sendMessageToGemini(chatHistory, currentContext + " 请给出一个模糊的提示，告诉我不剧透的情况下应该去搜索什么关键词，或者注意哪份档案。", contextData);
    setHintMessage(response);
  };

  // --- Drag and Drop Logic ---

  const handleRecordDragStart = (e: React.DragEvent, recordId: string) => {
    e.dataTransfer.setData("recordId", recordId);
  };

  const handleSlotDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const recordId = e.dataTransfer.getData("recordId");
    
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const record = RECORDS.find(r => r.id === recordId);
        if (record) {
           return { ...slot, filledRecordId: recordId };
        }
      }
      return slot;
    }));
  };

  const clearSlot = (slotId: string) => {
    setSlots(prev => prev.map(slot => slot.id === slotId ? { ...slot, filledRecordId: null } : slot));
  };

  const handleSubmitAccusation = () => {
    const culprit = slots.find(s => s.id === 'culprit')?.filledRecordId;
    const evidence = slots.find(s => s.id === 'evidence')?.filledRecordId;
    const motive = slots.find(s => s.id === 'motive')?.filledRecordId;

    if (!culprit || !evidence || !motive) {
      setResultMessage("系统驳回：必须填写完整的证据链（凶手+铁证+动机）。");
      return;
    }

    const isCulpritCorrect = culprit === SOLUTION.culpritId;
    const isEvidenceCorrect = SOLUTION.validEvidenceIds.includes(evidence);
    const isMotiveCorrect = SOLUTION.validMotiveIds.includes(motive);

    if (isCulpritCorrect && isEvidenceCorrect && isMotiveCorrect) {
      setGameState(GameState.SOLVED);
      setResultMessage("结案确认：证据确凿，嫌疑人已被批捕。");
    } else {
      setGameState(GameState.FAILED);
      setResultMessage("结案失败：证据链逻辑不成立，请重新调查。");
    }
  };

  // --- Filter Logic ---
  const getFilteredRecords = () => {
    const unlocked = getUnlockedRecords();
    if (sidebarFilter === SidebarFilter.ALL) return unlocked;
    
    return unlocked.filter(r => {
      if (sidebarFilter === SidebarFilter.PEOPLE) return r.type === RecordType.SUSPECT;
      if (sidebarFilter === SidebarFilter.LOCATION) return r.type === RecordType.LOCATION;
      if (sidebarFilter === SidebarFilter.ITEM) return r.type === RecordType.ITEM || r.type === RecordType.EVIDENCE;
      if (sidebarFilter === SidebarFilter.DOCS) return [RecordType.DOC, RecordType.AUTOPSY, RecordType.SYSTEM].includes(r.type);
      return true;
    });
  };

  const renderGuideModal = () => {
    if (!showGuide) return null;
    const step = GUIDE_STEPS[guidePage];
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-police-500/50 w-full max-w-lg rounded-lg shadow-[0_0_50px_rgba(14,165,233,0.2)] flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                     <h3 className="text-police-100 font-bold font-mono flex items-center gap-2">
                        <HelpIcon /> 操作指引 ({guidePage + 1}/{GUIDE_STEPS.length})
                     </h3>
                     <button onClick={() => setShowGuide(false)} className="text-slate-500 hover:text-white"><XIcon /></button>
                </div>
                
                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center flex-1 min-h-[300px] justify-center">
                    <div className="w-20 h-20 bg-police-900/20 rounded-full flex items-center justify-center text-police-400 mb-6 border border-police-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                        <div className="scale-150">{step.icon}</div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">{step.title}</h4>
                    <p className="text-slate-300 leading-relaxed text-sm font-mono px-4">{step.content}</p>
                </div>

                {/* Footer / Nav */}
                <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center">
                    <button 
                        onClick={() => setGuidePage(Math.max(0, guidePage - 1))}
                        disabled={guidePage === 0}
                        className={`px-4 py-2 rounded text-xs font-bold border transition-colors ${guidePage === 0 ? 'border-transparent text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        上一页
                    </button>
                    
                    <div className="flex gap-1.5">
                        {GUIDE_STEPS.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === guidePage ? 'bg-police-500' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>

                    <button 
                         onClick={() => {
                             if (guidePage < GUIDE_STEPS.length - 1) {
                                 setGuidePage(guidePage + 1);
                             } else {
                                 setShowGuide(false);
                             }
                         }}
                        className="px-4 py-2 rounded text-xs font-bold bg-police-900/50 text-police-100 border border-police-700 hover:bg-police-900 transition-colors"
                    >
                        {guidePage === GUIDE_STEPS.length - 1 ? '开始调查' : '下一页'}
                    </button>
                </div>
            </div>
        </div>
    )
  }

  const renderDatabase = () => {
    const activeRecord = RECORDS.find(r => r.id === activeTabId);

    // Sort logic
    const sortedList = [...getFilteredRecords()].sort((a, b) => {
        if (a.type === RecordType.SYSTEM) return -1;
        if (b.type === RecordType.SYSTEM) return 1;
        const aUnread = isRecordUnread(a);
        const bUnread = isRecordUnread(b);
        if (aUnread && !bUnread) return -1;
        if (!aUnread && bUnread) return 1;
        return 0; 
    });

    return (
      <div className="flex flex-col h-full gap-4 relative">
        {notification && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 animate-slideDown bg-police-500 text-black font-bold px-6 py-2 rounded shadow-[0_0_20px_rgba(14,165,233,0.6)] z-50 pointer-events-none whitespace-nowrap">
            {notification}
          </div>
        )}
        {errorMsg && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 animate-shake bg-red-600 text-white font-bold px-6 py-2 rounded shadow-[0_0_20px_rgba(220,38,38,0.6)] z-50">
            {errorMsg}
          </div>
        )}

        {/* Command Bar */}
        <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-md">
          <div className="text-police-500 font-mono font-bold whitespace-nowrap">{'>'} SEARCH_QUERY:</div>
          <div className="relative flex-1">
             <input 
              type="text" 
              placeholder="输入关键词..." 
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-police-100 w-full font-mono placeholder-slate-600 text-lg"
              autoFocus
            />
          </div>
          <button onClick={executeSearch} className="p-2 bg-police-900/50 hover:bg-police-900 border border-police-700 rounded text-police-300 transition-colors">
            <SearchIcon />
          </button>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <button onClick={generateHint} className="flex items-center gap-2 px-3 py-1 bg-police-900/30 hover:bg-police-900 border border-police-700 rounded text-xs text-police-300 transition-colors whitespace-nowrap">
            <SparklesIcon /> AI 分析
          </button>
        </div>

        {/* Hint */}
        {hintMessage && (
           <div className="bg-police-900/20 border border-police-800 p-2 px-4 rounded text-sm text-police-300 font-mono flex justify-between items-center animate-fadeIn">
             <span>{hintMessage}</span>
             <button onClick={() => setHintMessage(null)} className="text-police-500 hover:text-white"><XIcon /></button>
           </div>
        )}

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Index Sidebar */}
          <div className="w-64 bg-slate-950 border border-slate-800 rounded flex flex-col">
            <div className="flex p-1 bg-slate-900 border-b border-slate-800 gap-0.5 overflow-x-auto no-scrollbar">
              {Object.values(SidebarFilter).map(filter => (
                 <button
                   key={filter}
                   onClick={() => setSidebarFilter(filter)}
                   className={`px-2 py-2 text-[10px] font-bold rounded flex-1 whitespace-nowrap transition-colors ${
                     sidebarFilter === filter 
                     ? 'bg-slate-800 text-police-400' 
                     : 'text-slate-500 hover:bg-slate-800/50'
                   }`}
                 >
                   {filter}
                 </button>
              ))}
            </div>

            <div className="p-2 bg-slate-900/50 border-b border-slate-800 font-bold text-slate-500 text-[10px] tracking-wider flex justify-between">
              <span>INDEX</span>
              <span>COUNT: {sortedList.length}</span>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
              {sortedList.map(record => {
                const isUnread = isRecordUnread(record);
                return (
                  <div 
                    key={record.id}
                    onClick={() => openRecord(record.id)}
                    draggable
                    onDragStart={(e) => handleRecordDragStart(e, record.id)}
                    className={`p-2 rounded cursor-pointer border-l-2 transition-all group ${
                      tabs.includes(record.id)
                      ? 'bg-slate-800 ' + getRecordColor(record.type, isUnread)
                      : 'bg-transparent border-transparent hover:bg-slate-900 ' + (isUnread ? 'text-white' : 'text-slate-500 hover:text-slate-300')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-sm truncate font-bold ${isUnread ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : ''}`}>
                        {record.title}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-police-500 animate-pulse shadow-[0_0_8px_#0ea5e9]"></span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                       <span className={`text-[9px] px-1 rounded ${getRecordBadgeColor(record.type)}`}>
                          {getRecordDisplayType(record.type)}
                       </span>
                       {isUnread && <span className="text-[9px] text-police-400 font-mono font-bold tracking-wider">NEW DATA</span>}
                    </div>
                  </div>
                );
              })}
              {sortedList.length === 0 && (
                 <div className="text-center text-slate-600 text-xs py-8 italic">无相关档案</div>
              )}
            </div>
          </div>

          {/* Main Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-black border-b border-slate-700 h-10 items-end px-2 gap-1 overflow-x-auto">
               {tabs.map((tabId) => {
                 const record = RECORDS.find(r => r.id === tabId);
                 if (!record) return null;
                 const isActive = activeTabId === tabId;
                 return (
                   <div
                     key={tabId}
                     onClick={() => setActiveTabId(tabId)}
                     className={`
                       group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer select-none text-xs font-mono border-t border-l border-r min-w-[120px] max-w-[200px] relative
                       ${isActive 
                         ? 'bg-slate-900 border-slate-700 text-white z-10 -mb-[1px] pb-[9px]' 
                         : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900'
                       }
                     `}
                   >
                     <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-police-500' : 'bg-slate-600'}`}></span>
                     <span className="truncate flex-1">{record.title}</span>
                     <button 
                       onClick={(e) => closeTab(e, tabId)}
                       className={`hover:bg-red-900/50 rounded p-0.5 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                     >
                       <XIcon />
                     </button>
                   </div>
                 );
               })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-900 custom-scrollbar relative">
              {activeRecord ? (
                <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-6 mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-white font-mono mb-2">{activeRecord.title}</h1>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${getRecordBadgeColor(activeRecord.type)}`}>
                          {getRecordDisplayType(activeRecord.type)}
                        </span>
                        <span className="bg-slate-950 text-slate-500 text-xs px-2 py-1 rounded border border-slate-800">
                          ID: {activeRecord.id}
                        </span>
                        <span className="bg-slate-950 text-police-500 text-xs px-2 py-1 rounded border border-slate-800">
                          LEVEL: {activeRecord.accessLevel}
                        </span>
                      </div>
                    </div>
                    {activeRecord.imageUrl && (
                      <img src={activeRecord.imageUrl} className="w-24 h-24 rounded border border-slate-700 object-cover grayscale opacity-80" />
                    )}
                  </div>
                  
                  <div className="prose prose-invert prose-lg max-w-none font-mono">
                     {activeRecord.content.split('\n').map((line, i) => (
                       <p key={i} className="mb-2 text-slate-300 leading-7">{line}</p>
                     ))}
                  </div>

                  {/* Dynamic Cross Examination Section */}
                  {activeRecord.crossExamination && (
                    <div className="mt-12 pt-8 border-t border-slate-800">
                      <h3 className="text-xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                         <ChatIcon /> 关联询问 / Cross-Examination
                      </h3>
                      <div className="grid gap-4">
                        {activeRecord.crossExamination.map((item, idx) => {
                          const isUnlocked = unlockedRecordIds.includes(item.triggerRecordId);
                          return (
                            <div key={idx} className={`p-4 rounded border transition-all ${
                                isUnlocked 
                                ? 'bg-slate-950 border-police-900' 
                                : 'bg-black/20 border-slate-800 opacity-50'
                            }`}>
                                <div className="text-xs font-bold font-mono mb-2 uppercase tracking-wider text-slate-500">
                                   {isUnlocked ? item.topic : '??? [前置线索未解锁] ???'}
                                </div>
                                <div className={`font-mono text-sm leading-6 ${isUnlocked ? 'text-police-100' : 'text-slate-700 blur-sm select-none'}`}>
                                   {isUnlocked ? item.content : '此段证词需要解锁相关物证后方可查看。'}
                                </div>
                            </div>
                          );
                        })}
                        {activeRecord.crossExamination.length === 0 && (
                            <div className="text-slate-600 italic text-sm">暂无关联口供</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-700">
                  <DatabaseIcon />
                  <p className="mt-4 font-mono text-sm">READY FOR INPUT</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAccusation = () => {
    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col p-4 animate-fadeIn">
           <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                 <AlertIcon /> 结案通道 / FINAL ACCUSATION
              </h2>
              <p className="text-slate-500 font-mono text-sm tracking-wider">拖入档案至下方槽位以构建证据链 (DRAG & DROP)</p>
           </div>
  
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {slots.map(slot => {
                  const filledRecord = RECORDS.find(r => r.id === slot.filledRecordId);
                  const isCorrectType = !filledRecord || slot.acceptedTypes.includes(filledRecord.type);
                  
                  return (
                      <div 
                         key={slot.id}
                         onDrop={(e) => handleSlotDrop(e, slot.id)}
                         onDragOver={(e) => e.preventDefault()}
                         className={`
                           border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center min-h-[280px] transition-all relative
                           ${filledRecord 
                              ? 'border-police-500 bg-police-900/10' 
                              : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800'
                           }
                           ${!isCorrectType && filledRecord ? 'border-red-500 bg-red-900/10' : ''}
                         `}
                      >
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2 w-full text-center">{slot.label}</div>
                          
                          {filledRecord ? (
                              <div className="w-full relative group flex-1 flex flex-col">
                                  <div className={`p-4 rounded border text-center flex-1 flex flex-col justify-center items-center gap-2 ${getRecordColor(filledRecord.type, true)}`}>
                                      <div className="font-bold text-lg leading-tight">{filledRecord.title}</div>
                                      <div className="text-[10px] opacity-70 font-mono bg-black/30 px-2 py-0.5 rounded">{filledRecord.id}</div>
                                  </div>
                                  <button 
                                    onClick={() => clearSlot(slot.id)}
                                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110"
                                  >
                                      <XIcon />
                                  </button>
                                  {!isCorrectType && (
                                    <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                                      类型不匹配
                                    </div>
                                  )}
                              </div>
                          ) : (
                              <div className="text-center text-slate-600 flex flex-col items-center gap-3">
                                  <div className="p-4 rounded-full bg-slate-800/50">
                                    <DragIcon />
                                  </div>
                                  <div className="text-sm font-mono max-w-[150px]">{slot.question}</div>
                              </div>
                          )}
                      </div>
                  )
              })}
           </div>
  
           <div className="flex flex-col items-center gap-4 mt-auto pb-8">
               {resultMessage && (
                   <div className={`px-8 py-3 rounded-lg font-bold text-lg animate-fadeIn flex items-center gap-2 shadow-xl ${gameState === GameState.SOLVED ? 'bg-green-500 text-black' : 'bg-red-600 text-white'}`}>
                       {gameState === GameState.SOLVED ? <SparklesIcon /> : <AlertIcon />}
                       {resultMessage}
                   </div>
               )}
  
               <button 
                  onClick={handleSubmitAccusation}
                  disabled={gameState === GameState.SOLVED}
                  className={`
                    font-bold py-3 px-16 rounded text-lg tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.2)] transition-all
                    ${gameState === GameState.SOLVED 
                      ? 'bg-green-600 text-black cursor-default opacity-100' 
                      : 'bg-police-600 hover:bg-police-500 text-white hover:scale-105 active:scale-95'
                    }
                  `}
               >
                   {gameState === GameState.SOLVED ? 'CASE CLOSED' : '提交审查 / SUBMIT'}
               </button>
           </div>
        </div>
    );
  };

  return (
    <div className="h-screen bg-black text-slate-300 font-sans select-none overflow-hidden flex flex-col">
       {renderGuideModal()}
       
       {/* Header */}
       <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 shrink-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
          
          {/* Left: System Identity */}
          <div className="flex flex-col justify-center">
             <div className="text-white font-bold font-mono tracking-tighter text-2xl flex items-center gap-3">
                <div className="w-2 h-6 bg-police-500 rounded-sm animate-pulse shadow-[0_0_10px_#0ea5e9]"></div>
                {SYSTEM_NAME.split(' ')[0]} 
                <span className="text-police-500 text-sm self-end mb-1 tracking-widest opacity-80">OS</span>
             </div>
             <div className="text-[10px] text-slate-600 font-mono tracking-[0.2em] uppercase pl-5 mt-1">
                CASE ID: {scenario.caseId}
             </div>
          </div>

          {/* Center: Main Navigation (Segmented Control Style) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex bg-slate-900/90 p-1.5 rounded-full border border-slate-800 shadow-inner gap-1">
              <button 
                 onClick={() => setCurrentPage(Page.DATABASE)}
                 className={`
                    px-8 py-2 rounded-full text-xs font-bold font-mono flex items-center gap-2 transition-all duration-300
                    ${currentPage === Page.DATABASE 
                      ? 'bg-police-600 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }
                 `}
              >
                  <DatabaseIcon /> 档案库
              </button>
              <button 
                 onClick={() => setCurrentPage(Page.ACCUSATION)}
                 className={`
                    px-8 py-2 rounded-full text-xs font-bold font-mono flex items-center gap-2 transition-all duration-300
                    ${currentPage === Page.ACCUSATION 
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }
                 `}
              >
                  <AlertIcon /> 结案通道
              </button>
          </div>

          {/* Right: Status & Utilities */}
          <div className="flex items-center gap-6">
              {/* Status Badge */}
              <div className={`
                  flex items-center gap-2 px-3 py-1 rounded border text-[10px] font-mono tracking-widest uppercase
                  ${gameState === GameState.SOLVED 
                    ? 'border-green-900/50 bg-green-900/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                    : 'border-yellow-900/50 bg-yellow-900/10 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                  }
              `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${gameState === GameState.SOLVED ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  STATUS: {gameState}
              </div>

              <div className="h-8 w-px bg-slate-800/50"></div>

              <div className="flex items-center gap-2">
                  <button onClick={() => setShowGuide(true)} className="p-2 text-slate-500 hover:text-police-400 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800" title="Help Guide">
                      <HelpIcon />
                  </button>
                  <button onClick={onExit} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800" title="Disconnect / Exit">
                      <PowerIcon />
                  </button>
              </div>
          </div>
       </header>

       {/* Main Content Area */}
       <main className="flex-1 overflow-hidden p-6 relative bg-black">
           {/* Background Pattern */}
           <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
               style={{
                 backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
               }}>
           </div>
          
          <div className="relative z-10 h-full">
            {currentPage === Page.DATABASE && renderDatabase()}
            {currentPage === Page.ACCUSATION && renderAccusation()}
          </div>
       </main>
    </div>
  );
};

// ----------------------------------------------------------------------
// COMPONENT: APP (Main Container)
// ----------------------------------------------------------------------

const App: React.FC = () => {
  // Main State: Which scenario is currently loaded?
  const [activeScenario, setActiveScenario] = useState<CaseScenario | null>(null);

  return (
    <>
      {activeScenario ? (
        <GameInterface 
          key={activeScenario.caseId} // Force reset when case changes
          scenario={activeScenario} 
          onExit={() => setActiveScenario(null)} 
        />
      ) : (
        <Launcher onLaunch={setActiveScenario} />
      )}
    </>
  );
};

export default App;
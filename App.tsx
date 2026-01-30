import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DatabaseRecord, 
  Page, 
  RecordType, 
  GameState,
  AccusationSlot,
  CaseScenario,
  Message,
  Interaction
} from './types';
// Removed external AI service import
import { AVAILABLE_CASES, getScenario } from './scenarios/registry';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;
const DragIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 111.731-1A3 3 0 0013 8a3.001 3.001 0 00-2 2.855V11a1 1 0 11-2 0v-.145c.001-1.625 1.126-2.954 2.767-2.999.044-.001.088-.006.133-.006zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const UnlockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" /></svg>;
const FingerPrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518 9.001 9.001 0 003.375 16.334 1 1 0 101.164-1.631 7.001 7.001 0 01-2.607-15.22zM10.56 1.107a1 1 0 10-1.12 1.895A7.002 7.002 0 0117.9 10a7.002 7.002 0 01-14.803.957 1 1 0 00-1.984.254A9.002 9.002 0 0019.9 10a9.002 9.002 0 00-9.34-8.892zm-2.484 5.37a1 1 0 101.528 1.288 3.001 3.001 0 014.288 3.75 1 1 0 101.815.836 5.001 5.001 0 00-7.63-5.874z" clipRule="evenodd" /></svg>;
const PuzzleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" /></svg>;

// Guide Modal Component
const GuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [guidePage, setGuidePage] = useState(0);

  if (!isOpen) return null;

  const step = GUIDE_STEPS[guidePage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-police-500/50 w-full max-w-lg rounded-lg shadow-[0_0_50px_rgba(14,165,233,0.2)] flex flex-col overflow-hidden relative">
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-police-100 font-bold font-mono flex items-center gap-2">
                  <HelpIcon /> 操作指引 ({guidePage + 1}/{GUIDE_STEPS.length})
                </h3>
                <button onClick={onClose} className="text-slate-500 hover:text-white"><XIcon /></button>
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
                            onClose();
                            setGuidePage(0);
                        }
                    }}
                  className="px-4 py-2 rounded text-xs font-bold bg-police-900/50 text-police-100 border border-police-700 hover:bg-police-900 transition-colors"
              >
                  {guidePage === GUIDE_STEPS.length - 1 ? '开始调查' : '下一页'}
              </button>
          </div>
      </div>
    </div>
  );
};

enum SidebarFilter {
  ALL = '全部',
  PEOPLE = '人物',
  LOCATION = '地点',
  ITEM = '物品',
  DOCS = '档案'
}

const GAME_STATE_MAP: Record<GameState, string> = {
  [GameState.INVESTIGATING]: '调查中',
  [GameState.SOLVED]: '已结案',
  [GameState.FAILED]: '调查失败'
};

const GUIDE_STEPS = [
  {
    title: "接入系统",
    icon: <PowerIcon />,
    content: "首先，在启动页输入案件编号或直接点击下方的【可用信号】接入案件。这会初始化您的侦探终端。"
  },
  {
    title: "系统概览",
    icon: <DatabaseIcon />,
    content: "欢迎使用天网档案系统。你的目标是通过检索数据库，还原案件真相。界面左侧（手机端为列表页）是【档案索引】，中间是【阅读器】，上方是【指令栏】。"
  },
  {
    title: "关键词检索",
    icon: <SearchIcon />,
    content: "在阅读档案时，点击高亮的【蓝色关键词】(仅手机端) 或在上方输入框输入关键词。系统会检索所有相关联的【新档案】。只有当线索被发现后，新档案才会解锁。"
  },
  {
    title: "深度互动",
    icon: <LockIcon />,
    content: "某些档案可能被加密或需要证物解锁。遇到【需要密码】时输入线索中找到的代码；遇到【需要物品】时，将相关证物拖入（或点击选择）即可解锁隐藏内容。"
  },
  {
    title: "动态证词",
    icon: <ChatIcon />,
    content: "嫌疑人的口供不是一成不变的。当你获得关键证据后，相关人物的档案会【更新】，解锁新的【关联询问】。请留意 NEW DATA 标记。"
  },
  {
    title: "最终结案",
    icon: <AlertIcon />,
    content: "当你理清真相后，进入【结案通道】。将档案拖入三个槽位中。只有逻辑完全闭环才能成功结案。结案通道右侧提供证据库供拖拽。"
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
  const [showGuide, setShowGuide] = useState(false);

  const handleConnect = (caseId: string) => {
    const scenario = getScenario(caseId);
    if (scenario) {
      onLaunch(scenario);
    } else {
      setError(`错误: 案件编号 '${caseId}' 未找到`);
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

       <div className="z-10 w-full max-w-2xl bg-slate-900/80 border border-police-500/50 rounded-lg p-6 md:p-10 shadow-[0_0_100px_rgba(14,165,233,0.15)] backdrop-blur-md relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-police-500 to-transparent"></div>
          
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tighter">天网档案系统</h1>
            <p className="text-police-500 text-xs md:text-sm tracking-[0.3em] uppercase mb-4">Crime Investigation Terminal</p>
            
            {/* Guide Button */}
            <button 
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-police-900/40 border border-police-500/30 text-police-300 hover:text-white hover:bg-police-900/60 hover:border-police-500 text-xs transition-all cursor-pointer"
            >
              <HelpIcon /> 新手操作指引
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-widest">手动接入 / 案件检索</label>
              <div className="flex flex-col md:flex-row gap-2">
                <input 
                  type="text" 
                  value={inputId}
                  onChange={(e) => {
                    setInputId(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect(inputId)}
                  placeholder="输入案件编号..." 
                  className="flex-1 bg-black border border-slate-700 p-4 text-white placeholder-slate-600 focus:border-police-500 outline-none transition-all uppercase"
                />
                <button 
                  onClick={() => handleConnect(inputId)}
                  className="bg-police-900 hover:bg-police-800 text-police-100 border border-police-700 px-8 py-4 md:py-0 font-bold transition-colors"
                >
                  连接系统
                </button>
              </div>
              {error && <div className="text-red-500 text-xs mt-2 animate-shake">{error}</div>}
            </div>

            <div className="pt-8 border-t border-slate-800">
               <label className="block text-xs text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 已捕获信号 (可用案件)
               </label>
               <div className="grid gap-3">
                 {AVAILABLE_CASES.map(c => (
                   <button 
                    key={c.id}
                    onClick={() => handleConnect(c.id)}
                    className="flex items-center justify-between p-4 border border-slate-800 hover:border-police-500 hover:bg-police-900/20 bg-black/50 transition-all group text-left"
                   >
                     <div className="overflow-hidden">
                       <div className="text-police-400 font-bold text-sm group-hover:text-white transition-colors truncate">{c.id}</div>
                       <div className="text-slate-400 text-xs mt-1 truncate">{c.title}</div>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity text-police-500 shrink-0 pl-2">
                        接入 {'>'}
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="absolute bottom-2 right-4 text-[10px] text-slate-700">
             系统版本 5.0.3
          </div>
       </div>

       {/* Enhanced Fictional Disclaimer */}
       <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none z-20 px-4">
          <div className="bg-orange-500/10 border border-orange-500/50 text-orange-500 px-4 py-2 rounded text-xs md:text-sm font-bold tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.3)] backdrop-blur-sm animate-pulse flex items-center gap-2">
            <AlertIcon /> 一切故事纯属虚构，请勿模仿
          </div>
       </div>

       {/* Guide Modal */}
       <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
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
  
  // Tabs State (Desktop mainly, Mobile uses conditional rendering)
  const [tabs, setTabs] = useState<string[]>([INITIAL_RECORD.id]);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_RECORD.id);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>(SidebarFilter.ALL);
  
  // Interaction State (Locks)
  const [solvedInteractions, setSolvedInteractions] = useState<string[]>([]);
  const [interactionInput, setInteractionInput] = useState('');
  
  // Mobile specific state
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'reader'>('list');
  const [selectingSlotId, setSelectingSlotId] = useState<string | null>(null); // For Accusation modal
  const [selectingInteractionId, setSelectingInteractionId] = useState<string | null>(null); // For Item Interaction modal
  
  // Read State Tracking
  const [viewedState, setViewedState] = useState<Record<string, number>>({
    [INITIAL_RECORD.id]: 0 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [gameState, setGameState] = useState<GameState>(GameState.INVESTIGATING);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Guide State
  const [showGuide, setShowGuide] = useState(false);

  // Confession Modal State
  const [showConfession, setShowConfession] = useState(false);

  // Accusation State
  const [slots, setSlots] = useState<AccusationSlot[]>([
    { id: 'culprit', label: '真凶', question: '谁是凶手？', acceptedTypes: [RecordType.SUSPECT], filledRecordId: null },
    { id: 'evidence', label: '铁证', question: '最直接的定罪证物？', acceptedTypes: [RecordType.EVIDENCE, RecordType.ITEM], filledRecordId: null },
    { id: 'motive', label: '动机', question: '凶手的杀人动机？', acceptedTypes: [RecordType.DOC], filledRecordId: null },
  ]);
  const [resultMessage, setResultMessage] = useState<string>('');

  const getUnlockedRecords = () => RECORDS.filter(r => unlockedRecordIds.includes(r.id));

  // --- Keyword Highlighting Logic ---
  const allUnlockKeywords = useMemo(() => {
    const keywords = new Set<string>();
    RECORDS.forEach(r => r.unlockKeywords.forEach(k => keywords.add(k)));
    // Sort by length descending to handle overlapping keywords correctly (e.g. "Office Key" before "Office")
    return Array.from(keywords).sort((a, b) => b.length - a.length);
  }, [RECORDS]);

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

  const executeSearch = (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;

    setErrorMsg(null);
    setNotification(null);
    const lowerQuery = query.toLowerCase().trim();

    const potentialMatches = RECORDS.filter(r => 
      r.unlockKeywords.some(k => lowerQuery.includes(k.toLowerCase()) || k.toLowerCase() === lowerQuery)
    );

    if (potentialMatches.length === 0) {
      setErrorMsg("未找到相关档案");
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
      // Add unlocked interaction content to context
      if (r.interaction && solvedInteractions.includes(r.id)) {
        combinedContext += `${r.interaction.unlockedContent} `;
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
      setErrorMsg("权限不足：暂无前置线索");
      return;
    }

    const newUnlocks = accessibleMatches.filter(r => !unlockedRecordIds.includes(r.id));

    if (newUnlocks.length > 0) {
      setUnlockedRecordIds(prev => [...prev, ...newUnlocks.map(u => u.id)]);
      setNotification(`检索成功：解密 ${newUnlocks.length} 份新档案`);
      setTimeout(() => setNotification(null), 4000);
      if (!queryOverride) setSearchQuery(''); // Only clear if user typed it
    } else {
      // Logic changed: Do not switch tabs, just notify.
      const record = accessibleMatches[0];
      setNotification(`该档案 [${record.title}] 已在列表中`);
      setTimeout(() => setNotification(null), 2000);
      // openRecord(record.id);  <-- REMOVED
      if (!queryOverride) setSearchQuery('');
    }
  };

  const handleKeywordClick = (keyword: string) => {
    // Only allow click-to-search on mobile (< 768px)
    if (window.innerWidth >= 768) return; 
    
    setSearchQuery(keyword); 
    executeSearch(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  // --- Interaction (Locks) Logic ---

  const handleInteractionSubmit = (record: DatabaseRecord) => {
     if (!record.interaction) return;

     if (record.interaction.type === 'password') {
         if (interactionInput.trim() === record.interaction.correctPassword) {
             setSolvedInteractions(prev => [...prev, record.id]);
             setNotification(record.interaction.successMessage || "解锁成功");
             setTimeout(() => setNotification(null), 3000); // Fix: Auto dismiss notification
             setInteractionInput('');
         } else {
             setErrorMsg("密码错误");
             setTimeout(() => setErrorMsg(null), 2000);
         }
     }
  };

  const handleInteractionDrop = (e: React.DragEvent, targetRecord: DatabaseRecord) => {
      e.preventDefault();
      const droppedRecordId = e.dataTransfer.getData("recordId");
      if (targetRecord.interaction && targetRecord.interaction.type === 'use-item') {
          if (droppedRecordId === targetRecord.interaction.requiredRecordId) {
              setSolvedInteractions(prev => [...prev, targetRecord.id]);
              setNotification(targetRecord.interaction.successMessage || "物品使用成功");
              setTimeout(() => setNotification(null), 3000); // Fix: Auto dismiss notification
          } else {
              setErrorMsg("该物品无效");
              setTimeout(() => setErrorMsg(null), 2000);
          }
      }
  };

  const handleInteractionSelect = (selectedRecordId: string, targetRecordId: string) => {
    const targetRecord = RECORDS.find(r => r.id === targetRecordId);
    if (!targetRecord?.interaction) return;

    if (selectedRecordId === targetRecord.interaction.requiredRecordId) {
        setSolvedInteractions(prev => [...prev, targetRecord.id]);
        setNotification(targetRecord.interaction.successMessage || "物品使用成功");
        setTimeout(() => setNotification(null), 3000); // Fix: Auto dismiss notification
    } else {
        setErrorMsg("该物品无效");
        setTimeout(() => setErrorMsg(null), 2000);
    }
    setSelectingInteractionId(null);
  };


  // --- Tab Logic ---

  const openRecord = (recordId: string) => {
    markRecordAsRead(recordId);
    
    // Desktop Tab Logic
    if (!tabs.includes(recordId)) {
      if (tabs.length < 3) {
        setTabs(prev => [...prev, recordId]);
      } else {
        setTabs(prev => [...prev.slice(1), recordId]);
      }
    }
    setActiveTabId(recordId);
    setInteractionInput(''); // Reset interaction input

    // Mobile Logic: Switch to reader view
    setMobileViewMode('reader');
  };

  const closeTab = (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(id => id !== recordId);
    setTabs(newTabs);
    if (activeTabId === recordId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : '');
    }
  };

  // --- Logic-based Hint System (Replaced AI) ---
  
  const generateHint = async () => {
    setHintMessage("正在扫描未检索的元数据...");
    setErrorMsg(null);

    // 1. Logic: Is there a solved record with an UNSOLVED interaction?
    // Meaning the user is stuck at a password or item check
    const pendingInteraction = getUnlockedRecords().find(r => r.interaction && !solvedInteractions.includes(r.id));
    if (pendingInteraction) {
       setTimeout(() => {
          setHintMessage(`检测到异常加密节点：档案 [${pendingInteraction.title}]。建议仔细检查其内容或尝试交互。`);
       }, 800);
       return;
    }

    // 2. Logic: Is there a LOCKED record whose PREREQUISITE is UNLOCKED?
    // Meaning the user has the clue but hasn't searched the keyword
    const nextSearchable = RECORDS.find(r => 
        !unlockedRecordIds.includes(r.id) && // Is currently locked
        r.prerequisiteId && // Has a prerequisite
        unlockedRecordIds.includes(r.prerequisiteId) // Parent is unlocked
    );

    if (nextSearchable) {
       const parentRecord = RECORDS.find(r => r.id === nextSearchable.prerequisiteId);
       setTimeout(() => {
          setHintMessage(`分析路径建议：重新阅读 [${parentRecord?.title}]，可能遗漏了某些关键词或地点信息。`);
       }, 800);
       return;
    }

    // 3. Logic: Default / All Clues Found
    setTimeout(() => {
       setHintMessage("数据库索引已全部遍历。所有已知线索均已显示，请尝试组合现有证据。");
    }, 800);
  };

  // --- Accusation Logic ---

  // Desktop D&D
  const handleRecordDragStart = (e: React.DragEvent, recordId: string) => {
    e.dataTransfer.setData("recordId", recordId);
  };

  const handleSlotDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const recordId = e.dataTransfer.getData("recordId");
    assignRecordToSlot(slotId, recordId);
  };

  // Mobile/Click Interaction
  const handleSlotClick = (slotId: string) => {
    setSelectingSlotId(slotId);
  };

  const assignRecordToSlot = (slotId: string, recordId: string) => {
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

  const clearSlot = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setSlots(prev => prev.map(slot => slot.id === slotId ? { ...slot, filledRecordId: null } : slot));
  };

  const handleSubmitAccusation = () => {
    const culprit = slots.find(s => s.id === 'culprit')?.filledRecordId;
    const evidence = slots.find(s => s.id === 'evidence')?.filledRecordId;
    const motive = slots.find(s => s.id === 'motive')?.filledRecordId;

    if (!culprit || !evidence || !motive) {
      setResultMessage("系统驳回：请完整填写证据链（凶手+铁证+动机）。");
      return;
    }

    const isCulpritCorrect = culprit === SOLUTION.culpritId;
    const isEvidenceCorrect = SOLUTION.validEvidenceIds.includes(evidence);
    const isMotiveCorrect = SOLUTION.validMotiveIds.includes(motive);

    if (isCulpritCorrect && isEvidenceCorrect && isMotiveCorrect) {
      setGameState(GameState.SOLVED);
      setResultMessage("结案确认：证据确凿，嫌疑人已被批捕。");
      // Optionally auto-open confession after a short delay
      setTimeout(() => setShowConfession(true), 1500);
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

  // --- Render Modals ---

  const renderConfessionModal = () => {
    if (!showConfession || !SOLUTION.confession) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-black border border-slate-700 p-8 rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]">
               {/* Decorative Top Line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
               
               <div className="mb-6 text-center border-b border-slate-800 pb-4 shrink-0">
                  <div className="text-red-500 text-xs font-mono tracking-[0.5em] uppercase mb-2">Confidential // Audio Transcript</div>
                  <h2 className="text-3xl text-white font-serif font-bold tracking-tight">罪犯自白</h2>
               </div>
               
               <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                  <div className="prose prose-invert prose-lg max-w-none font-serif leading-relaxed text-slate-300">
                      {SOLUTION.confession.split('\n').map((line, i) => (
                          <p key={i} className="mb-4">{line}</p>
                      ))}
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-800 text-center shrink-0">
                  <button 
                    onClick={() => setShowConfession(false)}
                    className="px-8 py-2 border border-slate-700 hover:border-white text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest rounded-sm"
                  >
                    关闭档案
                  </button>
               </div>
            </div>
        </div>
    );
  };

  // Mobile Record Selection Modal for Accusation AND Interactions
  const renderRecordSelectModal = () => {
    // Mode 1: Accusation Slot
    if (selectingSlotId) {
        const slot = slots.find(s => s.id === selectingSlotId);
        if (!slot) return null;
        // Allows picking any unlocked record (removed type restriction per user request)
        const validRecords = getUnlockedRecords();

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-police-500/50 w-full max-w-md rounded-lg flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-lg">
                <h3 className="text-white font-bold">选择: {slot.label}</h3>
                <button onClick={() => setSelectingSlotId(null)} className="text-slate-500 hover:text-white"><XIcon /></button>
              </div>
              <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                {validRecords.length === 0 ? (
                   <div className="text-center py-8 text-slate-500 text-sm">暂无符合该类型的线索</div>
                ) : (
                   validRecords.map(r => (
                     <div 
                       key={r.id} 
                       onClick={() => {
                         assignRecordToSlot(selectingSlotId, r.id);
                         setSelectingSlotId(null);
                       }}
                       className={`p-3 mb-2 rounded border cursor-pointer hover:bg-slate-800 transition-colors ${getRecordColor(r.type, true)}`}
                     >
                        <div className="font-bold">{r.title}</div>
                        <div className="text-xs opacity-70 mt-1">{r.id}</div>
                     </div>
                   ))
                )}
              </div>
            </div>
          </div>
        );
    }
    
    // Mode 2: Interaction Item Select
    if (selectingInteractionId) {
        const targetRecord = RECORDS.find(r => r.id === selectingInteractionId);
        // Show all items and evidence
        const validRecords = getUnlockedRecords().filter(r => r.type === RecordType.ITEM || r.type === RecordType.EVIDENCE);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-slate-900 border border-police-500/50 w-full max-w-md rounded-lg flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-lg">
                  <h3 className="text-white font-bold">选择用于解锁的物品</h3>
                  <button onClick={() => setSelectingInteractionId(null)} className="text-slate-500 hover:text-white"><XIcon /></button>
                </div>
                <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                  {validRecords.length === 0 ? (
                     <div className="text-center py-8 text-slate-500 text-sm">背包空空如也</div>
                  ) : (
                     validRecords.map(r => (
                       <div 
                         key={r.id} 
                         onClick={() => handleInteractionSelect(r.id, selectingInteractionId)}
                         className={`p-3 mb-2 rounded border cursor-pointer hover:bg-slate-800 transition-colors ${getRecordColor(r.type, true)}`}
                       >
                          <div className="font-bold">{r.title}</div>
                          <div className="text-xs opacity-70 mt-1">{r.id}</div>
                       </div>
                     ))
                  )}
                </div>
              </div>
            </div>
        );
    }

    return null;
  };

  const renderContentWithHighlights = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (!line) return <p key={i} className="mb-2 h-4"></p>;

      // Create a regex to match any of the keywords
      const parts = line.split(new RegExp(`(${allUnlockKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi'));
      
      return (
        <p key={i} className="mb-2 text-slate-300 leading-relaxed font-mono">
           {parts.map((part, index) => {
             const isKeyword = allUnlockKeywords.some(k => k.toLowerCase() === part.toLowerCase());
             if (isKeyword) {
               return (
                 <span 
                   key={index}
                   onClick={() => handleKeywordClick(part)}
                   className="text-police-400 font-bold border-b border-police-500/30 cursor-pointer hover:bg-police-500/20 hover:text-white transition-all px-0.5 rounded md:text-slate-300 md:font-normal md:border-none md:cursor-text md:hover:bg-transparent md:hover:text-slate-300 md:p-0"
                 >
                   {part}
                 </span>
               )
             }
             return <span key={index}>{part}</span>;
           })}
        </p>
      );
    });
  };

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

    const isListHiddenOnMobile = mobileViewMode === 'reader';
    const isReaderHiddenOnMobile = mobileViewMode === 'list';

    return (
      <div className="flex flex-col h-full gap-4 relative">
        {notification && (
          <div className="absolute top-16 md:top-20 left-1/2 transform -translate-x-1/2 animate-slideDown bg-police-500 text-black font-bold px-4 md:px-6 py-2 rounded shadow-[0_0_20px_rgba(14,165,233,0.6)] z-50 pointer-events-none whitespace-nowrap text-sm md:text-base">
            {notification}
          </div>
        )}
        {errorMsg && (
          <div className="absolute top-16 md:top-20 left-1/2 transform -translate-x-1/2 animate-shake bg-red-600 text-white font-bold px-4 md:px-6 py-2 rounded shadow-[0_0_20px_rgba(220,38,38,0.6)] z-50 text-sm md:text-base">
            {errorMsg}
          </div>
        )}

        {/* Command Bar */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center bg-slate-900 p-3 md:p-4 rounded-lg border border-slate-700 shadow-md shrink-0">
          <div className="text-police-500 font-mono font-bold whitespace-nowrap text-xs md:text-base flex justify-between items-center shrink-0">
             <span>{'>'} 检索:</span>
             <button onClick={generateHint} className="md:hidden flex items-center gap-1 px-2 py-1 bg-police-900/30 border border-police-700 rounded text-[10px] text-police-300">
                <SparklesIcon /> AI
             </button>
          </div>
          <div className="relative flex-1 min-w-0">
             <input 
              type="text" 
              placeholder="输入关键词..." 
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-police-100 w-full font-mono placeholder-slate-600 text-base md:text-lg"
            />
          </div>
          <button onClick={() => executeSearch()} className="hidden md:block p-2 bg-police-900/50 hover:bg-police-900 border border-police-700 rounded text-police-300 transition-colors shrink-0">
            <SearchIcon />
          </button>
          <div className="hidden md:block h-6 w-px bg-slate-700 mx-2 shrink-0"></div>
          <button onClick={generateHint} className="hidden md:flex items-center gap-2 px-3 py-1 bg-police-900/30 hover:bg-police-900 border border-police-700 rounded text-xs text-police-300 transition-colors whitespace-nowrap shrink-0">
            <SparklesIcon /> AI 分析
          </button>
        </div>

        {/* Hint */}
        {hintMessage && (
           <div className="bg-police-900/20 border border-police-800 p-2 px-4 rounded text-sm text-police-300 font-mono flex justify-between items-start md:items-center animate-fadeIn shrink-0">
             <span className="flex-1 mr-2">{hintMessage}</span>
             <button onClick={() => setHintMessage(null)} className="text-police-500 hover:text-white mt-0.5 md:mt-0"><XIcon /></button>
           </div>
        )}

        <div className="flex flex-1 gap-4 overflow-hidden relative">
          
          {/* Index Sidebar - Hidden on Mobile when in Reader mode */}
          <div className={`
             ${isListHiddenOnMobile ? 'hidden md:flex' : 'flex'}
             w-full md:w-64 bg-slate-950 border border-slate-800 rounded flex-col shrink-0
          `}>
            <div className="flex p-1 bg-slate-900 border-b border-slate-800 gap-0.5 overflow-x-auto no-scrollbar shrink-0">
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

            <div className="p-2 bg-slate-900/50 border-b border-slate-800 font-bold text-slate-500 text-[10px] tracking-wider flex justify-between shrink-0">
              <span>档案索引</span>
              <span>数量: {sortedList.length}</span>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
              {sortedList.map(record => {
                const isUnread = isRecordUnread(record);
                // Strict check: Only items that HAVE an interaction definition (target locks) get the icon.
                // Items that are keys (drag sources) do not get the icon.
                const hasPendingInteraction = record.interaction && !solvedInteractions.includes(record.id);

                return (
                  <div 
                    key={record.id}
                    onClick={() => openRecord(record.id)}
                    draggable
                    onDragStart={(e) => handleRecordDragStart(e, record.id)}
                    className={`p-3 md:p-2 rounded cursor-pointer border-l-2 transition-all group relative ${
                      tabs.includes(record.id)
                      ? 'bg-slate-800 ' + getRecordColor(record.type, isUnread)
                      : 'bg-transparent border-transparent hover:bg-slate-900 ' + (isUnread ? 'text-white' : 'text-slate-500 hover:text-slate-300')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-sm truncate font-bold ${isUnread ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : ''}`}>
                        {record.title}
                      </span>
                      <div className="flex items-center gap-1">
                          {/* Unsolved Interaction Badge */}
                          {hasPendingInteraction && (
                             <span title="存在未解锁内容" className="text-yellow-500 animate-pulse">
                                <PuzzleIcon />
                             </span>
                          )}
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-police-500 animate-pulse shadow-[0_0_8px_#0ea5e9]"></span>
                          )}
                      </div>
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

          {/* Main Viewer - Hidden on Mobile when in List mode */}
          <div className={`
             ${isReaderHiddenOnMobile ? 'hidden md:flex' : 'flex'}
             flex-1 flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative shadow-2xl
          `}>
            {/* Desktop Tabs */}
            <div className="hidden md:flex bg-black border-b border-slate-700 h-10 items-end px-2 gap-1 overflow-x-auto shrink-0">
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

            {/* Mobile Reader Header */}
            <div className="md:hidden flex items-center p-2 bg-slate-950 border-b border-slate-800 text-slate-400 shrink-0">
                 <button onClick={() => setMobileViewMode('list')} className="flex items-center gap-1 text-xs px-2 py-1 hover:text-white">
                    <BackIcon /> 返回列表
                 </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900 custom-scrollbar relative">
              {activeRecord ? (
                <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-800 pb-6 mb-6 gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-white font-mono mb-2 leading-tight">{activeRecord.title}</h1>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${getRecordBadgeColor(activeRecord.type)}`}>
                          {getRecordDisplayType(activeRecord.type)}
                        </span>
                        <span className="bg-slate-950 text-slate-500 text-xs px-2 py-1 rounded border border-slate-800">
                          编号: {activeRecord.id}
                        </span>
                        <span className="bg-slate-950 text-police-500 text-xs px-2 py-1 rounded border border-slate-800">
                          密级: {activeRecord.accessLevel}
                        </span>
                      </div>
                    </div>
                    {activeRecord.imageUrl && (
                      <img src={activeRecord.imageUrl} className="w-full md:w-24 h-40 md:h-24 rounded border border-slate-700 object-cover grayscale opacity-80" />
                    )}
                  </div>
                  
                  <div className="prose prose-invert prose-base md:prose-lg max-w-none font-mono">
                     {renderContentWithHighlights(activeRecord.content)}
                  </div>

                  {/* Interaction / Lock Section */}
                  {activeRecord.interaction && (
                     <div className="mt-8 border border-police-900 bg-slate-950/50 p-6 rounded-lg shadow-inner">
                        <div className="flex items-center gap-2 mb-4 text-police-400 font-bold">
                           {solvedInteractions.includes(activeRecord.id) ? <UnlockIcon /> : <LockIcon />}
                           {solvedInteractions.includes(activeRecord.id) ? "已解锁" : "加密内容"}
                        </div>

                        {solvedInteractions.includes(activeRecord.id) ? (
                            <div className="animate-fadeIn prose prose-invert prose-base md:prose-lg font-mono p-4 bg-police-900/10 border-l-4 border-police-500">
                                {renderContentWithHighlights(activeRecord.interaction.unlockedContent)}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-slate-400 font-mono">{activeRecord.interaction.hintText}</p>
                                
                                {activeRecord.interaction.type === 'password' && (
                                    <div className="flex gap-2 max-w-sm">
                                        <input 
                                            type="text" 
                                            value={interactionInput}
                                            onChange={(e) => setInteractionInput(e.target.value)}
                                            className="bg-black border border-slate-700 p-2 text-white font-mono flex-1 outline-none focus:border-police-500"
                                            placeholder="输入密码"
                                        />
                                        <button 
                                            onClick={() => handleInteractionSubmit(activeRecord)}
                                            className="bg-police-900 text-white px-4 border border-police-700 hover:bg-police-800"
                                        >
                                            解密
                                        </button>
                                    </div>
                                )}

                                {activeRecord.interaction.type === 'use-item' && (
                                    <div 
                                        onDrop={(e) => handleInteractionDrop(e, activeRecord)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() => setSelectingInteractionId(activeRecord.id)}
                                        className="border-2 border-dashed border-slate-700 bg-black/50 rounded p-8 text-center cursor-pointer hover:border-police-500 hover:bg-police-900/10 transition-all group"
                                    >
                                        <div className="text-slate-500 group-hover:text-police-400 mb-2">
                                            <DragIcon />
                                        </div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest">
                                            <span className="hidden md:inline">拖入相关证物以解锁</span>
                                            <span className="md:hidden">点击选择证物以解锁</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>
                  )}

                  {/* Dynamic Cross Examination Section */}
                  {activeRecord.crossExamination && (
                    <div className="mt-8 md:mt-12 pt-8 border-t border-slate-800">
                      <h3 className="text-lg md:text-xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                         <ChatIcon /> 关联询问
                      </h3>
                      <div className="grid gap-4">
                        {activeRecord.crossExamination.map((item, idx) => {
                          // Allow showing if trigger is a special 'DEFAULT' or unlocked record
                          const isUnlocked = item.triggerRecordId === 'DEFAULT' || unlockedRecordIds.includes(item.triggerRecordId);
                          
                          if (!isUnlocked) return null;

                          return (
                            <div key={idx} className={`p-4 rounded border transition-all bg-slate-950 border-police-900`}>
                                <div className="text-xs font-bold font-mono mb-2 uppercase tracking-wider text-slate-500">
                                   {item.topic}
                                </div>
                                <div className={`font-mono text-sm leading-6 text-police-100`}>
                                   {renderContentWithHighlights(item.content)}
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
                  <p className="mt-4 font-mono text-sm">等待指令输入 / 检索中...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
        {renderConfessionModal()}
        {renderRecordSelectModal()}
      </div>
    );
  };

  const renderAccusation = () => {
      const unlockedRecords = getUnlockedRecords();

      return (
          <div className="flex flex-col md:flex-row h-full bg-slate-900 overflow-hidden relative">
              <button 
                  onClick={() => setCurrentPage(Page.DATABASE)}
                  className="absolute top-4 left-4 flex items-center gap-2 text-slate-400 hover:text-white z-50 bg-slate-900/50 px-2 py-1 rounded"
              >
                  <BackIcon /> 返回
              </button>

              {/* Main Accusation Area (Left/Top) */}
              <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
                  <div className="text-center mb-6 md:mb-10 pt-10 md:pt-0">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                          <AlertIcon /> 结案通道
                      </h2>
                      <p className="text-slate-500 font-mono text-sm">从右侧证据库中拖入线索以构建证据链</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mb-8">
                      {slots.map(slot => {
                          const filledRecord = RECORDS.find(r => r.id === slot.filledRecordId);
                          return (
                              <div 
                                  key={slot.id}
                                  className="bg-black/50 border border-slate-700 p-6 rounded-lg flex flex-col items-center text-center relative group min-h-[160px] transition-colors"
                                  onDrop={(e) => handleSlotDrop(e, slot.id)}
                                  onDragOver={(e) => e.preventDefault()}
                                  onClick={() => handleSlotClick(slot.id)}
                              >
                                  <div className="text-police-500 font-bold mb-4 uppercase tracking-widest text-sm">{slot.label}</div>
                                  
                                  {filledRecord ? (
                                      <div className="w-full">
                                          <div className={`p-3 rounded border mb-2 ${getRecordColor(filledRecord.type, true)}`}>
                                              <div className="font-bold truncate text-sm">{filledRecord.title}</div>
                                          </div>
                                          <button 
                                              onClick={(e) => clearSlot(e, slot.id)}
                                              className="text-slate-500 hover:text-red-500 text-xs flex items-center justify-center gap-1 mx-auto"
                                          >
                                              <XIcon /> 移除
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded w-full p-4 group-hover:border-police-500/50 transition-colors">
                                          <div className="mb-2"><DragIcon /></div>
                                          <div className="text-xs">{slot.question}</div>
                                          <div className="text-[10px] mt-2 opacity-50 md:hidden block">点击选择</div>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>

                  <div className="flex flex-col items-center gap-4 mt-auto pb-4">
                      <button 
                          onClick={handleSubmitAccusation}
                          className="bg-red-900/80 hover:bg-red-800 text-white px-10 py-3 rounded border border-red-700 font-bold tracking-widest text-lg shadow-[0_0_20px_rgba(153,27,27,0.4)] transition-all"
                      >
                          提交审查
                      </button>
                      
                      {resultMessage && (
                          <div className={`text-sm font-bold font-mono p-2 px-4 rounded ${gameState === GameState.SOLVED ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                              {resultMessage}
                          </div>
                      )}
                  </div>
              </div>

              {/* Evidence Locker (Right/Bottom) */}
              <div className="w-full md:w-80 bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0 h-1/3 md:h-auto z-10 shadow-2xl">
                 <div className="p-3 border-b border-slate-800 bg-black/50 font-bold text-slate-400 text-xs tracking-widest uppercase flex items-center justify-between">
                    <span>证据库 // Evidence Locker</span>
                    <span className="text-police-500">{unlockedRecords.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                     <div className="grid grid-cols-1 gap-2">
                        {unlockedRecords.map(r => (
                            <div 
                                key={r.id}
                                draggable
                                onDragStart={(e) => handleRecordDragStart(e, r.id)}
                                className={`p-2 rounded border cursor-grab active:cursor-grabbing text-xs flex flex-col gap-1 hover:bg-slate-900 transition-colors ${getRecordColor(r.type, true)}`}
                            >
                                <div className="font-bold truncate">{r.title}</div>
                                <div className="flex justify-between items-center opacity-70">
                                    <span className="font-mono">{r.id}</span>
                                    <span className={`px-1 rounded text-[9px] ${getRecordBadgeColor(r.type)}`}>{getRecordDisplayType(r.type)}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
              </div>
          </div>
      )
  };

  return (
    <div className="h-screen w-screen bg-black text-slate-300 font-sans overflow-hidden flex flex-col">
        {/* Header - Only show if not in Accusation mode to save space, or simplify */}
        <div className={`h-12 md:h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-20 ${currentPage === Page.ACCUSATION ? 'hidden' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="font-bold text-police-500 tracking-wider text-sm md:text-base flex items-center gap-2">
                    <div className="w-2 h-2 bg-police-500 rounded-full animate-pulse"></div>
                    {SYSTEM_NAME}
                </div>
                <div className="h-4 w-px bg-slate-800"></div>
                <div className="text-xs text-slate-500 font-mono hidden md:block">
                    CASE: {scenario.caseId} // STATUS: {GAME_STATE_MAP[gameState]}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button 
                    onClick={() => setShowGuide(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="操作指引"
                >
                    <HelpIcon />
                </button>
                
                <button 
                    onClick={() => setCurrentPage(prev => prev === Page.DATABASE ? Page.ACCUSATION : Page.DATABASE)}
                    className={`
                        px-3 py-1.5 rounded text-xs font-bold border transition-all flex items-center gap-2
                        ${currentPage === Page.ACCUSATION 
                            ? 'bg-slate-800 text-white border-slate-600' 
                            : 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/40 hover:border-red-500'
                        }
                    `}
                >
                    <AlertIcon />
                    {currentPage === Page.ACCUSATION ? '返回档案' : '申请结案'}
                </button>

                <div className="h-4 w-px bg-slate-800"></div>
                
                <button 
                    onClick={onExit}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-500 transition-colors"
                >
                    <PowerIcon />
                    <span className="hidden md:inline">断开连接</span>
                </button>
            </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-hidden relative">
            {currentPage === Page.DATABASE && renderDatabase()}
            {currentPage === Page.ACCUSATION && renderAccusation()}
        </div>

        {/* Modals */}
        <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
        {renderConfessionModal()}
        {renderRecordSelectModal()}
    </div>
  );
};

const App: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<CaseScenario | null>(null);

  return (
    <>
      {!activeScenario ? (
        <Launcher onLaunch={setActiveScenario} />
      ) : (
        <GameInterface 
          scenario={activeScenario} 
          onExit={() => setActiveScenario(null)} 
        />
      )}
    </>
  );
};

export default App;
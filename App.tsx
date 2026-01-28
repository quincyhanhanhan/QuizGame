import React, { useState, useEffect } from 'react';
import { 
  DatabaseRecord, 
  Page, 
  RecordType, 
  GameState,
  AccusationSlot
} from './types';
import { 
  RECORDS, 
  SYSTEM_NAME, 
  CASE_ID, 
  SOLUTION,
  INITIAL_RECORD
} from './constants';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;
const DragIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>;

enum SidebarFilter {
  ALL = '全部',
  PEOPLE = '人物',
  LOCATION = '地点',
  ITEM = '物品',
  DOCS = '档案'
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DATABASE);
  const [unlockedRecordIds, setUnlockedRecordIds] = useState<string[]>(
    RECORDS.filter(r => r.isInitial).map(r => r.id)
  );
  
  // Tabs State
  const [tabs, setTabs] = useState<string[]>([INITIAL_RECORD.id]);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_RECORD.id);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>(SidebarFilter.ALL);
  
  // Read State Tracking
  // Key: Record ID, Value: Number of cross-examinations visible when last viewed
  const [viewedState, setViewedState] = useState<Record<string, number>>({
    [INITIAL_RECORD.id]: 0 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [gameState, setGameState] = useState<GameState>(GameState.INVESTIGATING);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Accusation State
  const [slots, setSlots] = useState<AccusationSlot[]>([
    { id: 'culprit', label: '真凶', question: '谁是凶手？', acceptedTypes: [RecordType.SUSPECT], filledRecordId: null },
    { id: 'evidence', label: '铁证', question: '最直接的定罪证物？', acceptedTypes: [RecordType.EVIDENCE, RecordType.ITEM], filledRecordId: null },
    { id: 'motive', label: '动机', question: '凶手的杀人动机？', acceptedTypes: [RecordType.DOC], filledRecordId: null },
  ]);
  const [resultMessage, setResultMessage] = useState<string>('');

  const getUnlockedRecords = () => RECORDS.filter(r => unlockedRecordIds.includes(r.id));

  // --- Read/Unread Logic ---
  
  // Calculate how many cross-examinations are currently unlocked for a given record
  const getVisibleCrossExamsCount = (record: DatabaseRecord) => {
    if (!record.crossExamination) return 0;
    return record.crossExamination.filter(ce => unlockedRecordIds.includes(ce.triggerRecordId)).length;
  };

  const isRecordUnread = (record: DatabaseRecord) => {
    // 1. If never viewed, it's unread
    if (viewedState[record.id] === undefined) return true;
    
    // 2. If viewed, but now has MORE visible cross-exams than before, it's "updated"
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
    const bgOpacity = isUnread ? 'bg-opacity-20' : 'bg-opacity-5';

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

    // 1. Identify potential matches in database
    const potentialMatches = RECORDS.filter(r => 
      r.unlockKeywords.some(k => lowerQuery.includes(k.toLowerCase()) || k.toLowerCase() === lowerQuery)
    );

    if (potentialMatches.length === 0) {
      setErrorMsg("系统未找到该关键词的相关档案");
      return;
    }

    // 2. Validate availability based on Context OR Prerequisite
    const unlockedRecords = getUnlockedRecords();
    
    // Construct Combined Context: Title + Main Content + UNLOCKED Cross-Examinations
    let combinedContext = "";
    unlockedRecords.forEach(r => {
      combinedContext += `${r.title} ${r.content} `;
      if (r.crossExamination) {
        // Only include cross-examinations where the trigger record is ALREADY unlocked
        r.crossExamination.forEach(ce => {
           if (unlockedRecordIds.includes(ce.triggerRecordId)) {
             combinedContext += `${ce.topic} ${ce.content} `;
           }
        });
      }
    });
    combinedContext = combinedContext.toLowerCase();

    const accessibleMatches = potentialMatches.filter(targetRecord => {
      // Rule 1: Prerequisite Met
      const prereqMet = !targetRecord.prerequisiteId || unlockedRecordIds.includes(targetRecord.prerequisiteId);
      
      // Rule 2: Contextual Discovery (Recursive)
      // Check if keywords are mentioned in the FULL context (including unlocked testimonies)
      const mentionedInContext = targetRecord.unlockKeywords.some(keyword => 
        combinedContext.includes(keyword.toLowerCase())
      );

      return prereqMet || mentionedInContext;
    });

    if (accessibleMatches.length === 0) {
      setErrorMsg("权限不足：系统档案中暂无此前置线索记录");
      return;
    }

    // 3. Process Valid Matches
    const newUnlocks = accessibleMatches.filter(r => !unlockedRecordIds.includes(r.id));

    if (newUnlocks.length > 0) {
      setUnlockedRecordIds(prev => [...prev, ...newUnlocks.map(u => u.id)]);
      
      // Updated logic: Do NOT automatically open the record. Just notify.
      setNotification(`检索成功：解密 ${newUnlocks.length} 份新档案 (请查看侧边栏)`);
      setTimeout(() => setNotification(null), 4000);
      
      // Clear search query
      setSearchQuery('');
    } else {
      // If already unlocked, we can just highlight it via notification, no need to switch tab if not desired.
      // But maybe switching to existing record is fine? 
      // The user prompt said: "unlocking NEW entries... do not automatically open".
      // For existing entries, it's usually good UX to navigate to it.
      const record = accessibleMatches[0];
      setNotification(`档案 [${record.title}] 已存在`);
      setTimeout(() => setNotification(null), 2000);
      openRecord(record.id); // We still open existing ones to help navigation
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
    // Mark as read immediately upon opening
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

  // --- Hint Logic ---
  
  const generateHint = () => {
    const nextLocked = RECORDS.find(r => 
      !unlockedRecordIds.includes(r.id) && 
      r.prerequisiteId && 
      unlockedRecordIds.includes(r.prerequisiteId)
    );

    if (nextLocked && nextLocked.prerequisiteId) {
      const parentRecord = RECORDS.find(r => r.id === nextLocked.prerequisiteId);
      if (parentRecord) {
        setHintMessage(`线索提示：请仔细阅读 [${parentRecord.title}] 中的细节描述，特别是大写或括号内的名词。`);
        return;
      }
    }
    setHintMessage("当前无可用的进一步检索建议。");
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
        // Modified to allow any record type
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

  // --- Render Helpers ---

  const renderDatabase = () => {
    const activeRecord = RECORDS.find(r => r.id === activeTabId);

    // Sort logic
    const sortedList = [...getFilteredRecords()].sort((a, b) => {
        // Always put system first if All
        if (a.type === RecordType.SYSTEM) return -1;
        if (b.type === RecordType.SYSTEM) return 1;
        
        // Put Unread Items at the top of their categories
        const aUnread = isRecordUnread(a);
        const bUnread = isRecordUnread(b);
        if (aUnread && !bUnread) return -1;
        if (!aUnread && bUnread) return 1;
        
        return 0; 
    });

    return (
      <div className="flex flex-col h-full gap-4 relative">
        {/* Toasts */}
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
          <button 
            onClick={executeSearch}
            className="p-2 bg-police-900/50 hover:bg-police-900 border border-police-700 rounded text-police-300 transition-colors"
          >
            <SearchIcon />
          </button>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <button 
            onClick={generateHint}
            className="flex items-center gap-2 px-3 py-1 bg-police-900/30 hover:bg-police-900 border border-police-700 rounded text-xs text-police-300 transition-colors whitespace-nowrap"
          >
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
            {/* Filter Tabs */}
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
                 <div className="text-center text-slate-600 text-xs py-8 italic">
                   无相关档案
                 </div>
              )}
            </div>
          </div>

          {/* Main Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-black border-b border-slate-700 h-10 items-end px-2 gap-1 overflow-x-auto">
               {tabs.map((tabId, index) => {
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

  const renderAccusation = () => (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Draggable Pool */}
      <div className="w-64 flex flex-col gap-4">
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 h-full overflow-hidden flex flex-col">
          <h3 className="text-police-100 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider p-2 border-b border-slate-800">
            <DatabaseIcon /> 已发现线索
          </h3>
          <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar p-1">
            {getUnlockedRecords().filter(r => r.type !== RecordType.SYSTEM).map(record => (
              <div
                key={record.id}
                draggable={gameState === GameState.INVESTIGATING}
                onDragStart={(e) => handleRecordDragStart(e, record.id)}
                className={`p-2.5 rounded border cursor-grab active:cursor-grabbing hover:border-white transition-colors group ${getRecordColor(record.type, false)}`}
              >
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold truncate">{record.title}</span>
                   <DragIcon />
                </div>
                <div className="text-[10px] opacity-70 font-mono mt-1 flex justify-between">
                  <span>{record.id}</span>
                  <span className="uppercase">{getRecordDisplayType(record.type)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
         {gameState === GameState.INVESTIGATING ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-red-500 flex items-center justify-center gap-3">
                  <AlertIcon /> 最终结案指控
                </h2>
                <p className="text-slate-400 text-sm mt-2">请将右侧关键证据拖入下方对应插槽</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {slots.map(slot => {
                  const filledRecord = RECORDS.find(r => r.id === slot.filledRecordId);
                  return (
                    <div 
                      key={slot.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleSlotDrop(e, slot.id)}
                      className={`relative p-4 rounded-lg border-2 border-dashed transition-all h-64 flex flex-col ${
                        filledRecord 
                          ? 'bg-slate-900 border-police-500/50' 
                          : 'bg-slate-950/50 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <h3 className="text-xs font-bold text-police-500 uppercase tracking-wider mb-2 text-center">{slot.label}</h3>
                      <p className="text-sm text-slate-300 font-bold mb-4 text-center px-2 flex-1 flex items-center justify-center">{slot.question}</p>
                      
                      {filledRecord ? (
                        <div className={`border p-3 rounded flex flex-col items-center animate-fadeIn gap-2 w-full ${getRecordColor(filledRecord.type, false)}`}>
                          <div className="w-full text-center">
                            <span className="block font-mono font-bold truncate">{filledRecord.title}</span>
                            <span className="text-[10px] opacity-70">{getRecordDisplayType(filledRecord.type)}</span>
                          </div>
                          <button 
                            onClick={() => clearSlot(slot.id)}
                            className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20"
                          >
                            撤销
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 flex items-center justify-center text-slate-600 text-xs italic bg-black/20 rounded mx-4 mb-4">
                           [ 拖入档案 ]
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleSubmitAccusation}
                className="w-full mt-8 bg-red-900/80 hover:bg-red-800 text-white font-bold py-4 rounded border border-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] tracking-widest text-lg"
              >
                提交报告
              </button>
            </div>
         ) : (
           <div className={`p-8 rounded-lg border text-center animate-bounce-in ${
             gameState === GameState.SOLVED 
               ? 'bg-green-950/30 border-green-500 text-green-100' 
               : 'bg-red-950/30 border-red-500 text-red-100'
           }`}>
             <h2 className="text-4xl font-bold mb-4">{gameState === GameState.SOLVED ? 'SUCCESS' : 'FAILED'}</h2>
             <div className="text-xl mb-8 font-mono">{resultMessage}</div>
             {gameState === GameState.SOLVED && (
                <div className="text-sm font-mono text-green-300 bg-green-900/20 p-6 rounded border border-green-900/50 text-left leading-relaxed">
                   <h4 className="font-bold mb-2 text-green-500">案件复盘：</h4>
                   {SOLUTION.explanation}
                </div>
             )}
              <button 
                 onClick={() => {
                   setGameState(GameState.INVESTIGATING);
                   setSlots(prev => prev.map(s => ({...s, filledRecordId: null})));
                   setResultMessage('');
                 }}
                 className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors font-bold"
               >
                 重启系统
               </button>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-police-500 selection:text-white flex flex-col">
      <header className="border-b border-police-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-police-900 rounded border border-police-500 flex items-center justify-center">
              <div className="w-3 h-3 bg-police-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="font-mono font-bold text-police-100 tracking-wider text-lg hidden md:block">{SYSTEM_NAME}</h1>
            <h1 className="font-mono font-bold text-police-100 tracking-wider text-lg md:hidden">Skynet</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Page.DATABASE)}
              className={`px-4 py-1.5 rounded text-sm font-mono transition-colors flex items-center gap-2 ${
                currentPage === Page.DATABASE 
                  ? 'bg-police-900 text-police-100 border border-police-700' 
                  : 'text-slate-500 hover:text-police-300'
              }`}
            >
              <DatabaseIcon /> 档案检索
            </button>
            <button 
              onClick={() => setCurrentPage(Page.ACCUSATION)}
              className={`ml-2 px-4 py-1.5 rounded text-sm font-mono transition-colors flex items-center gap-2 border ${
                currentPage === Page.ACCUSATION
                  ? 'bg-red-950 text-red-100 border-red-700'
                  : 'text-red-500 border-red-900/30 hover:bg-red-950/30'
              }`}
            >
              <AlertIcon /> 结案通道
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 overflow-hidden flex flex-col h-[calc(100vh-64px)]">
        {currentPage === Page.DATABASE && renderDatabase()}
        {currentPage === Page.ACCUSATION && renderAccusation()}
      </main>
    </div>
  );
};

export default App;
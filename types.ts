export enum RecordType {
  SYSTEM = '系统通告',
  SUSPECT = '嫌疑人', // Red
  EVIDENCE = '关键证据', // Purple (High importance items)
  ITEM = '物品', // Yellow (Interactable objects)
  LOCATION = '地点', // Green
  DOC = '文件档案', // Blue
  AUTOPSY = '法医报告' // Gray
}

export enum GameState {
  INVESTIGATING = 'INVESTIGATING',
  SOLVED = 'SOLVED',
  FAILED = 'FAILED'
}

export interface CrossExamination {
  triggerRecordId: string; // The ID of the clue that unlocks this dialogue (e.g., ID of 'Whiskey')
  topic: string;           // Display title, e.g. "关于：威士忌"
  content: string;         // The testimony
}

export interface DatabaseRecord {
  id: string;
  type: RecordType;
  title: string;
  content: string;
  tags: string[]; 
  imageUrl?: string;
  accessLevel: number;
  
  // Game mechanics
  isInitial?: boolean;
  unlockKeywords: string[]; // Aliases. e.g. ['office', '42f', 'ceo room']
  prerequisiteId?: string; 
  
  // New: Dynamic Testimony logic
  crossExamination?: CrossExamination[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  DATABASE = 'DATABASE',
  ACCUSATION = 'ACCUSATION'
}

export interface AccusationSlot {
  id: 'culprit' | 'evidence' | 'motive';
  label: string;
  question: string;
  acceptedTypes: RecordType[];
  filledRecordId: string | null;
}
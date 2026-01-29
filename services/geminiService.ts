import { GoogleGenAI } from "@google/genai";
import { Message, DatabaseRecord } from "../types";

// Helper to format the context for the AI
// Now accepts records and scenario details dynamically
const getSystemInstruction = (records: DatabaseRecord[], caseTitle: string, initialBrief: string) => {
  const recordsText = records.map(r => 
    `[ID: ${r.id} | 类型: ${r.type} | 标题: ${r.title}]\n内容: ${r.content}\n标签: ${r.tags.join(', ')}`
  ).join('\n---\n');

  return `
    你是一个名为 "Sherlock-9000" 的警用虚拟AI助手。
    你的任务是帮助侦探（用户）解决 "${caseTitle}"。
    
    以下是案件的基础信息和数据库中的所有记录（有些用户可能还没搜到，但你知道）：
    ${initialBrief}
    
    数据库记录：
    ${recordsText}
    
    行为准则：
    1. 你的语气应该是冷静、专业、稍带一点赛博朋克风格的。
    2. 绝不要直接告诉用户凶手是谁。
    3. 如果用户询问线索，引导他们去搜索特定的关键词，或者提示他们注意某些档案之间的联系（比如时间线矛盾、物理位置关系）。
    4. 当用户提出假设时，根据数据库中的事实进行逻辑验证，指出其中的漏洞或支持点。
    5. 你的回答应该简短有力，不要长篇大论。
    6. 如果用户问到无关的问题，礼貌地将话题带回案件。
  `;
};

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string,
  scenarioContext: {
    records: DatabaseRecord[],
    caseTitle: string,
    initialBrief: string
  }
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "系统错误：未检测到 API 密钥。无法连接至 AI 核心。";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const recentHistory = history.slice(-6); // Last 6 messages
    
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: getSystemInstruction(
          scenarioContext.records, 
          scenarioContext.caseTitle, 
          scenarioContext.initialBrief
        ),
        temperature: 0.7,
      }
    });

    let promptContext = "";
    if (recentHistory.length > 0) {
      promptContext = "之前的对话记录:\n" + recentHistory.map(m => `${m.role === 'user' ? '侦探' : 'AI'}: ${m.text}`).join('\n') + "\n\n";
    }

    const response = await chat.sendMessage({
      message: promptContext + "侦探现在问: " + newMessage
    });

    return response.text || "数据传输中断...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "连接失败：AI 核心响应超时或发生未知错误。";
  }
};
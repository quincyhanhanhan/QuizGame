import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";
import { RECORDS, CASE_TITLE, INITIAL_BRIEF_TEXT } from "../constants";

// Helper to format the context for the AI
const getSystemInstruction = () => {
  const recordsText = RECORDS.map(r => 
    `[ID: ${r.id} | 类型: ${r.type} | 标题: ${r.title}]\n内容: ${r.content}\n标签: ${r.tags.join(', ')}`
  ).join('\n---\n');

  return `
    你是一个名为 "Sherlock-9000" 的警用虚拟AI助手。
    你的任务是帮助侦探（用户）解决 "${CASE_TITLE}"。
    
    以下是案件的基础信息和数据库中的所有记录（有些用户可能还没搜到，但你知道）：
    ${INITIAL_BRIEF_TEXT}
    
    数据库记录：
    ${recordsText}
    
    行为准则：
    1. 你的语气应该是冷静、专业、稍带一点赛博朋克风格的。
    2. 绝不要直接告诉用户凶手是谁（是陈默）。
    3. 如果用户询问线索，引导他们去搜索特定的关键词，或者提示他们注意某些档案之间的联系（比如时间线矛盾、物理位置关系）。
    4. 当用户提出假设时，根据数据库中的事实进行逻辑验证，指出其中的漏洞或支持点。
    5. 你的回答应该简短有力，不要长篇大论。
    6. 如果用户问到无关的问题，礼貌地将话题带回案件。
  `;
};

export const sendMessageToGemini = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "系统错误：未检测到 API 密钥。无法连接至 AI 核心。";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the prompt history
    // We only send the last few messages to save tokens and keep context relevant, 
    // but we always inject the system instruction implicitly via the model config or prompt structure.
    
    const recentHistory = history.slice(-6); // Last 6 messages
    
    // Create a chat session
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7,
      }
    });

    // Replay history to state (simplified for this demo, ideally we map strictly)
    // Note: The SDK chat history management is automatic if we keep the same chat instance,
    // but here we are stateless between calls so we might need to rely on the prompt context if we don't persist 'chat' object.
    // However, for a simple game, sending the transcript in the message or using a fresh chat with instruction is often enough 
    // if we don't need deep multi-turn memory beyond what we pass.
    
    // Let's optimize: We will just send the user message. 
    // To maintain conversation continuity in a stateless function, we usually prepend history.
    // However, for this implementation, let's try to trust the system prompt + current query 
    // or construct a manual history string if complex. 
    
    // Better approach for this specific constrained environment:
    // Create a new chat, add history manually if needed, or just treat each query as independent with context.
    // Let's try to add history to the prompt text for context.
    
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
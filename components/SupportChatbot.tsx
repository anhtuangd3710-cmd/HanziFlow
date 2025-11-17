'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { getApiKey } from '@/lib/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { id: 1, text: 'Làm sao để tạo bộ từ vựng?', emoji: '📚' },
  { id: 2, text: 'Các chế độ học là gì?', emoji: '🎮' },
  { id: 3, text: 'Hệ thống SRS hoạt động như thế nào?', emoji: '🧠' },
  { id: 4, text: 'Cách sử dụng AI tạo bộ từ?', emoji: '🤖' },
];

const SYSTEM_CONTEXT = `Bạn là trợ lý ảo thông minh của HanziFlow - ứng dụng học tiếng Trung với Hán tự.

**Thông tin về HanziFlow:**

📚 **Tính năng chính:**
- Tạo và quản lý bộ từ vựng (Hán tự, Pinyin, Nghĩa tiếng Việt)
- 6 chế độ học: Flashcard, Matching, Writing, Lightning Quiz, Quiz, Mixed Study
- Hệ thống SRS (Spaced Repetition System) thông minh
- AI Generator tạo bộ từ tự động từ chủ đề (dùng Gemini)
- Hệ thống Level & Huy hiệu gamification
- Theo dõi tiến độ chi tiết với biểu đồ
- Community: Chia sẻ và sao chép bộ từ
- Audio Player: Nghe phát âm chuẩn
- Leaderboard & Streak system
- Đây là link trang web: https://hanzi-flow-psi.vercel.app/

🎮 **Các chế độ học:**
1. **Flashcard** - Lật thẻ để học từ vựng cơ bản
2. **Matching** - Ghép từ Hán tự với nghĩa tương ứng
3. **Writing** - Luyện viết Hán tự bằng tay
4. **Lightning Quiz** - Trả lời nhanh trong thời gian giới hạn
5. **Quiz** - Kiểm tra tổng hợp với nhiều dạng câu hỏi
6. **Mixed Study** - Kết hợp tất cả 5 chế độ theo thứ tự

🧠 **Hệ thống SRS:**
- New: Từ mới chưa học
- Learning: Đang học (< 1 ngày)
- Young: Đã học (1-21 ngày)
- Mature: Thành thạo (> 21 ngày)
- Trả lời đúng → Tăng interval ôn tập
- Trả lời sai → Quay về Learning

🤖 **AI Generator:**
- Nhập chủ đề (ví dụ: "động vật", "gia đình")
- Chọn số lượng từ (5-30)
- Chọn độ khó HSK (1-6)
- Cần Gemini API Key trong Settings

**Vai trò của bạn:**
- Trả lời mọi câu hỏi về cách sử dụng HanziFlow
- Hướng dẫn chi tiết các tính năng
- Đưa ra mẹo học tiếng Trung hiệu quả
- Giải thích các khái niệm (SRS, HSK, Pinyin...)
- Khuyến khích và động viên người học
- Trả lời ngắn gọn, rõ ràng, thân thiện
- Sử dụng emoji phù hợp
- Nếu không biết, hãy thừa nhận và đề xuất liên hệ support

Hãy trả lời bằng tiếng Việt, ngắn gọn và hữu ích!`;

// Get Gemini API client
const getGeminiClient = async () => {
  let apiKey: string | null = null;

  // Try to get user's API key from backend
  if (typeof window !== 'undefined') {
    try {
      const response = await getApiKey();
      apiKey = response.apiKey;
    } catch (error) {
      console.warn("Could not fetch user API key from backend:", error);
    }
  }

  // Fallback to environment variable if no user key
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
  }
  
  if (!apiKey) {
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};

// Generate AI response using Gemini
const generateAIResponse = async (question: string, conversationHistory: Message[]): Promise<string> => {
  try {
    const client = await getGeminiClient();
    
    if (!client) {
      return '⚠️ **Cần API Key:**\n\nĐể sử dụng trợ lý AI thông minh, bạn cần cài đặt Gemini API Key:\n\n1. Vào **Profile** (góc trên bên phải)\n2. Kéo xuống phần "Gemini API Configuration"\n3. Làm theo hướng dẫn để lấy API Key miễn phí\n4. Nhập và lưu API Key\n5. Quay lại chat với tôi!\n\n💡 Tạm thời, hãy chọn các câu hỏi nhanh bên dưới.';
    }

    // Build conversation history for context
    const historyContext = conversationHistory
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const prompt = `${SYSTEM_CONTEXT}

**Lịch sử hội thoại:**
${historyContext}

**Câu hỏi mới từ user:**
${question}

**Hãy trả lời ngắn gọn (dưới 300 từ), hữu ích và thân thiện:**`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    return response.text?.trim() || '❌ Xin lỗi, tôi không thể tạo câu trả lời lúc này. Vui lòng thử lại!';
  } catch (error) {
    console.error('Gemini API error:', error);
    return '❌ Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra API Key hoặc thử lại sau.';
  }
};

const SupportChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Xin chào! Tôi là trợ lý AI của HanziFlow. Tôi có thể giúp bạn về mọi thứ liên quan đến việc học tiếng Trung trên ứng dụng này. Bạn cần hỗ trợ gì?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response from Gemini
      const response = await generateAIResponse(messageText, [...messages, userMessage]);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 flex items-center gap-2 group"
        >
          <span className="text-2xl">💬</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
            Trợ giúp
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">🤖</span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">HanziFlow Assistant</h3>
                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="p-3 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Câu hỏi nhanh:</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuickQuestion(q.text)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-left flex items-center gap-1"
                >
                  <span>{q.emoji}</span>
                  <span className="truncate">{q.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full p-2 transition-all disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatbot;

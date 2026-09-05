import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RotateCcw, Key } from 'lucide-react';

export const cleanAndFormatMath = (text = '') => {
  if (!text) return '';
  return String(text).trim();
};

export const ChatInterface = ({ initialPrompt, activeSubject, lectureContext, learningProfile }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your AI chatbot. Ask me any question—concepts, problems, homework, code, or study advice. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const DEFAULT_B64 = 'QVEuQWI4Uk42SUx3Um5VRnM3a052S3dFZE9BejZOZU8zTTRsSjZuLVVVTDQxRHlCclZUdlE=';
  const getFallbackKey = () => {
    try {
      return atob(DEFAULT_B64);
    } catch {
      return '';
    }
  };
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('edusync_gemini_api_key') || getFallbackKey());
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const bottomRef = useRef(null);
  const handledPromptRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // When an initialPrompt is provided (e.g. from "Ask AI Tutor"), take it as a normal prompt done by the user
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && initialPrompt !== handledPromptRef.current) {
      handledPromptRef.current = initialPrompt;
      handleSend(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSend = async (customText) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    let replyText = '';

    try {
      const token = localStorage.getItem('edusync_token');
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: textToSend,
          apiKey: apiKey.trim() || getFallbackKey(),
          lectureContext,
          studentContext: learningProfile ? { learnerProfile: learningProfile } : undefined,
          history: newHistory.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            text: m.text
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          replyText = data.reply;
        }
      }
    } catch (err) {
      console.warn('Tutor call error:', err);
    }

    // Direct Gemini client fallback if user provided a custom key and server was unreachable
    if (!replyText && apiKey.trim()) {
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'];
      for (const model of candidateModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: "You are a helpful, intelligent, natural AI chatbot. Provide clear, accurate, thoughtful answers without rigid canned templates." }]
              },
              contents: newHistory.slice(-8).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
              }))
            })
          });
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            replyText = data.candidates[0].content.parts[0].text;
            break;
          }
        } catch (modelErr) {
          console.warn(`Direct model ${model} call failed:`, modelErr);
        }
      }
    }

    if (!replyText) {
      replyText = "I'm having trouble connecting to the AI service right now. Please verify your internet connection or check your API key.";
    }

    const botMsg = {
      id: `b-${Date.now()}`,
      role: 'assistant',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const saveKey = () => {
    const trimmed = tempKey.trim();
    if (trimmed) {
      localStorage.setItem('edusync_gemini_api_key', trimmed);
      setApiKey(trimmed);
    } else {
      localStorage.removeItem('edusync_gemini_api_key');
      setApiKey('');
    }
    setShowKeyDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-indigo-400" />
            AI Chatbot
          </span>
          {activeSubject?.code && (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              {activeSubject.code}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom API Key Button */}
          <button
            onClick={() => {
              setTempKey(apiKey);
              setShowKeyDialog(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              apiKey
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? 'API Key Active' : 'Gemini Key'}</span>
          </button>

          {/* Reset / Clear Chat */}
          <button
            onClick={() => setMessages([{
              id: 'welcome',
              role: 'assistant',
              text: 'Conversation cleared! What would you like to ask?',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* API Key Modal Dialog */}
      {showKeyDialog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
              <Key className="w-5 h-5" />
              <span>Google Gemini API Key</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have a Google Gemini API key, you can enter it below to use your own direct quota.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyDialog(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveKey}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {m.text}
                </div>
                <span className={`text-[10px] text-slate-500 font-mono block ${isUser ? 'text-right' : 'text-left'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type any message or prompt for the AI..."
            disabled={loading}
            className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

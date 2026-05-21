import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, AlertCircle, RefreshCw, BookOpen, ArrowRight, HelpCircle, Key, Settings } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LOCAL_KNOWLEDGE_INSTRUCTION } from '../lib/tutorConfig';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorDashboardProps {
  selectedDept: string | null;
  courses: string[];
}

const QUICK_PROMPTS = [
  {
    label: "Recommend short notes",
    prompt: "Which short notes do you have available? Please recommend the best ones for my course.",
    icon: BookOpen
  },
  {
    label: "Explore Bilingual Handbooks",
    prompt: "Do you have Amharic + English dual language notes? Tell me which subjects have them and how to study with them.",
    icon: HelpCircle
  },
  {
    label: "Freshman study strategy",
    prompt: "I am a freshman. Give me a strategic weekly study routine to master my courses and dominate previous exams.",
    icon: Sparkles
  },
  {
    label: "Explain IoT / Emerging Tech",
    prompt: "Explain the key concepts of IoT and other emerging tech from Unit 4 of the textbook.",
    icon: ArrowRight
  }
];

export function AITutorDashboard({ selectedDept, courses }: AITutorDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings! I am your **Dominator AI Academic Tutor**. 🎓\n\nI have complete local knowledge of your university catalog, freshmen study modules, Amharic + English bilingual notes, and past examination keys.\n\n${
        selectedDept 
          ? `I see you are in the **${selectedDept}** department. You have courses like *${courses.slice(0, 4).join(', ')}* and more.` 
          : "Please select a department to help me tailor your academic success!"
      }\n\nAsk me anything! For example, you can ask me to recommend specific units, explain tricky concepts, or give you direct download links for our notes!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Pre-emptively check for standalone execution / server presence
  useEffect(() => {
    fetch('/api/health')
      .then(res => {
        if (!res.ok) {
          setIsStandalone(true);
        }
      })
      .catch(() => {
        setIsStandalone(true);
      });

    // Check if an API key is saved or pre-defined
    const storedKey = localStorage.getItem('GEMINI_API_KEY') || localStorage.getItem('VITE_GEMINI_API_KEY');
    const systemKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (storedKey) {
      setApiKeyInput(storedKey);
    } else if (systemKey) {
      setApiKeyInput(systemKey);
    }
  }, []);

  const handleSaveApiKey = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!apiKeyInput.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', apiKeyInput.trim());
    setNeedsApiKey(false);
    setShowKeySettings(false);
    setErrorMsg(null);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    localStorage.removeItem('VITE_GEMINI_API_KEY');
    setApiKeyInput('');
    setNeedsApiKey(true);
    setErrorMsg("API Key cleared. Please configure a key to use Standalone Client Mode.");
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let replyText = "";
    let useClientFallback = false;

    // Try server call if not running under standalone client mode
    if (!isStandalone) {
      try {
        const response = await fetch('/api/ai-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            userContext: {
              department: selectedDept,
              courses: courses
            }
          })
        });

        if (!response.ok) {
          if (response.status === 404) {
            useClientFallback = true;
            setIsStandalone(true);
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server responded with status ${response.status}`);
          }
        } else {
          const data = await response.json();
          replyText = data.reply;
        }
      } catch (err: any) {
        console.warn("Backend unavailable or returned error. Falling back to client-side resolver.", err);
        setIsStandalone(true);
        useClientFallback = true;
      }
    } else {
      useClientFallback = true;
    }

    if (useClientFallback) {
      try {
        const apiKey = localStorage.getItem('GEMINI_API_KEY') || 
                       localStorage.getItem('VITE_GEMINI_API_KEY') || 
                       (import.meta as any).env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
          setNeedsApiKey(true);
          setShowKeySettings(true);
          throw new Error("Missing Gemini API Key. Since you are running in Standalone Client Mode (exported outside AI Studio), you must set your Gemini API Key first.");
        }

        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const genAiContents = updatedMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        let personalizedInstruction = LOCAL_KNOWLEDGE_INSTRUCTION;
        if (selectedDept) {
          personalizedInstruction += `\n\nCURRENT USER SESSION CONTEXT:\n- Selected Department: ${selectedDept}\n- Current Course Catalog: ${JSON.stringify(courses || [])}\n`;
        }

        const genResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: genAiContents,
          config: {
            systemInstruction: personalizedInstruction,
            temperature: 0.7,
          }
        });

        replyText = genResponse.text || "I apologize, but I could not formulate a reply. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      } catch (err: any) {
        console.error("Client-side resolve error:", err);
        setErrorMsg(err.message || "Failed to contact Gemini API. Confirm your internet connection and API Key.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      setIsLoading(false);
    }
  };

  // Render text containing markdown links correctly (simple inline parser for [text](url) and bold **text**)
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Parse markdown bold
      let parsed = line;
      
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      const parts: Array<{ type: 'text' | 'link'; text: string; url?: string }> = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', text: line.substring(lastIndex, match.index) });
        }
        parts.push({ type: 'link', text: match[1], url: match[2] });
        lastIndex = linkRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push({ type: 'text', text: line.substring(lastIndex) });
      }

      return (
        <p key={i} className="mb-2 leading-relaxed text-sm text-slate-200">
          {parts.length === 0 ? (
            renderBoldText(line)
          ) : (
            parts.map((p, idx) => {
              if (p.type === 'link') {
                return (
                  <a
                    key={idx}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`tutor-link-${i}-${idx}`}
                    className="inline-flex items-center text-gold-400 hover:text-gold-200 underline font-semibold transition-colors mx-1"
                  >
                    {p.text}
                  </a>
                );
              }
              return renderBoldText(p.text);
            })
          )}
        </p>
      );
    });
  };

  const renderBoldText = (text: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length === 0 ? text : <>{parts}</>;
  };

  return (
    <div className="mt-6 flex flex-col h-[650px] rounded-2xl overflow-hidden glass-card border border-white/5 bg-slate-950/45">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold font-display tracking-tight text-sm">Dominator AI Scholar</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isStandalone ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-xs text-slate-400 font-mono">
                {isStandalone ? 'Standalone Client Mode' : 'Expert Freshman Knowledge'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStandalone && (
            <button
              onClick={() => setShowKeySettings(!showKeySettings)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-gold-400 transition-colors"
              title="Configure API Key"
              type="button"
            >
              <Key className="w-4 h-4" />
            </button>
          )}
          {selectedDept && (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gold-400 font-medium">
              {selectedDept}
            </span>
          )}
        </div>
      </div>

      {/* Standalone Key Management Drawer */}
      <AnimatePresence>
        {isStandalone && showKeySettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/90 border-b border-white/5 overflow-hidden"
          >
            <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-slate-300 font-semibold mb-1">Set Gemini API Key for Standalone Client Mode</p>
                <p className="text-[10px] text-slate-400">Your key remains entirely local to your browser and is never uploaded anywhere.</p>
              </div>
              <form onSubmit={handleSaveApiKey} className="flex gap-2 flex-1 max-w-sm">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-gold-400 hover:bg-gold-500 text-slate-950 font-semibold text-xs transition-colors"
                >
                  Save
                </button>
                {apiKeyInput && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border uppercase text-xs font-bold ${
                  isUser 
                    ? 'bg-gold-500/15 text-gold-300 border-gold-500/20' 
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-gold-400" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  isUser 
                    ? 'bg-gold-500/10 text-white border border-gold-500/20 rounded-tr-none' 
                    : 'bg-white/5 text-slate-100 border border-white/5 rounded-tl-none'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-[80%]"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/5 text-slate-300 border border-white/10">
              <Bot className="w-4 h-4 text-gold-400 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gold-400/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 bg-gold-400/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 bg-gold-400/80 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Promotions */}
      {messages.length === 1 && (
        <div className="px-6 pb-2">
          <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Suggested Questions with Local Files:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                id={`quick-prompt-${idx}`}
                onClick={() => handleSend(qp.prompt)}
                className="glass-card hover:bg-white/10 border border-white/5 p-3 text-left transition-all rounded-xl flex items-start gap-2.5 group"
              >
                <div className="p-1.5 rounded-lg bg-white/5 text-gold-400 group-hover:text-gold-200 transition-colors">
                  <qp.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-semibold text-white truncate">{qp.label}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{qp.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message / Setup Prompt */}
      {errorMsg && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-red-200">
              {needsApiKey ? "API Key Needed" : "Connection Issue"}
            </h5>
            <p className="text-xs text-red-300 mt-1">{errorMsg}</p>
            <div className="mt-2.5 flex flex-col gap-2">
              {needsApiKey ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowKeySettings(true);
                      const keyInputEl = document.querySelector('input[type="password"]') as HTMLInputElement;
                      if (keyInputEl) keyInputEl.focus();
                    }}
                    className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/10"
                  >
                    <Key className="w-3 h-3" /> Enter API Key
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSend(messages[messages.length - 1]?.content || "Hello")}
                    className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/10"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                  <span className="text-[10px] text-slate-400">
                    If run on standalone client, toggle the key settings icon on the header to configure your key.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-white/5 bg-slate-900/60 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask about textbooks, past exams, or how to master freshman study guides..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-gold-500/40 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-xl bg-gold-400 hover:bg-gold-500 text-slate-950 font-bold disabled:opacity-40 disabled:hover:bg-gold-400 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}


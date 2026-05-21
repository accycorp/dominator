import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, AlertCircle, RefreshCw, BookOpen, ArrowRight, HelpCircle } from 'lucide-react';

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
      content: `Greetings! I'm your **Dominator AI Tutor**.${selectedDept ? ` Expert for **${selectedDept}**.` : ""} Ask me about textbooks, bilingual notes, or past exams!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 1) return;
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % QUICK_PROMPTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userContext: {
            department: selectedDept,
            courses: courses
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error("Failed to fetch tutor response:", err);
      setErrorMsg(err.message || "Something went wrong. Please confirm your server is active and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render text containing markdown links correctly (simple inline parser for [text](url) and bold **text**)
  const renderMessageContent = (text: string) => {
    // Basic formatting replacement
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Parse markdown bold
      let parsed = line;
      
      // Identify markdown links [label](url) and replace with anchor tags styled like gold links
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
            // Just simple text with potential bolding
            renderBoldText(line)
          ) : (
            parts.map((p, idx) => {
              if (p.type === 'link') {
                return (
                  <a
                    key={`link-${idx}`}
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
              return <span key={`text-span-${idx}`}>{renderBoldText(p.text)}</span>;
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
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }
      parts.push(
        <strong key={`bold-${match.index}`} className="text-white font-bold">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-end-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-mono">Expert Freshman Knowledge</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedDept && (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gold-400 font-medium">
              {selectedDept}
            </span>
          )}
        </div>
      </div>

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
        <div className="px-6 pb-2.5">
          <p className="text-[11px] text-slate-400/80 font-medium mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400/80 animate-pulse" />
            Suggested Question:
          </p>
          <div className="h-10 relative">
            <AnimatePresence mode="wait">
              <motion.button
                key={promptIndex}
                type="button"
                id={`quick-prompt-${promptIndex}`}
                onClick={() => handleSend(QUICK_PROMPTS[promptIndex].prompt)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-x-0 top-0 glass-card bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 px-2.5 py-1.5 text-left transition-all rounded-lg flex items-center gap-2 group w-full cursor-pointer cursor-hand"
              >
                <div className="p-1 rounded-md bg-white/5 text-gold-400 group-hover:text-gold-200 transition-colors shrink-0">
                  {(() => {
                    const IconComp = QUICK_PROMPTS[promptIndex].icon;
                    return <IconComp className="w-3.5 h-3.5" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                  <span className="text-xs text-slate-300 font-medium truncate">
                    <strong className="font-bold text-white mr-1">{QUICK_PROMPTS[promptIndex].label}</strong>
                    <span className="text-slate-400">— {QUICK_PROMPTS[promptIndex].prompt}</span>
                  </span>
                  <span className="text-[9px] text-gold-500/85 font-bold uppercase tracking-wider shrink-0 bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/20">Ask</span>
                </div>
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-red-200">Connection Issue</h5>
            <p className="text-xs text-red-300 mt-1">{errorMsg}</p>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSend(messages[messages.length - 1]?.content || "Hello")}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/10"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
              <span className="text-[10px] text-slate-400">
                Ensure process.env.GEMINI_API_KEY is configured in Settings.
              </span>
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

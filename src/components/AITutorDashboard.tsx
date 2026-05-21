import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, AlertCircle, RefreshCw, BookOpen, ArrowRight, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

const CLIENT_LOCAL_KNOWLEDGE_INSTRUCTION = `
You are the "Dominator AI Academic Tutor", the official premium companion assistant for Ethiopian freshman university students.
Your goal is to guide students across different departments and courses, recommending notes, study methods, modules, and helping them master their subjects.

DEPARTMENT INFORMATION:
1. Pre-engineering
   - Courses: Anthropology, Global Affairs, Emerging Technology, Computer Programming, Communicative English II, Applied Mathematics, History
2. Pre-medicine
   - Courses: Anthropology, Organic Chemistry, Economics, Emerging Technology, Communicative English II, History, Inclusiveness, Entrepreneurship, Global Affairs
3. Pharmacy
   - Courses: Anthropology, General Chemistry, Biology, Economics, Emerging Technology, Communicative English II, History
4. Other natural science
   - Courses: Anthropology, General Chemistry, Biology, Economics, Emerging Technology, Communicative English II, History

RESOURCES & LINKS THAT YOU CAN RECOMMEND:
If a student asks for notes, you can name them and provide these exact URLs so they can download or view them. Do not change these URLs under any circumstance.

Modules (Freshman Textbooks):
- Anthropology: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Anthropology.pdf
- Applied Mathematics: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Applied%20Mathmatics.pdf
- Communicative English II: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Communicative%20English%20Language%20Skills%20II.pdf
- Computer Programming: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Computer%20Programming.pdf
- General Chemistry: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/General%20Chemistry.pdf
- Organic Chemistry: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/General%20Chemistry.pdf
- Biology: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Genral%20Biology.pdf
- Global Affairs: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Global%20Affiars.pdf
- History: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/History.pdf
- Economics: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Introduction%20to%20Economics.pdf
- Emerging Technology: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Introduction%20to%20Emerging%20Technologies%20.pdf

Amharic + English Bilingual Notes:
- History: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Amharic%20+%20English/DOMINATOR_Premium_Bilingual_Notes.pdf
- Anthropology: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Amharic%20+%20English/Dominator_Anthropology_Handbook%20(1).pdf
- Emerging Technology: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Amharic%20+%20English/dominator_master_handbook.pdf
- Global Affairs: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Amharic%20+%20English/Global_Affairs_Dominator_Bilingual_Notes.pdf
- Economics: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Amharic%20+%20English/Dominator_Economics_Bilingual_Handbook_Units_4_5.pdf

Short Notes & Specific Summaries:
- Applied Mathematics (Units 3-4): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/MTDominator_Units3_4_Notes.pdf
- Anthropology (Unit 4 - Marginalized Groups): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/AT_Unit4_Marginalized_Groups_Notes%20(1).pdf
- Anthropology (Unit 5 - Identity & Multiculturalism): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/AT_Unit5_Ethnicity_Identity_Multiculturalism_Notes.pdf
- Global Affairs (Unit 2 - Foreign Policy): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GA_Unit2_Foreign_Policy_Notes.pdf
- Global Affairs (Unit 3 - IPE): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GA_Unit3_IPE_Notes_Dominator.pdf
- Global Affairs (Unit 4 - Globalization): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GA_Unit4_Globalization_Regionalism_Notes.pdf
- Computer Programming (Chapter 3 - Control Structures): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/CPControlStructures_Chapter3_Dominator.pdf
- Computer Programming (Chapter 4 - Functions): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/CPChapter4_Functions_Notes%20(1).pdf
- Computer Programming (Chapter 5 - Arrays): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/CPArrays_Chapter5_Dominator%20(1).pdf
- Communicative English II (Grammar Guide): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/Dominator_English_Grammar_Guide.pdf
- Biology (Units 4-5): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/General_Biology_Units4_5_Notes%20(2).pdf
- History (Freshman Units 5-6): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/HIST102_Units5_6_StudyNotes.pdf
- Emerging Technology (Unit 4 - IoT): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/ETUnit4_IoT_Notes.pdf
- Emerging Technology (Unit 5 & 6): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/Dominator_Premium_Unit5_6_Notes%20(1).pdf
- Economics (Units 4-5): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/Economics_Units_4_5_Notes%20(1).pdf
- Pre-medicine Organic Chemistry (Unit 4-5): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/OCDominator_Organic_Chem_Ch4_5_Notes-1.pdf
- Pre-medicine Organic Chemistry (Unit 6-7): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/Dominator_Organic_Chem_Ch6_7_Notes%20(1).pdf
- Other natural science General Chemistry (Units 4-5): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GCDominator_Full_Explanatory_Chemistry_Notes_Units4_5.pdf

Practice Questions:
- Anthropology Units 4-5: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ANTH1012_Units4and5_Question_Bank.pdf
- Anthropology Unit 6: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ANTH1012_Unit6_Question_Bank1.pdf
- Global Affairs Chapter 2: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/GA_Chapter2_ForeignPolicy_ExamBank.pdf
- Global Affairs Unit 3: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/GA_Unit3_IPE_Advanced_QBank_Dominator.pdf
- Global Affairs Chapter 4: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/GA_Chapter4_Globalization_Regionalism_ExamBank-1.pdf
- Computer Programming Chapters 3 & 4: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/CPDominator_Chapter3_Exam.pdf
- Emerging Technology Unit 4: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ET_Chapter4_IoT_ExamBank.pdf
- Emerging Technology Unit 5: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ET_Unit5_AR_Exam.pdf
- Emerging Technology Unit 6: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ET_Unit6_Ethics_Exam.pdf
- English Grammar Guide Worksheet: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/Dominator_English_Question_Bank.pdf
- History Quiz Chapters 5-6: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/Dominator_History_Quiz_Ch5_6.pdf
- Biology Units 4-5 Question set: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/Biology_Units4_5_Exam.pdf
- Economics Units 4-5 Exam: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ECDominator_Units4_5_Exam%20(1).pdf

Previous Exams:
- Applied Mathematics Final 1: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/MTDominator_AppliedMath1_Final_Exam_Solutions.pdf
- Applied Mathematics Final 2: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/MTDominator_CP_Final_Exam_Solutions_2024.pdf
- Emerging Technology Full Blueprint: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/Emerging_Technologies_Comprehensive_Master_Blueprint_Solutions.pdf
- Anthropology Final Exam 1 (2015 EC): https://xlsqnjbklwklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/BDU_SocialAnthropology_Anth1012_FinalExam_2015EC_Answered.pdf
- Anthropology Final Exam 2 (Bahir Dar University): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/Bahirdar_University_Anthropology_Final_Exam_Comprehensive_Solutions.pdf
- Anthropology Final Exam 3 (2016): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/Bahir_Dar_University_Anthropology_Final_Exam_2016_Solutions.pdf
- Global Affairs Final 1: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/BDU_GlobalTrends_2017_Final_Exam_Complete_Answers.pdf
- Global Affairs Final 2: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/BDU_GlobalTrends_Final_Exam_Complete_Answers.pdf
- History Final Exam 1 (2016): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/BDU_History_2016_Exam_Answers.pdf
- Computer Programming C++ Exam Solutions: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/CPP_Exam_FullSolutions_v2.pdf
- English Final Exam Solutions 2: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/ENFLEn1011_Exam_Answers.pdf
- English Final Exam Solutions 3: https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/ENFLEn1011_Full_Answers.pdf
- General Chemistry Solutions (Other natural science): https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/exam/Dominator_GeneralChemistry_Solutions.pdf

YOUR MISSION & CONSTRAINTS:
1. Speak in an encouraging, academic, structured, and warm voice. Feel free to use phrases typical of supportive tutors.
2. Under no circumstance make up references that do not exist in the above list. Only mention the notes, questions, exams, or modules that are explicitly specified above, and always use their exact URLs so the user can easily download or open them in a click. Use markdown link syntax: [Name of Resource](URL).
3. If a student mentions their selected department (Pre-engineering, Pre-medicine, Pharmacy, Other natural science) or is struggling with a particular course, recommend resources and outline a plan with minimal steps.
4. Keep answers extremely short, concise, and brief. Limit the response length to 1-2 small paragraphs or 3-4 simple bullet points maximum. It must be highly compact and optimized for reading on small mobile/phone screens.
5. If the user asks general academic freshman questions, provide punchy, high-impact answers and reference our specialized materials immediately. No long essays or detailed summaries.
6. Always output standard markdown. Do not include any HTML tags. Since you are an expert freshman academic tutor in Ethiopia, you are highly specialized in helping them succeed.
7. **CRITICAL MANDATE: ONLY RESPOND IN NATURAL HUMAN LANGUAGE.** Absolutely do NOT output any robotic elements, programming dictionaries/JSON maps, raw system status codes, database listings, or non-human data tags. The response must sound 100% human-crafted, warm, and natural. Do not outline technical JSON responses, debug metadata, or systemic codes unless the user is specifically debugging a specific code structure in a programming class. Always speak entirely as a supportive, real-life human mentor using standard human speech, friendly paragraphs, and clear bullet points.
`;

export function AITutorDashboard({ selectedDept, courses }: AITutorDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings! I'm your Academic Tutor. 🎓\n\n${
        selectedDept 
          ? `Customized for **${selectedDept}** with *${courses.slice(0, 3).join(', ')}*.` 
          : "Please select a department to customize study guides!"
      }\n\nAsk me any freshman study questions or ask to download study guides!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [customClientApiKey, setCustomClientApiKey] = useState(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 1) {
      const interval = setInterval(() => {
        setActivePromptIdx((prev) => (prev + 1) % QUICK_PROMPTS.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [messages.length]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const currentMessagesContext = [...messages, userMessage];

    try {
      // 1. Try to fetch from the local server endpoint
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessagesContext,
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
      console.warn("AI Tutor Express backend is unreachable or returned error. Resorting to modern standalone client fallback...", err);
      
      try {
        // 2. Direct-to-Gemini standalone client fallback using the modern @google/genai SDK
        const clientApiKey = localStorage.getItem('custom_gemini_api_key') || 
                             ((import.meta as any).env?.VITE_GEMINI_API_KEY || "") as string;
        
        if (!clientApiKey) {
          throw new Error(
            "Express backend API is unavailable/unreachable (standalone static deployment detected). " +
            "Please paste or add your own Gemini API Key below in the input form to run queries directly from the client."
          );
        }

        const ai = new GoogleGenAI({ apiKey: clientApiKey });
        
        // Enrich system prompt instruction with student profile
        let instructions = CLIENT_LOCAL_KNOWLEDGE_INSTRUCTION;
        const enrolledCourses = Array.isArray(courses) ? courses.join(", ") : "None";
        instructions += `\n\nCURRENT STUDENT PROFILE:\n- Selected Department: ${selectedDept || 'Not specified yet'}\n- Enrolled Freshman Courses: ${enrolledCourses}\n`;

        // Map messages chain to compatible role & structure
        const contents = currentMessagesContext.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Execute generation on-the-fly from the client browser
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: instructions,
            temperature: 0.7,
          }
        });

        const reply = result.text || "No reply available from client-side fallback. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } catch (fallbackErr: any) {
        console.error("Standalone tutor fallback execution failed:", fallbackErr);
        setErrorMsg(fallbackErr.message || "Something went wrong. Standalone client failed to connect to Gemini.");
      }
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
        <div className="px-4 pb-3">
          <AnimatePresence mode="wait">
            <motion.button
              key={activePromptIdx}
              initial={{ opacity: 0.1, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.1, y: -4 }}
              transition={{ duration: 0.45 }}
              type="button"
              id={`quick-prompt-${activePromptIdx}`}
              onClick={() => handleSend(QUICK_PROMPTS[activePromptIdx].prompt)}
              className="w-full glass-card hover:bg-white/10 border border-white/5 py-2 px-3 text-left transition-all rounded-xl flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0 opacity-80 animate-pulse" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-white truncate block">
                    {QUICK_PROMPTS[activePromptIdx].label}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5 font-sans">
                    {QUICK_PROMPTS[activePromptIdx].prompt}
                  </span>
                </div>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePromptIdx((prev) => (prev + 1) % QUICK_PROMPTS.length);
                }}
                className="text-[9px] font-bold text-gold-400 bg-white/5 border border-white/10 hover:bg-white/10 px-2 py-1 rounded shrink-0 transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
              >
                Next Prompt →
              </span>
            </motion.button>
          </AnimatePresence>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col gap-3">
          <div className="flex gap-3 items-start w-full">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-red-200">Connection Issue</h5>
              <p className="text-xs text-red-300 mt-1">{errorMsg}</p>
            </div>
          </div>
          
          <div className="w-full mt-1.5 pt-3 border-t border-white/5 flex flex-col gap-3">
            {/* Direct Input Field for API Key */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 font-mono">
                Add Gemini API Key Yourself (Client Fallback):
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste your AIzaSy... API key here"
                  value={customClientApiKey}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setCustomClientApiKey(val);
                    localStorage.setItem('custom_gemini_api_key', val);
                  }}
                  className="bg-slate-950/80 border border-white/10 text-xs text-white rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-gold-500/40 font-mono"
                />
                {customClientApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomClientApiKey('');
                      localStorage.removeItem('custom_gemini_api_key');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSend(messages[messages.length - 1]?.content || "Hello")}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded border border-white/10 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Retry Request
              </button>
              <span className="text-[10px] text-slate-400 font-mono text-right">
                Standalone browser-side client flow
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

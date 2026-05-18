/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { RobustFileViewer } from './components/RobustFileViewer';
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  FileText, 
  Languages, 
  ClipboardCheck, 
  CircleHelp, 
  GraduationCap, 
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

// --- Types ---

// --- Supabase Helper ---

async function fetchSupabaseResource(dept: string, course: string, resource: string, noteName?: string) {
  // Hardcoded fallback for user-provided URLs
  const courseUrls: Record<string, string> = {
    'Anthropology': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Anthropology.pdf',
    'Applied Mathematics': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Applied%20Mathmatics.pdf',
    'Communicative English II': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Communicative%20English%20Language%20Skills%20II.pdf',
    'Computer Programming': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Computer%20Programming.pdf',
    'General Chemistry': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/General%20Chemistry.pdf',
    'Biology': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Genral%20Biology.pdf',
    'Global Affairs': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Global%20Affiars.pdf',
    'History': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/History.pdf',
    'Economics': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Introduction%20to%20Economics.pdf',
    'Emerging Technology': 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/Introduction%20to%20Emerging%20Technologies%20.pdf',
  };

  if (resource === 'Module' && courseUrls[course]) {
    return courseUrls[course];
  }

  // Hardcoded short notes fallback
  if (resource === 'Short note') {
    if (course === 'Applied Mathematics' && noteName === 'Note 1') {
      return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/Applied%20Note(3-4)%20@Dominator7_Bot.pdf';
    }
    if (course === 'Anthropology') {
      if (noteName === 'Dominator note (Note 1)') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/AT_Unit4_Marginalized_Groups_Notes%20(1).pdf';
      if (noteName === 'Dominator note (Note 2)') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/AT_Unit5_Ethnicity_Identity_Multiculturalism_Notes.pdf';
    }
    if (course === 'Global Affairs') {
      if (noteName === 'Dominator note (Note 1)') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GA_Unit2_Foreign_Policy_Notes.pdf';
      if (noteName === 'Dominator note (Note 2)') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GA_Unit3_IPE_Notes_Dominator.pdf';
      if (noteName === 'Dominator note (Note 3)') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/short%20notes/GA_Unit4_Globalization_Regionalism_Notes.pdf';
    }
  }

  // Hardcoded practice questions fallback
  if (resource === 'Practice question') {
    if (course === 'Anthropology') {
      if (noteName === 'Exam 1') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ANTH1012_Unit4_Question_Bank.pdf';
      if (noteName === 'Exam 2') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ANTH1012_Units4and5_Question_Bank.pdf';
      if (noteName === 'Exam 3') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ANTH1012_Unit6_Question_Bank1.pdf';
    }
    if (course === 'Global Affairs') {
      if (noteName === 'Exam 1') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/GA_Chapter2_ForeignPolicy_ExamBank.pdf';
      if (noteName === 'Exam 2') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/GA_Unit3_IPE_Advanced_QBank_Dominator.pdf';
      if (noteName === 'Exam 3') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/GA_Chapter4_Globalization_Regionalism_ExamBank-1.pdf';
    }
    if (course === 'Computer Programming') {
      if (noteName === 'Exam 1') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/CPDominator_Chapter3_Exam.pdf';
      if (noteName === 'Exam 2') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/CP_Chapter4_Functions_Exam.pdf';
    }
    if (course === 'Emerging Technology') {
      if (noteName === 'Exam 1') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ET_Chapter4_IoT_ExamBank.pdf';
      if (noteName === 'Exam 2') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ET_Unit5_AR_Exam.pdf';
      if (noteName === 'Exam 3') return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/ET_Unit6_Ethics_Exam.pdf';
    }
    if (course === 'Communicative English II' && noteName === 'Exam 1') {
      return 'https://xlsqnjbklwmtkihtdjzq.supabase.co/storage/v1/object/public/dominator/practice%20questions/Dominator%20english_Ch3-5%20.pdf';
    }
  }

  if (!supabase) {
    console.warn("Supabase not initialized, but no hardcoded fallback for this resource.");
    return null;
  }

  const { data, error } = await supabase
    .from('resources')
    .select('content')
    .eq('department', dept)
    .eq('course', course)
    .eq('resource_type', noteName ? `${resource} (${noteName})` : resource)
    .maybeSingle();

  if (error) {
    console.error('Supabase Error:', error);
    throw error;
  }
  return data?.content || null;
}

enum View {
  LANDING = 'landing',
  DEPARTMENT = 'department',
  RESOURCE = 'resource',
  COURSE = 'course',
  NOTE_SELECTION = 'note_selection',
  DOMINATOR_SUBSELECTION = 'dominator_subselection',
  EXAM_SELECTION = 'exam_selection',
  VIEWER = 'viewer',
}

type Department = 'Pre-engineering' | 'Pre-medicine' | 'Other natural science' | 'Pharmacy';
type ResourceType = 'Module' | 'Amharic+English note' | 'Short note' | 'Practice question' | 'Previous exams' | 'Study plan';
type Course = string;

// --- Constants ---

const DEPARTMENTS: { id: Department; icon: any; description: string }[] = [
  { id: 'Pre-engineering', icon: FlaskConical, description: 'Built for future architects and innovators.' },
  { id: 'Pre-medicine', icon: Stethoscope, description: 'Pathways for future medical professionals.' },
  { id: 'Other natural science', icon: BookOpen, description: 'Exploring the fundamental laws of nature.' },
  { id: 'Pharmacy', icon: Pill, description: 'Mastering the science of medicine delivery.' },
];

const RESOURCES: { id: ResourceType; icon: any }[] = [
  { id: 'Module', icon: FileText },
  { id: 'Amharic+English note', icon: Languages },
  { id: 'Short note', icon: Layers },
  { id: 'Practice question', icon: ClipboardCheck },
  { id: 'Previous exams', icon: GraduationCap },
  { id: 'Study plan', icon: Calendar },
];

const COURSES: Course[] = [
  'Anthropology', 'General Chemistry', 'Biology', 'Economics', 
  'Global Affairs', 'Emerging Technology', 'Computer Programming', 
  'Communicative English II', 'Applied Mathematics', 'History'
];

// --- Components ---

const Logo = ({ className = "w-10 h-10", showText = true }: { className?: string; showText?: boolean }) => (
  <div className={`flex flex-col items-center gap-4 group cursor-pointer`}>
    <div className={`${className} relative p-1 rounded-full bg-gradient-to-br from-gold-400 via-gold-600 to-gold-800 shadow-2xl shadow-gold-900/50 group-hover:shadow-gold-500/30 transition-all duration-500`}>
      <div className="w-full h-full rounded-full bg-charcoal-950 flex items-center justify-center overflow-hidden border-2 border-gold-500/20">
        <img 
          src="/logo.png" 
          alt="Dominator Logo" 
          className="w-full h-full object-cover scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = `
              <div class="flex flex-col items-center justify-center translate-y-1">
                <span class="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-600 italic leading-none">D</span>
                <div class="w-8 h-1 bg-gold-500/50 rounded-full blur-[1px] mt-1 pulse"></div>
              </div>
            `;
          }}
          referrerPolicy="no-referrer"
        />
      </div>
      {/* Decorative Outer Ring */}
      <div className="absolute -inset-2 border border-gold-500/10 rounded-full animate-spin-slow pointer-events-none"></div>
    </div>
    {showText && (
      <div className="text-center">
        <h1 className="text-3xl font-display font-black tracking-tighter text-white group-hover:text-gold-400 transition-colors">
          DOMINATOR
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold-500/80 mt-1">
          Study Smart • Dominate Exams
        </p>
      </div>
    )}
  </div>
);

interface ViewContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  key?: string; // Explicitly allowed for AnimatePresence
}

const ViewContainer = ({ children, title, subtitle, onBack }: ViewContainerProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4 }}
    className="w-full max-w-5xl mx-auto px-4 py-12"
  >
    <div className="flex items-center justify-between mb-8">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-gold-400 transition-colors group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-gold-500/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back</span>
        </button>
      )}
      <div className="flex-1 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{title}</h2>
        {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
      </div>
      <div className="w-20" /> {/* Spacer for centering */}
    </div>
    {children}
  </motion.div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedSubNote, setSelectedSubNote] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [viewerContent, setViewerContent] = useState<{ content: string; originalUrl?: string; type: 'text' | 'pdf' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Supabase Connection Test ---
  useEffect(() => {
    async function testConnection() {
      if (!supabase) {
        console.warn("Supabase client not initialized. Skipping connection test.");
        return;
      }
      try {
        const { error } = await supabase.from('resources').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log("Supabase connection established successfully.");
      } catch (error) {
        console.warn("Supabase connection check failed. This is expected if the 'resources' table isn't created yet.", error);
      }
    }
    testConnection();
  }, []);

  const resetSelection = () => {
    setSelectedDept(null);
    setSelectedResource(null);
    setSelectedCourse(null);
    setSelectedNote(null);
    setSelectedSubNote(null);
    setSelectedExam(null);
    setCurrentView(View.LANDING);
  };

  // --- View Handlers ---

  const processResourceContent = async (fileData: string) => {
    let type: 'pdf' | 'text' = 'text';
    let content = fileData;
    let originalUrl = fileData.startsWith('http') ? fileData : undefined;

    if (fileData.startsWith('JVBERi0') || fileData.toLowerCase().includes('.pdf') || fileData.startsWith('http')) {
      type = 'pdf';
      
      if (fileData.startsWith('JVBERi0')) {
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        content = window.URL.createObjectURL(blob);
      } else if (fileData.startsWith('http')) {
        // Try to fetch as blob to avoid iframe blocking
        try {
          const response = await fetch(fileData);
          if (response.ok) {
            const blob = await response.blob();
            content = window.URL.createObjectURL(blob);
          }
        } catch (err) {
          console.warn("PDF fetch failed, falling back to direct URL:", err);
        }
      }
    }
    return { content, type, originalUrl };
  };

  const handleStart = () => setCurrentView(View.DEPARTMENT);
  
  const handleDeptSelect = (dept: Department) => {
    setSelectedDept(dept);
    setCurrentView(View.RESOURCE);
  };

  const handleResourceSelect = (res: ResourceType) => {
    setSelectedResource(res);
    setCurrentView(View.COURSE);
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    
    if (selectedResource === 'Short note') {
      setCurrentView(View.NOTE_SELECTION);
      return;
    }

    if (selectedResource === 'Practice question') {
      setCurrentView(View.EXAM_SELECTION);
      return;
    }

    setIsLoading(true);
    try {
      const fileData = await fetchSupabaseResource(selectedDept!, course, selectedResource!);
      setIsLoading(false);
      if (fileData && typeof fileData === 'string') {
        const { content, type, originalUrl } = await processResourceContent(fileData);
        setViewerContent({ content, type, originalUrl });
        setCurrentView(View.VIEWER);
      } else {
        alert("Resource content not found.");
      }
    } catch (err) {
      setIsLoading(false);
      alert("Failed to load resource.");
    }
  };

  const handleNoteSelect = async (note: string) => {
    setSelectedNote(note);
    
    if (note === 'Dominator note') {
      setCurrentView(View.DOMINATOR_SUBSELECTION);
      return;
    }

    setIsLoading(true);
    try {
      const fileData = await fetchSupabaseResource(selectedDept!, selectedCourse!, selectedResource!, note);
      
      if (fileData && typeof fileData === 'string') {
        const { content, type, originalUrl } = await processResourceContent(fileData);
        setIsLoading(false);
        setViewerContent({ content, type, originalUrl });
        setCurrentView(View.VIEWER);
      } else {
        setIsLoading(false);
        alert("Note not found.");
      }
    } catch (err) {
      setIsLoading(false);
      alert("Failed to load note.");
    }
  };

  const handleSubNoteSelect = async (subNote: string) => {
    setSelectedSubNote(subNote);
    setIsLoading(true);
    try {
      const combinedNoteName = `${selectedNote} (${subNote})`;
      const fileData = await fetchSupabaseResource(selectedDept!, selectedCourse!, selectedResource!, combinedNoteName);
      
      if (fileData && typeof fileData === 'string') {
        const { content, type, originalUrl } = await processResourceContent(fileData);
        setIsLoading(false);
        setViewerContent({ content, type, originalUrl });
        setCurrentView(View.VIEWER);
      } else {
        setIsLoading(false);
        alert("Note variant not found.");
      }
    } catch (err) {
      setIsLoading(false);
      alert("Failed to load note variant.");
    }
  };
  
  const handleExamSelect = async (exam: string) => {
    setSelectedExam(exam);
    setIsLoading(true);
    try {
      const fileData = await fetchSupabaseResource(selectedDept!, selectedCourse!, selectedResource!, exam);
      
      if (fileData && typeof fileData === 'string') {
        const { content, type, originalUrl } = await processResourceContent(fileData);
        setIsLoading(false);
        setViewerContent({ content, type, originalUrl });
        setCurrentView(View.VIEWER);
      } else {
        setIsLoading(false);
        alert("Exam not found.");
      }
    } catch (err) {
      setIsLoading(false);
      alert("Failed to load exam.");
    }
  };

  const handleDownload = async () => {
    if (!selectedDept || !selectedCourse || !selectedResource) return;
    setIsLoading(true);
    try {
      const fileData = await fetchSupabaseResource(selectedDept, selectedCourse, selectedResource);
      
      if (fileData && typeof fileData === 'string') {
        let url = fileData;
        let isBlob = false;
        
        // If it's a URL, fetch and convert to Blob to force download
        if (fileData.startsWith('http')) {
          try {
            const response = await fetch(fileData);
            const blob = await response.blob();
            url = window.URL.createObjectURL(blob);
            isBlob = true;
          } catch (err) {
            console.error("Download fetch failed, falling back to direct URL", err);
          }
        } else if (fileData.startsWith('JVBERi0')) {
          // If it's Base64, convert to Blob URL
          const blob = new Blob([Uint8Array.from(atob(fileData), c => c.charCodeAt(0))], { type: 'application/pdf' });
          url = window.URL.createObjectURL(blob);
          isBlob = true;
        }

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedCourse}_${selectedResource}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        if (isBlob) {
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      } else {
        alert("Resource content not found.");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      alert("Failed to download PDF.");
    }
  };

  // --- Views ---

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col overflow-x-hidden">
      <main className="flex-1 pb-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentView === View.LANDING && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl px-6 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-10"
              >
                <Logo className="w-40 h-40 rounded-full" showText={false} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-inner"
              >
                <Sparkles className="w-4 h-4" />
                <span>Study Smart. Dominate Exams. Achieve Success.</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-[1.1] tracking-tight"
              >
                Master Your Studies. <br />
                <span className="text-gold-500">Dominate</span> Your Exams.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Master your academics with precision. All the resources you need to 
                dominate your courses and exams in one place.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button 
                  onClick={handleStart}
                  className="btn-primary flex items-center gap-2 group w-full sm:w-auto justify-center"
                >
                  Enter the arena
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {currentView === View.DEPARTMENT && (
            <ViewContainer 
              key="dept"
              title="Select Your Department"
              subtitle="Where does your academic journey focus?"
              onBack={() => setCurrentView(View.LANDING)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {DEPARTMENTS.map((dept, index) => (
                  <button
                    key={dept.id}
                    onClick={() => handleDeptSelect(dept.id)}
                    className="glass-card glass-card-hover p-8 text-left group flex items-start gap-6"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gold-600/10 flex items-center justify-center group-hover:bg-gold-600 group-hover:text-white transition-all duration-300">
                      <dept.icon className="w-7 h-7 text-gold-500 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{dept.id}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{dept.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ViewContainer>
          )}

          {currentView === View.RESOURCE && (
            <ViewContainer 
              key="resource"
              title="Select Resource Type"
              subtitle={`Preparing content for ${selectedDept}`}
              onBack={() => setCurrentView(View.DEPARTMENT)}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {RESOURCES.map((res, index) => (
                  <button
                    key={res.id}
                    onClick={() => handleResourceSelect(res.id)}
                    className="glass-card glass-card-hover p-6 flex flex-col items-center text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <res.icon className="w-6 h-6 text-gold-400" />
                    </div>
                    <span className="text-white font-medium group-hover:text-gold-100 transition-colors">{res.id}</span>
                  </button>
                ))}
              </div>
            </ViewContainer>
          )}

          {currentView === View.COURSE && (
            <ViewContainer 
              key="course"
              title={selectedResource === 'Study plan' ? 'Study Dashboard' : 'Select a Course'}
              subtitle={selectedResource === 'Study plan' ? 'Your weekly path to success' : `Choose a subject to study your ${selectedResource}`}
              onBack={() => setCurrentView(View.RESOURCE)}
            >
              {selectedResource === 'Study plan' ? (
                /* Study Plan Dashboard */
                <div className="mt-8 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="glass-card p-4 min-h-[160px] flex flex-col">
                        <span className="text-gold-500 font-display font-bold text-xs uppercase tracking-widest mb-4 block">
                          {day}
                        </span>
                        <div className="flex-1 flex flex-col justify-center items-center gap-2 text-slate-600 italic text-xs">
                          <div className="w-full h-2 bg-white/5 rounded-full" />
                          <div className="w-2/3 h-2 bg-white/5 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Course Selection Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {COURSES.map((course) => (
                    <button
                      key={course}
                      onClick={() => handleCourseSelect(course)}
                      disabled={isLoading}
                      className="glass-card p-5 text-left border border-white/5 flex items-center justify-between group transition-all hover:bg-white/10 hover:border-gold-500/30"
                    >
                      <span className="font-semibold text-white group-hover:text-gold-100 transition-colors">
                        {course}
                      </span>
                      {isLoading && selectedCourse === course ? (
                        <div className="w-4 h-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ViewContainer>
          )}

          {currentView === View.NOTE_SELECTION && (
            <ViewContainer 
              key="note-selection"
              title="Select a Note"
              subtitle={`Choice for ${selectedCourse}`}
              onBack={() => setCurrentView(View.COURSE)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {['Dominator note', 'Note 1', 'Note 2', 'Note 3'].map((note) => (
                  <button
                    key={note}
                    onClick={() => handleNoteSelect(note)}
                    disabled={isLoading}
                    className="glass-card glass-card-hover p-8 text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold-600/10 flex items-center justify-center group-hover:bg-gold-600 transition-colors">
                        <FileText className="w-6 h-6 text-gold-500 group-hover:text-white" />
                      </div>
                      <span className="text-xl font-bold text-white group-hover:text-gold-100 transition-colors">
                        {note}
                      </span>
                    </div>
                    {isLoading && selectedNote === note ? (
                      <div className="w-5 h-5 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                    )}
                  </button>
                ))}
              </div>
            </ViewContainer>
          )}

          {currentView === View.DOMINATOR_SUBSELECTION && (
            <ViewContainer 
              key="dominator-subselection"
              title="Select Dominator Note"
              subtitle={`Options for ${selectedCourse}`}
              onBack={() => setCurrentView(View.NOTE_SELECTION)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {['Note 1', 'Note 2', 'Note 3'].map((note) => (
                  <button
                    key={note}
                    onClick={() => handleSubNoteSelect(note)}
                    disabled={isLoading}
                    className="glass-card glass-card-hover p-8 text-left group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold-600/10 flex items-center justify-center group-hover:bg-gold-600 transition-colors">
                        <Sparkles className="w-6 h-6 text-gold-500 group-hover:text-white" />
                      </div>
                      <span className="text-xl font-bold text-white group-hover:text-gold-100 transition-colors">
                        {note}
                      </span>
                    </div>
                    {isLoading && selectedSubNote === note ? (
                      <div className="w-5 h-5 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                    )}
                  </button>
                ))}
              </div>
            </ViewContainer>
          )}

          {currentView === View.EXAM_SELECTION && (
            <ViewContainer 
              key="exam-selection"
              title="Select Practice Exam"
              subtitle={`Test your knowledge in ${selectedCourse}`}
              onBack={() => setCurrentView(View.COURSE)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                {['Exam 1', 'Exam 2', 'Exam 3'].map((exam) => (
                  <button
                    key={exam}
                    onClick={() => handleExamSelect(exam)}
                    disabled={isLoading}
                    className="glass-card glass-card-hover p-8 text-left group flex flex-col gap-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gold-600/10 flex items-center justify-center group-hover:bg-gold-600 transition-all duration-500 transform group-hover:rotate-6">
                      <ClipboardCheck className="w-7 h-7 text-gold-500 group-hover:text-white" />
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-white group-hover:text-gold-100 transition-colors">
                        {exam}
                      </span>
                      {isLoading && selectedExam === exam ? (
                        <div className="w-5 h-5 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ViewContainer>
          )}

          {currentView === View.VIEWER && viewerContent && (
            <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentView(View.COURSE)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-gold-500/10 text-slate-400 hover:text-gold-400 transition-all group"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                      {selectedCourse}
                    </h2>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                      <span className="text-gold-500/80 font-medium">{selectedResource}</span>
                      <span className="opacity-30">•</span>
                      <span>{selectedDept}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleDownload}
                    className="btn-secondary py-2.5 px-6 flex items-center gap-2 text-sm"
                  >
                    <ArrowRight className="w-4 h-4 rotate-90" />
                    Save Offline
                  </button>
                  <button 
                    onClick={() => setCurrentView(View.COURSE)}
                    className="btn-primary py-2.5 px-6 text-sm"
                  >
                    Finish Reading
                  </button>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full h-[80vh] flex flex-col overflow-hidden border-white/5 shadow-2xl relative"
              >
                {/* Status Bar */}
                <div className="px-6 py-3 border-b border-white/5 bg-charcoal-900 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Secure Reader Active</span>
                   </div>
                   <div className="flex items-center gap-4 text-slate-600">
                     <Sparkles className="w-4 h-4" />
                   </div>
                </div>

                <div className="flex-1 bg-black/40 relative group">
                  {viewerContent.type === 'pdf' ? (
                    viewerContent.originalUrl ? (
                      <RobustFileViewer 
                        supabaseUrl={viewerContent.originalUrl} 
                        fileName={`${selectedCourse} - ${selectedResource}`} 
                      />
                    ) : (
                      <iframe
                        src={`${viewerContent.content}#view=FitH&toolbar=0`}
                        className="w-full h-full border-none bg-charcoal-900"
                        title="Resource Viewer"
                      />
                    )
                  ) : (
                    <div className="h-full overflow-auto p-8 md:p-16 bg-charcoal-900 text-slate-300 font-sans leading-relaxed text-lg max-w-4xl mx-auto">
                      <div className="whitespace-pre-wrap selection:bg-gold-500/30 selection:text-white">
                        {viewerContent.content}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reader Shadow Accents */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal-950/40 to-transparent pointer-events-none" />
              </motion.div>
              
              <div className="mt-8 flex items-center justify-center gap-8 text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-white/10" />
                  <span className="text-xs uppercase tracking-tighter">End of Document</span>
                  <div className="w-8 h-px bg-white/10" />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

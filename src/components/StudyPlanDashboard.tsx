import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  BookOpen, 
  ListTodo, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  BookMarked
} from 'lucide-react';

interface StudyTask {
  id: string;
  title: string;
  course: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  durationMinutes: number;
  completed: boolean;
}

interface StudyPlanDashboardProps {
  selectedDept: string | null;
  courses: string[];
}

type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

// Default recommended templates based on Department selection
const DEFAULT_PLANS: Record<string, Record<WeekDay, StudyTask[]>> = {
  'Pre-engineering': {
    'Mon': [
      { id: 'eng-1', title: 'Solve Applied Mathematics exam questions', course: 'Applied Mathematics', timeSlot: 'Morning', durationMinutes: 90, completed: false },
      { id: 'eng-2', title: 'Review Computer Programming array notes', course: 'Computer Programming', timeSlot: 'Afternoon', durationMinutes: 60, completed: true }
    ],
    'Tue': [
      { id: 'eng-3', title: 'Summarize Emerging Technology Unit 4 (IoT)', course: 'Emerging Technology', timeSlot: 'Morning', durationMinutes: 45, completed: false },
      { id: 'eng-4', title: 'Practice math differentiation problems', course: 'Applied Mathematics', timeSlot: 'Evening', durationMinutes: 120, completed: false }
    ],
    'Wed': [
      { id: 'eng-5', title: 'Write functions in C++ (Exercises)', course: 'Computer Programming', timeSlot: 'Afternoon', durationMinutes: 90, completed: false },
      { id: 'eng-6', title: 'Active recall for English short notes', course: 'Communicative English II', timeSlot: 'Evening', durationMinutes: 60, completed: false }
    ],
    'Thu': [
      { id: 'eng-7', title: 'Review history essay structures', course: 'History', timeSlot: 'Morning', durationMinutes: 60, completed: false },
      { id: 'eng-8', title: 'Draft emerging tech blueprints review', course: 'Emerging Technology', timeSlot: 'Afternoon', durationMinutes: 90, completed: false }
    ],
    'Fri': [
      { id: 'eng-9', title: 'Final Exam Quiz Practice', course: 'Applied Mathematics', timeSlot: 'Morning', durationMinutes: 120, completed: false },
      { id: 'eng-10', title: 'Read programming debug solutions', course: 'Computer Programming', timeSlot: 'Afternoon', durationMinutes: 60, completed: false }
    ],
    'Sat': [
      { id: 'eng-11', title: 'Group study / Review week 1 difficulty notes', course: 'Emerging Technology', timeSlot: 'Morning', durationMinutes: 180, completed: false },
      { id: 'eng-12', title: 'Past papers solving session (Exam 1 & 2)', course: 'Applied Mathematics', timeSlot: 'Afternoon', durationMinutes: 150, completed: false }
    ],
    'Sun': [
      { id: 'eng-13', title: 'Light review & organize next week notes', course: 'Communicative English II', timeSlot: 'Afternoon', durationMinutes: 60, completed: false }
    ]
  },
  'Pre-medicine': {
    'Mon': [
      { id: 'med-1', title: 'Review Organic Chemistry Unit 4 mechanisms', course: 'Organic Chemistry', timeSlot: 'Morning', durationMinutes: 90, completed: false },
      { id: 'med-2', title: 'Read Biology Unit 4 note pages', course: 'Biology', timeSlot: 'Afternoon', durationMinutes: 60, completed: true }
    ],
    'Tue': [
      { id: 'med-3', title: 'Analyze Anthropology past exam problems', course: 'Anthropology', timeSlot: 'Morning', durationMinutes: 90, completed: false },
      { id: 'med-4', title: 'Solve organic chem practice quizzes', course: 'Organic Chemistry', timeSlot: 'Evening', durationMinutes: 120, completed: false }
    ],
    'Wed': [
      { id: 'med-5', title: 'Anatomy / Genetics chapter breakdown', course: 'Biology', timeSlot: 'Morning', durationMinutes: 100, completed: false },
      { id: 'med-6', title: 'English mock exam 2 completion', course: 'Communicative English II', timeSlot: 'Evening', durationMinutes: 90, completed: false }
    ],
    'Thu': [
      { id: 'med-7', title: 'History essay / timeline construction', course: 'History', timeSlot: 'Morning', durationMinutes: 60, completed: false },
      { id: 'med-8', title: 'Active recall on economics definitions', course: 'Economics', timeSlot: 'Afternoon', durationMinutes: 60, completed: false }
    ],
    'Fri': [
      { id: 'med-9', title: 'Organic Chemistry Final Exam 1 practice', course: 'Organic Chemistry', timeSlot: 'Afternoon', durationMinutes: 120, completed: false },
      { id: 'med-10', title: 'Biology specimen/diagram labels quiz', course: 'Biology', timeSlot: 'Evening', durationMinutes: 75, completed: false }
    ],
    'Sat': [
      { id: 'med-11', title: 'Comprehensive theory mock exam solving', course: 'Anthropology', timeSlot: 'Morning', durationMinutes: 150, completed: false },
      { id: 'med-12', title: 'Flashcards on core formulas', course: 'Organic Chemistry', timeSlot: 'Afternoon', durationMinutes: 90, completed: false }
    ],
    'Sun': [
      { id: 'med-13', title: 'Weekly review & summary of Organic Chemistry notes', course: 'Organic Chemistry', timeSlot: 'Evening', durationMinutes: 60, completed: false }
    ]
  },
  'Pharmacy': {
    'Mon': [
      { id: 'ph-1', title: 'Review Drug delivery notes & General Chemistry', course: 'General Chemistry', timeSlot: 'Morning', durationMinutes: 95, completed: false },
      { id: 'ph-2', title: 'Summarize Biology Unit 5 core cell concepts', course: 'Biology', timeSlot: 'Evening', durationMinutes: 75, completed: true }
    ],
    'Tue': [
      { id: 'ph-3', title: 'Revise math calculus application slides', course: 'Applied Mathematics', timeSlot: 'Afternoon', durationMinutes: 110, completed: false },
      { id: 'ph-4', title: 'Self-assessment quiz on biology key concepts', course: 'Biology', timeSlot: 'Evening', durationMinutes: 60, completed: false }
    ],
    'Wed': [
      { id: 'ph-5', title: 'Solve General Chemistry Final Exam 1 problems', course: 'General Chemistry', timeSlot: 'Morning', durationMinutes: 120, completed: false },
      { id: 'ph-6', title: 'Active recall for English grammar exercises', course: 'Communicative English II', timeSlot: 'Evening', durationMinutes: 60, completed: false }
    ],
    'Thu': [
      { id: 'ph-7', title: 'Review social anthropology exam questions', course: 'Anthropology', timeSlot: 'Morning', durationMinutes: 80, completed: false },
      { id: 'ph-8', title: 'Read history module study questions', course: 'History', timeSlot: 'Afternoon', durationMinutes: 90, completed: false }
    ],
    'Fri': [
      { id: 'ph-9', title: 'General Chemistry short notes summary preparation', course: 'General Chemistry', timeSlot: 'Morning', durationMinutes: 90, completed: false },
      { id: 'ph-10', title: 'Practicing Applied Mathematics past paper sets', course: 'Applied Mathematics', timeSlot: 'Afternoon', durationMinutes: 120, completed: false }
    ],
    'Sat': [
      { id: 'ph-11', title: 'Weekly high-intensity mock exam test round', course: 'General Chemistry', timeSlot: 'Morning', durationMinutes: 150, completed: false },
      { id: 'ph-12', title: 'Active study group notes discussion', course: 'Anthropology', timeSlot: 'Afternoon', durationMinutes: 90, completed: false }
    ],
    'Sun': [
      { id: 'ph-13', title: 'Organize study materials & schedule planner buffer', course: 'Biology', timeSlot: 'Afternoon', durationMinutes: 60, completed: false }
    ]
  },
  'Other natural science': {
    'Mon': [
      { id: 'ns-1', title: 'Study Chemistry solutions and reaction states', course: 'General Chemistry', timeSlot: 'Morning', durationMinutes: 110, completed: false },
      { id: 'ns-2', title: 'Read Biology chapter summaries', course: 'Biology', timeSlot: 'Evening', durationMinutes: 80, completed: true }
    ],
    'Tue': [
      { id: 'ns-3', title: 'Review Applied Mathematics limit and derivatives', course: 'Applied Mathematics', timeSlot: 'Afternoon', durationMinutes: 125, completed: false },
      { id: 'ns-4', title: 'Write down core terms for Anthropology', course: 'Anthropology', timeSlot: 'Evening', durationMinutes: 50, completed: false }
    ],
    'Wed': [
      { id: 'ns-5', title: 'Verify understanding of Physics rules', course: 'Physics', timeSlot: 'Morning', durationMinutes: 90, completed: false },
      { id: 'ns-6', title: 'Solve Chemistry exam 1 solutions', course: 'General Chemistry', timeSlot: 'Evening', durationMinutes: 120, completed: false }
    ],
    'Thu': [
      { id: 'ns-7', title: 'Study history of Ethiopia block review', course: 'History', timeSlot: 'Morning', durationMinutes: 90, completed: false },
      { id: 'ns-8', title: 'Solve math vectors questions', course: 'Applied Mathematics', timeSlot: 'Afternoon', durationMinutes: 100, completed: false }
    ],
    'Fri': [
      { id: 'ns-9', title: 'Biology taxonomy short notes digest', course: 'Biology', timeSlot: 'Morning', durationMinutes: 85, completed: false },
      { id: 'ns-10', title: 'English reading comprehension worksheet', course: 'Communicative English II', timeSlot: 'Evening', durationMinutes: 60, completed: false }
    ],
    'Sat': [
      { id: 'ns-11', title: 'Grand quiz trial with Chemistry past paper questions', course: 'General Chemistry', timeSlot: 'Morning', durationMinutes: 140, completed: false },
      { id: 'ns-12', title: 'Formula card writing and organization', course: 'Applied Mathematics', timeSlot: 'Evening', durationMinutes: 90, completed: false }
    ],
    'Sun': [
      { id: 'ns-13', title: 'Plan and review notes gap analysis', course: 'History', timeSlot: 'Evening', durationMinutes: 60, completed: false }
    ]
  }
};

const DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LONG_NAMES: Record<WeekDay, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday'
};

export const StudyPlanDashboard: React.FC<StudyPlanDashboardProps> = ({ selectedDept, courses }) => {
  const deptKey = selectedDept || 'Pre-engineering';
  const defaultWeekly = DEFAULT_PLANS[deptKey] || DEFAULT_PLANS['Pre-engineering'];

  // Load from local storage or fallback to defaults
  const [weeklyPlan, setWeeklyPlan] = useState<Record<WeekDay, StudyTask[]>>(() => {
    const saved = localStorage.getItem(`dominator_study_${deptKey}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultWeekly;
  });

  const [activeDay, setActiveDay] = useState<WeekDay>('Mon');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState(courses[0] || 'General Chemistry');
  const [newTaskSlot, setNewTaskSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(60);
  const [streakCount, setStreakCount] = useState<number>(3); // hardcoded initial gamification

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem(`dominator_study_${deptKey}`, JSON.stringify(weeklyPlan));
  }, [weeklyPlan, deptKey]);

  useEffect(() => {
    // Keep course in sync if courses prop changes
    if (courses.length > 0 && !courses.includes(newTaskCourse)) {
      setNewTaskCourse(courses[0]);
    }
  }, [courses, newTaskCourse]);

  // Calculations
  const allTasks = (Object.values(weeklyPlan) as StudyTask[][]).flatMap(x => x);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(x => x.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 105) : 0; // standard progress scaling
  const completionPercentBounded = Math.min(completionPercentage, 100);

  const totalStudyMinutes = allTasks.reduce((acc, current) => acc + current.durationMinutes, 0);
  const completedStudyHours = Math.round((allTasks.filter(x => x.completed).reduce((acc, current) => acc + current.durationMinutes, 0) / 60) * 10) / 10;
  const targetStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  const toggleTaskCompletion = (day: WeekDay, id: string) => {
    setWeeklyPlan(prev => {
      const updated = { ...prev };
      updated[day] = updated[day].map(task => {
        if (task.id === id) {
          const nextCompletedState = !task.completed;
          // Gamify: Increment streak if completing task and it's the first completed task of the day!
          if (nextCompletedState) {
            setStreakCount(c => c + 1);
          } else {
            setStreakCount(c => Math.max(0, c - 1));
          }
          return { ...task, completed: nextCompletedState };
        }
        return task;
      });
      return updated;
    });
  };

  const deleteTask = (day: WeekDay, id: string) => {
    setWeeklyPlan(prev => {
      const updated = { ...prev };
      updated[day] = updated[day].filter(task => task.id !== id);
      return updated;
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      course: newTaskCourse,
      timeSlot: newTaskSlot,
      durationMinutes: Number(newTaskDuration),
      completed: false
    };

    setWeeklyPlan(prev => {
      const updated = { ...prev };
      updated[activeDay] = [...updated[activeDay], newTask];
      return updated;
    });

    setNewTaskTitle('');
    setIsAddingMode(false);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to reset your study plan to the recommended freshman schedule?")) {
      setWeeklyPlan(defaultWeekly);
      setStreakCount(3);
    }
  };

  const quickAddExamPrep = () => {
    const prepTasks: Record<WeekDay, StudyTask[]> = { ...weeklyPlan };
    const targetDays: WeekDay[] = ['Fri', 'Sat', 'Sun'];

    targetDays.forEach((day, index) => {
      const randomCourse = courses[index % courses.length] || 'General Chemistry';
      const prepTask: StudyTask = {
        id: `prep-${Date.now()}-${day}`,
        title: `🔥 Final Revision Pack review - Past files`,
        course: randomCourse,
        timeSlot: 'Evening',
        durationMinutes: 90,
        completed: false
      };
      prepTasks[day] = [...prepTasks[day], prepTask];
    });

    setWeeklyPlan(prepTasks);
  };

  return (
    <div className="space-y-8 mt-6">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Weekly Completion Card */}
        <div className="glass-card p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-display font-medium uppercase tracking-wider block mb-1">Weekly Task Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-display">{completionPercentBounded}%</span>
              <span className="text-gold-400 text-xs font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Optimal
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gold-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentBounded}%` }}
              />
            </div>
            <p className="text-slate-500 text-[11px] mt-1.5">{completedTasks} of {totalTasks} slots completed</p>
          </div>
        </div>

        {/* Study Time Card */}
        <div className="glass-card p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-display font-medium uppercase tracking-wider block mb-1">Acquired Study Hours</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gold-400 font-display">{completedStudyHours} hrs</span>
              <span className="text-slate-400 text-sm">/ {targetStudyHours} total planned</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4 flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            Productivity goal active
          </p>
        </div>

        {/* Streak score Card */}
        <div className="glass-card p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-display font-medium uppercase tracking-wider block mb-1">Consistency Streak</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white font-display">{streakCount} Days</span>
              {streakCount > 0 && (
                <div className="px-2 py-0.5 bg-amber-500/10 rounded text-amber-500 text-xs font-semibold flex items-center gap-1 animate-pulse">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> ON FIRE
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-gold-500" />
            Keep completing tasks to rise
          </p>
        </div>

        {/* Dynamic Tip Card */}
        <div className="glass-card p-5 border border-white/5 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 group-hover:opacity-20 transition-all duration-300">
            <Award className="w-24 h-24 text-gold-500" />
          </div>
          <div className="relative">
            <span className="text-gold-500 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1 mb-1.5">
              <Award className="w-4 h-4 text-gold-500" /> Dominator Tip
            </span>
            <p className="text-slate-300 text-sm leading-relaxed">
              {completionPercentBounded >= 80 
                ? "Excellent consistency! You are well prepared to dominate the exams." 
                : "Try following the recommended freshman timeline to split your workload evenly."}
            </p>
          </div>
        </div>
      </div>

      {/* Week Day selector Grid with visual indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {DAYS.map(day => {
          const isSelected = activeDay === day;
          const dayTasks = weeklyPlan[day] || [];
          const completedCount = dayTasks.filter(t => t.completed).length;
          const hasTasks = dayTasks.length > 0;
          const isFullyDone = hasTasks && completedCount === dayTasks.length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all duration-200 relative ${
                isSelected 
                  ? 'bg-gold-600/15 border-gold-500/50 text-white shadow-lg shadow-gold-950/25' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`text-xs font-display font-medium uppercase tracking-widest ${isSelected ? 'text-gold-400 font-bold' : ''}`}>
                {day}
              </span>
              <span className="text-sm font-semibold mt-1 font-display">{DAY_LONG_NAMES[day]}</span>
              
              {/* Completed/Total small indicator dots */}
              <div className="flex items-center gap-1.5 mt-2">
                {hasTasks ? (
                  isFullyDone ? (
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {completedCount}/{dayTasks.length}
                    </span>
                  )
                ) : (
                  <span className="w-1 h-1 bg-slate-600 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Panel grid (Active Day Tasks + Side Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Day Tasks List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                {DAY_LONG_NAMES[activeDay]} Schedule
              </h3>
              <p className="text-slate-400 text-xs">Manage tasks for this specific weekday</p>
            </div>
            
            <button
              onClick={() => setIsAddingMode(!isAddingMode)}
              className="px-4 py-2 bg-white/5 hover:bg-gold-600/10 border border-white/10 hover:border-gold-500/30 text-gold-400 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingMode ? 'Cancel' : 'Add Study Task'}
            </button>
          </div>

          {/* Add Form sliding container */}
          <AnimatePresence>
            {isAddingMode && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddTask}
                className="glass-card p-5 border border-gold-500/20 bg-gold-950/10 overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Task Name */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wide">Task Title</label>
                    <input 
                      type="text" 
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Try to solve Final Exam 1 questions"
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                      required
                    />
                  </div>

                  {/* Course select */}
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wide">Target Course</label>
                    <select
                      value={newTaskCourse}
                      onChange={e => setNewTaskCourse(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                    >
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Time slot */}
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wide">Study Time Slot</label>
                    <div className="flex gap-2">
                      {(['Morning', 'Afternoon', 'Evening'] as const).map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setNewTaskSlot(slot)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            newTaskSlot === slot
                              ? 'bg-gold-600/20 border-gold-500 text-gold-400'
                              : 'bg-slate-900 border-white/5 hover:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Minutes */}
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wide">Study Duration</label>
                    <select
                      value={newTaskDuration}
                      onChange={e => setNewTaskDuration(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                    >
                      <option value={30}>30 mins (Sprints)</option>
                      <option value={45}>45 mins (Short-focus)</option>
                      <option value={60}>60 mins (Standard block)</option>
                      <option value={90}>90 mins (High focus)</option>
                      <option value={120}>120 mins (Intensive review)</option>
                      <option value={180}>180 mins (Mock paper test)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsAddingMode(false)}
                    className="px-4 py-2 border border-white/10 text-xs font-semibold text-slate-400 rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gold-600 hover:bg-gold-500 text-xs font-bold text-white rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Task
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Active tasks rendering */}
          <div className="space-y-3">
            {(weeklyPlan[activeDay] || []).length === 0 ? (
              <div className="glass-card p-10 text-center border border-dashed border-white/5 flex flex-col items-center justify-center">
                <div className="p-3 bg-white/5 rounded-full mb-3 text-slate-500">
                  <ListTodo className="w-6 h-6" />
                </div>
                <p className="text-slate-300 font-semibold">No planned tasks for today</p>
                <p className="text-slate-500 text-xs max-w-sm mt-1">
                  Add custom slots or load the recommended freshman prep tools on the side.
                </p>
              </div>
            ) : (
              (weeklyPlan[activeDay] || []).map((task) => (
                <div 
                  key={task.id}
                  className={`glass-card p-4 border flex items-center justify-between gap-4 transition-all duration-300 group ${
                    task.completed 
                      ? 'border-emerald-500/25 bg-emerald-950/5' 
                      : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(activeDay, task.id)}
                      className="mt-0.5 text-slate-500 hover:text-gold-400 transition-colors focus:outline-none"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-gold-500/50 transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <p className={`text-sm font-semibold text-white/90 leading-tight transition-all duration-300 ${
                        task.completed ? 'line-through text-slate-500' : ''
                      }`}>
                        {task.title}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[10px] font-display font-medium text-gold-400/80 bg-gold-500/10 px-2 py-0.5 rounded">
                          {task.course}
                        </span>
                        
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.timeSlot} • {task.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Delete icon) */}
                  <button
                    onClick={() => deleteTask(activeDay, task.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-40 group-hover:opacity-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Practice Shortcuts & Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Preset load actions */}
          <div className="glass-card p-5 border border-white/5 space-y-4">
            <div>
              <h4 className="font-display font-semibold text-sm text-white flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-gold-500" />
                Instant Plan Presets
              </h4>
              <p className="text-slate-400 text-xs">Inject pre-composed prep patterns</p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={quickAddExamPrep}
                className="w-full text-left py-2.5 px-3.5 bg-slate-900 hover:bg-gold-500/10 border border-white/5 hover:border-gold-500/30 text-xs font-semibold font-display text-white rounded-xl flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Add Exam Prep Slots
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-gold-400">Weekend booster</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full text-left py-2.5 px-3.5 bg-slate-900 hover:bg-gold-500/10 border border-white/5 hover:border-gold-500/30 text-xs font-semibold font-display text-white rounded-xl flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-gold-400" />
                  Recommended Blueprint
                </span>
                <span className="text-[10px] text-slate-500">Restore default</span>
              </button>
            </div>
          </div>

          {/* Gamified Milestone Track */}
          <div className="glass-card p-5 border border-white/5 space-y-3.5">
            <div>
              <h4 className="font-display font-semibold text-sm text-white flex items-center gap-1.5 mb-1">
                <BookMarked className="w-4 h-4 text-gold-400" />
                Active Task Breakdowns
              </h4>
              <p className="text-slate-400 text-xs">See courses with planning count</p>
            </div>

            <div className="space-y-2 text-xs">
              {courses.map(course => {
                const courseTasks = allTasks.filter(t => t.course === course);
                const count = courseTasks.length;
                if (count === 0) return null;

                const comp = courseTasks.filter(t => t.completed).length;
                const percent = Math.round((comp / count) * 100);

                return (
                  <div key={course} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{course}</span>
                      <span className="text-slate-500">{comp}/{count} done</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gold-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines warning */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 p-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>This study planner is stored offline in your browser. All updates persist securely on your computer.</span>
          </div>

        </div>
      </div>

    </div>
  );
};

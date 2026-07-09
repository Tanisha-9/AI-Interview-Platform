import React from "react";
import { 
  Briefcase, 
  Video, 
  FileText, 
  Calendar as CalendarIcon, 
  Sun, 
  Moon, 
  CloudLightning, 
  Settings,
  ChevronRight, 
  ChevronLeft,
  HelpCircle,
  Sparkles,
  Award,
  Clock,
  LayoutDashboard,
  ShieldAlert,
  Database,
  ArrowRight,
  Download,
  Upload
} from "lucide-react";
import DashboardOverview from "./components/DashboardOverview";
import MockInterviewRoom from "./components/MockInterviewRoom";
import AtsScorer from "./components/AtsScorer";
import ResumeEditor from "./components/ResumeEditor";
import InterviewCalendar from "./components/InterviewCalendar";
import { InterviewSession, ScheduledInterview } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "mock" | "resume" | "calendar">("dashboard");
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved === "true";
  });
  
  // Features Guide state
  const [showGuide, setShowGuide] = React.useState<boolean>(false);
  
  // Resume tab dual toggle: "ats" or "editor"
  const [resumeSubTab, setResumeSubTab] = React.useState<"ats" | "editor">("ats");

  // Core Persistent States
  const [completedSessions, setCompletedSessions] = React.useState<InterviewSession[]>([]);
  const [scheduledInterviews, setScheduledInterviews] = React.useState<ScheduledInterview[]>([]);

  const toggleSidebar = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem("sidebar_collapsed", String(nextVal));
  };

  // 1. Theme Configuration
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 2. Load Persisted State from LocalStorage
  React.useEffect(() => {
    const cachedSessions = localStorage.getItem("completed_sessions");
    const cachedScheduled = localStorage.getItem("scheduled_interviews");

    if (cachedSessions) {
      try {
        setCompletedSessions(JSON.parse(cachedSessions));
      } catch (e) {
        console.error(e);
      }
    }
    if (cachedScheduled) {
      try {
        setScheduledInterviews(JSON.parse(cachedScheduled));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const updateSessions = (updated: InterviewSession[]) => {
    setCompletedSessions(updated);
    localStorage.setItem("completed_sessions", JSON.stringify(updated));
  };

  const updateScheduled = (updated: ScheduledInterview[]) => {
    setScheduledInterviews(updated);
    localStorage.setItem("scheduled_interviews", JSON.stringify(updated));
  };

  // Action: Add completed mock session from Room
  const handleSessionCompleted = (session: InterviewSession) => {
    const updated = [session, ...completedSessions];
    updateSessions(updated);
    setActiveTab("dashboard");
  };

  // 3. Backup / Restore State engine
  const exportAllData = () => {
    const dataObj = {
      completedSessions,
      scheduledInterviews,
      resumeDraft: localStorage.getItem("resume_draft"),
      atsResult: localStorage.getItem("ats_latest_result")
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recruiting_prep_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAllData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.completedSessions) {
          updateSessions(parsed.completedSessions);
        }
        if (parsed.scheduledInterviews) {
          updateScheduled(parsed.scheduledInterviews);
        }
        if (parsed.resumeDraft) {
          localStorage.setItem("resume_draft", parsed.resumeDraft);
        }
        if (parsed.atsResult) {
          localStorage.setItem("ats_latest_result", parsed.atsResult);
        }
        alert("Backup files imported and verified successfully! Refreshing dashboard statistics.");
        window.location.reload();
      } catch (err) {
        alert("Invalid database schema formatting. Ensure you import a valid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* LEFT SIDEBAR: Desktop Navigation layout */}
      <aside className={`w-full ${isCollapsed ? "md:w-20" : "md:w-64"} md:transition-all md:duration-300 md:ease-in-out border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0`}>
        
        {/* Brand Header */}
        <div className="p-6">
          <div className={`flex ${isCollapsed ? "md:flex-col md:items-center" : "items-center justify-between"} gap-3`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10 shrink-0">
                <Briefcase size={18} />
              </div>
              <div className={isCollapsed ? "md:hidden" : "block"}>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                  Interview Buddy
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  AI Career Buddy Hub
                </p>
              </div>
            </div>
            
            {/* Collapse Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
              { id: "mock", label: "Interactive Practice Room", icon: Video },
              { id: "resume", label: "Resume & ATS Suite", icon: FileText },
              { id: "calendar", label: "Roadmap Checklists", icon: CalendarIcon }
            ].map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === link.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/60"
                  } ${isCollapsed ? "md:justify-center md:px-2" : ""}`}
                  title={link.label}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className={isCollapsed ? "md:hidden" : "block"}>
                    {link.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspace Preferences & Theme Settings Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-850/80 space-y-4">
          <div className={`flex ${isCollapsed ? "md:flex-col md:items-center md:gap-2" : "justify-between items-center"}`}>
            <span className={`text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider ${isCollapsed ? "md:hidden" : ""}`}>
              Workspace Theme
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400 cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-850/50">
            <div className={`flex ${isCollapsed ? "md:justify-center" : "justify-between"} items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase`}>
              <span className={isCollapsed ? "md:hidden" : ""}>Backup State</span>
              <button
                onClick={exportAllData}
                title="Export state database"
                className="hover:text-indigo-600 transition-colors p-1 rounded-sm cursor-pointer"
              >
                <Download size={13} />
              </button>
            </div>
            
            <label className={`flex items-center ${isCollapsed ? "md:justify-center" : "gap-1"} text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors`}>
              <Upload size={13} className="shrink-0" />
              <span className={isCollapsed ? "md:hidden" : ""}>Import State File</span>
              <input
                type="file"
                accept=".json"
                onChange={importAllData}
                className="hidden"
              />
            </label>
          </div>

          <div className={`text-[9px] text-slate-400 dark:text-slate-500 text-center font-medium ${isCollapsed ? "md:scale-75" : ""}`}>
            {isCollapsed ? "Buddy v1.0" : "Interview Buddy • v1.0.0"}
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT FRAME */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto">
        
        {/* Dynamic header title bar */}
        <header className="p-6 border-b border-slate-200/50 dark:border-slate-850/50 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "mock" && "AI Interactive Practice Room"}
              {activeTab === "resume" && "Resume Optimization Suite"}
              {activeTab === "calendar" && "Milestone Roadmap & Checklists"}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
              {activeTab === "dashboard" && "Assess your completed practice records, key milestones, and recent ratings."}
              {activeTab === "mock" && "Simulate interactive video interviews evaluated in real-time by the Gemini intelligence engine."}
              {activeTab === "resume" && "Verify key technical keywords density and compile highly polished bullet points."}
              {activeTab === "calendar" && "Add targets, track scheduled milestones, and execute customized checklist roadmaps."}
            </p>
          </div>

          {/* Feature Guide Button */}
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 p-2.5 md:px-4 md:py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 transition-all text-xs font-bold shrink-0 shadow-xs cursor-pointer hover:scale-105 active:scale-95 duration-150"
            title="Open Interactive Guide"
          >
            <HelpCircle size={15} />
            <span className="hidden md:inline">Feature Guide</span>
          </button>
        </header>

        {/* Dynamic Inner Tab View Router */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" && (
            <DashboardOverview 
              sessions={completedSessions} 
              scheduled={scheduledInterviews} 
              onNavigate={(tab: any) => setActiveTab(tab)}
            />
          )}

          {activeTab === "mock" && (
            <MockInterviewRoom onSessionCompleted={handleSessionCompleted} />
          )}

          {activeTab === "resume" && (
            <div className="space-y-6">
              {/* Dual selector sub tab */}
              <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl max-w-xs">
                <button
                  onClick={() => setResumeSubTab("ats")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    resumeSubTab === "ats"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Keyword Optimizer
                </button>
                <button
                  onClick={() => setResumeSubTab("editor")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    resumeSubTab === "editor"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Resume Builder
                </button>
              </div>

              {resumeSubTab === "ats" ? <AtsScorer /> : <ResumeEditor />}
            </div>
          )}

          {activeTab === "calendar" && (
            <InterviewCalendar 
              scheduled={scheduledInterviews} 
              onUpdateInterviews={updateScheduled}
            />
          )}
        </div>
      </main>

      {/* FEATURE GUIDE INTERACTIVE MODAL */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
                    Interview Buddy Features Catalog
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    A guided overview of your AI Career Buddy tools & capabilities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer font-bold"
                title="Close Guide"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Feature Card 1 */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Video size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      AI Interactive Practice Room
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Practice mock interviews with your voice or keyboard. The Gemini engine provides instant, detailed scorecards evaluating clarity, structures, sentiment, and response lengths.
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Digital Twin Tracking & Leveling
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Track your overall interview level, experience points (XP), active daily streaks, and unlocked career badges based on your performance. Watch your avatar grow as you practice!
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      STAR Story Optimizer
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Log and structure behavioral anecdotes (Situation, Task, Action, Result). Get structured AI polishing with instant rewrites tailored to impress hiring managers.
                  </p>
                </div>

                {/* Feature Card 4 */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Placement & Offer Predictor
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Evaluates mock interview statistics, DSA levels, and ATS scores to predict your clearing probability at leading tech firms (Google, Vercel, Stripe, Apple).
                  </p>
                </div>

                {/* Feature Card 5 */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <CloudLightning size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Resume Optimization & ATS Scanner
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Measure matching criteria, analyze density of crucial technical keywords, and fix missing role requirements using our rules-based scanning engine.
                  </p>
                </div>

                {/* Feature Card 6 */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <ShieldAlert size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Cross-Session Integrity Audit
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Review consistency across different practice sessions. Detects contradictions in resume stats or verbal timelines to ensure high-fidelity accuracy.
                  </p>
                </div>

              </div>

              {/* Tips Banner */}
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30">
                <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-2">
                  <Settings size={13} />
                  Pro-Tip: Keep Your State Offline or Backup regularly!
                </h5>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Your mock session histories, scheduled calendar interviews, resume drafts, and story logs are persisted automatically in your browser's local sandbox storage. Use the "Backup State" buttons in the sidebar to download or restore state files at any time!
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex justify-end bg-slate-50/50 dark:bg-slate-950/40">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Let's Practice!
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

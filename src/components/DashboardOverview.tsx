import React from "react";
import { 
  Video, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight,
  ShieldAlert,
  Compass,
  Sparkles,
  BookOpen,
  Mic,
  Copy,
  Plus,
  Trash2,
  Edit2,
  Github,
  Linkedin,
  Cpu,
  Trophy,
  Activity,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  Circle
} from "lucide-react";
import { ScheduledInterview, InterviewSession, StarStory, DigitalTwinProfile, RoadmapItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  scheduled: ScheduledInterview[];
  sessions: InterviewSession[];
  onNavigate: (tab: string) => void;
}

// Target Companies & Criteria
const COMPANIES = [
  { id: "stripe", name: "Stripe", barColor: "from-indigo-500 to-purple-600", reqAts: 85, reqMock: 88, reqDsa: "Intermediate", reqPortfolio: 80, desc: "Extreme focus on professional, structured explanations, precise active vocabulary, and clean APIs." },
  { id: "google", name: "Google", barColor: "from-red-500 via-yellow-500 to-blue-500", reqAts: 80, reqMock: 85, reqDsa: "Advanced", reqPortfolio: 75, desc: "Deep systems focus. Highly values advanced algorithm solving (DSA) and structured problem breakdown." },
  { id: "vercel", name: "Vercel", barColor: "from-black to-slate-800 dark:from-white dark:to-slate-400", reqAts: 90, reqMock: 90, reqDsa: "Intermediate", reqPortfolio: 90, desc: "Obsessed with design engineering, fluid UX, high impact frontend performance, and visual polish." },
  { id: "apple", name: "Apple", barColor: "from-slate-700 to-slate-900", reqAts: 85, reqMock: 86, reqDsa: "Intermediate", reqPortfolio: 85, desc: "Requires immaculate attention to detail, end-to-end hardware-software integration examples, and user empathy." },
  { id: "custom", name: "Custom Target Company", barColor: "from-emerald-500 to-teal-600", reqAts: 75, reqMock: 75, reqDsa: "Beginner", reqPortfolio: 70, desc: "Balanced criteria focused on standard development patterns, practical problem-solving, and team alignment." }
];

export default function DashboardOverview({ scheduled, sessions, onNavigate }: DashboardProps) {
  // --- SUB TABS IN DASHBOARD ---
  const [subTab, setSubTab] = React.useState<"twin" | "predictor" | "roadmap" | "star" | "pitch" | "integrity">("twin");

  // --- CORE DATA PERSISTENCE & LOCAL STATE ---
  const [stories, setStories] = React.useState<StarStory[]>([]);
  const [twinProfile, setTwinProfile] = React.useState<DigitalTwinProfile>({
    streakCount: 3,
    lastActive: new Date().toISOString(),
    level: 1,
    xp: 250,
    badges: [
      { id: "init", name: "Career Architect", description: "Configured the Career Digital Twin profile", unlockedAt: new Date().toLocaleDateString(), icon: "Trophy" },
      { id: "story", name: "First STAR", description: "Created a STAR story in the library", unlockedAt: new Date().toLocaleDateString(), icon: "BookOpen" }
    ],
    cgpa: 8.5,
    dsaLevel: "Intermediate",
    gitHubUrl: "https://github.com/candidate",
    linkedInUrl: "https://linkedin.com/in/candidate",
    portfolioScore: 78,
    weakSkills: ["System Design", "Conflict Management"],
    strongSkills: ["React/TypeScript", "State Management", "API Design"],
    consistencyContradictions: []
  });

  const [roadmap, setRoadmap] = React.useState<RoadmapItem[]>([]);
  
  // Predictor Inputs
  const [targetCompanyId, setTargetCompanyId] = React.useState<string>("vercel");
  const [targetRole, setTargetRole] = React.useState<string>("Full Stack Developer");
  
  // AI Loaders & Responses
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // STAR CRUD State
  const [storyForm, setStoryForm] = React.useState({
    title: "",
    category: "Leadership" as StarStory["category"],
    situation: "",
    task: "",
    action: "",
    result: ""
  });
  const [activeStoryId, setActiveStoryId] = React.useState<string | null>(null);

  // Pitch Generator State
  const [pitchLength, setPitchLength] = React.useState<"pitch30s" | "pitch60s" | "pitch90s">("pitch60s");
  const [generatedPitches, setGeneratedPitches] = React.useState<{ pitch30s?: string; pitch60s?: string; pitch90s?: string }>({
    pitch30s: "I am a high-impact Design Engineer specialized in React, TypeScript, and elegant state structures. With a track record of building production-ready user interfaces that prioritize speed and aesthetic pairing, I align complex architectural decisions with customer-facing outcomes. I love translating product vision into pixel-perfect implementation and am currently targetting frontend innovation roles.",
    pitch60s: "I am a high-impact Full Stack and Design Engineer specialized in React, TypeScript, and modern state architectures. Over my career, I've prioritized translating complex technical demands into fluid, responsive, and visually distinct frontends. In my previous work, I spearheaded performance redesigns that slashed asset bundle sizes by 35% and increased page responsiveness using dynamic layout optimizations. I maintain a rigorous personal career twin tracker, actively refining my algorithm designs in DSA and mock speaking drills. My goal is to join a forward-thinking product engineering team where I can raise the quality bar and build frictionless digital experiences.",
    pitch90s: "I am a passionate Full Stack Developer and Design Engineer focused on crafting modern, robust, and beautiful digital systems using React, TypeScript, and scalable Node.js architectures. I believe that engineering craft lies at the intersection of structural consistency and visual rhythm. My journey has involved designing robust web apps from the ground up, as well as tuning resumes and portfolios to clear the highest industry bars. I'm a lifelong learner with a solid grounding in DSA, and I continuously test my communication through real-time feedback loops. Beyond my technical skills, I bring deep empathy and standard-setting ownership to product engineering. I'm looking for a team that values continuous professional improvement, pixel-level polish, and structural integrity. Let's build something beautiful together."
  });

  // Integrity Check State
  const [integrityScanned, setIntegrityScanned] = React.useState<boolean>(false);
  const [contradictions, setContradictions] = React.useState<DigitalTwinProfile["consistencyContradictions"]>([]);

  // Load Persisted Storage
  React.useEffect(() => {
    // 1. STAR Stories
    const cachedStories = localStorage.getItem("star_stories");
    if (cachedStories) {
      try { setStories(JSON.parse(cachedStories)); } catch(e) { console.error(e); }
    } else {
      // Default Mock Stories
      const defaultStories: StarStory[] = [
        {
          id: "story_1",
          title: "Optimizing Vite Asset Bundle Speeds",
          category: "Innovation",
          situation: "Our application bundle size grew to over 5MB, causing noticeable lag and slow load times for international users on slower connections.",
          task: "My objective was to reduce the bundle payload size by at least 40% and optimize lazy-loading strategies without degrading user experience.",
          action: "I analyzed the bundle using visualizer plugins, converted heavy imports into dynamic code-split react components, lazy-loaded low-priority routes, and compressed high-resolution images.",
          result: "Successfully reduced the production bundle size to 1.8MB (64% reduction) and accelerated time-to-interactive by 2.4 seconds.",
          starAnswer: "During my placement project, our app's bundle size swelled to 5MB, resulting in high bounce rates. As the lead performance engineer, I set out to reduce this by 40%. I audited the dependencies, migrated static assets to compressed next-gen formats, and structured chunk division using Vite's dynamic code-splitting. This modular strategy successfully reduced the final bundle by 64% and improved load times by 2.4 seconds, validating my technical optimization skills.",
          createdAt: new Date().toISOString()
        }
      ];
      setStories(defaultStories);
      localStorage.setItem("star_stories", JSON.stringify(defaultStories));
    }

    // 2. Twin Profile
    const cachedTwin = localStorage.getItem("digital_twin_profile");
    if (cachedTwin) {
      try { setTwinProfile(JSON.parse(cachedTwin)); } catch(e) { console.error(e); }
    }

    // 3. Roadmap Items
    const cachedRoadmap = localStorage.getItem("roadmap_items");
    if (cachedRoadmap) {
      try { setRoadmap(JSON.parse(cachedRoadmap)); } catch(e) { console.error(e); }
    } else {
      // Create initial rule-based roadmap
      const defaultRoadmap: RoadmapItem[] = [
        { id: "r1", targetCompany: "General", period: "Daily", title: "Complete 1 Mock Interview Drill", description: "Take a voice interview simulation to build vocal confidence and posture consistency.", completed: false },
        { id: "r2", targetCompany: "General", period: "Weekly", title: "Review Resume ATS score", description: "Scan your resume against your target company's job description and add missing tech terms.", completed: false },
        { id: "r3", targetCompany: "General", period: "Weekly", title: "Document a new STAR Story", description: "Detail a recent obstacle you overcame to expand your behavioral response library.", completed: true },
        { id: "r4", targetCompany: "General", period: "Monthly", title: "Optimize GitHub & Portfolio Links", description: "Add structured READMEs and documentation to increase your external career score.", completed: false }
      ];
      setRoadmap(defaultRoadmap);
      localStorage.setItem("roadmap_items", JSON.stringify(defaultRoadmap));
    }
  }, []);

  // Sync to Storage Helpers
  const saveStories = (updated: StarStory[]) => {
    setStories(updated);
    localStorage.setItem("star_stories", JSON.stringify(updated));
  };

  const saveTwinProfile = (updated: DigitalTwinProfile) => {
    setTwinProfile(updated);
    localStorage.setItem("digital_twin_profile", JSON.stringify(updated));
  };

  const saveRoadmap = (updated: RoadmapItem[]) => {
    setRoadmap(updated);
    localStorage.setItem("roadmap_items", JSON.stringify(updated));
  };

  // --- GENERAL CALCULATIONS ---
  const completedSessions = sessions.filter(s => s.status === "completed");
  const latestMockScore = completedSessions.length > 0 ? (completedSessions[0].overallReport?.compositeScore || 70) : 0;
  const rawAtsScore = localStorage.getItem("ats_latest_score");
  const currentAtsScore = rawAtsScore ? parseInt(rawAtsScore, 10) : 0;

  // Next countdown timer
  const nextInterview = scheduled
    .filter(i => new Date(i.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    if (!nextInterview) {
      setTimeLeft("");
      return;
    }
    const interval = setInterval(() => {
      const diff = new Date(nextInterview.scheduledAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Happening Now!");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${days > 0 ? `${days}d ` : ""}${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [nextInterview]);

  // Gamification XP system calculations
  const calculateLevelProgress = () => {
    const totalXp = twinProfile.xp;
    const currentLvl = Math.floor(Math.sqrt(totalXp / 100)) || 1;
    const xpForCurrent = (currentLvl * currentLvl) * 100;
    const xpForNext = ((currentLvl + 1) * (currentLvl + 1)) * 100;
    const progressPercent = Math.round(((totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100);
    return { level: currentLvl, progressPercent, nextLvlXp: xpForNext, currentLvlXp: xpForCurrent };
  };

  const levelInfo = calculateLevelProgress();

  // --- PLACEMENT PREDICTOR ALGORITHM ---
  const calculateClearingProbability = (companyId: string) => {
    const comp = COMPANIES.find(c => c.id === companyId) || COMPANIES[0];
    
    // We compute a dynamic weighted clearing probability:
    // 35% ATS score (current vs required)
    // 35% Mock interview score (current vs required, fallback to 70 if no sessions)
    // 20% Portfolio score (current vs required)
    // 10% DSA compatibility (Advanced matches google, Intermediate matches stripe/apple/vercel, etc)
    
    const mockGrade = latestMockScore || 65; // fallback
    const atsGrade = currentAtsScore || 60; // fallback
    
    const atsRatio = Math.min(1, atsGrade / comp.reqAts);
    const mockRatio = Math.min(1, mockGrade / comp.reqMock);
    const portRatio = Math.min(1, twinProfile.portfolioScore / comp.reqPortfolio);
    
    let dsaWeight = 0.5;
    if (twinProfile.dsaLevel === "Advanced") dsaWeight = 1.0;
    else if (twinProfile.dsaLevel === "Intermediate") dsaWeight = 0.8;
    else dsaWeight = 0.4;
    
    let targetDsaWeight = 0.8;
    if (comp.reqDsa === "Advanced") targetDsaWeight = 1.0;
    else if (comp.reqDsa === "Intermediate") targetDsaWeight = 0.8;
    else targetDsaWeight = 0.5;
    
    const dsaRatio = Math.min(1, dsaWeight / targetDsaWeight);
    
    const weightedScore = (atsRatio * 35) + (mockRatio * 35) + (portRatio * 20) + (dsaRatio * 10);
    const finalScore = Math.round(weightedScore);
    
    return {
      score: finalScore,
      atsGap: comp.reqAts - atsGrade,
      mockGap: comp.reqMock - mockGrade,
      portfolioGap: comp.reqPortfolio - twinProfile.portfolioScore,
      dsaGap: comp.reqDsa !== twinProfile.dsaLevel && twinProfile.dsaLevel === "Beginner",
      status: finalScore >= 80 ? "High" : finalScore >= 55 ? "Moderate" : "Low"
    };
  };

  const predictorResult = calculateClearingProbability(targetCompanyId);
  const currentCompanyObj = COMPANIES.find(c => c.id === targetCompanyId) || COMPANIES[0];

  // --- STAR Story CRUD Handlers ---
  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title || !storyForm.situation || !storyForm.task || !storyForm.action || !storyForm.result) {
      alert("Please fill in all STAR sections before saving.");
      return;
    }

    const newStory: StarStory = {
      id: "story_" + Date.now(),
      title: storyForm.title,
      category: storyForm.category,
      situation: storyForm.situation,
      task: storyForm.task,
      action: storyForm.action,
      result: storyForm.result,
      createdAt: new Date().toISOString()
    };

    const updated = [newStory, ...stories];
    saveStories(updated);
    
    // Reward XP
    const newXp = twinProfile.xp + 50;
    saveTwinProfile({
      ...twinProfile,
      xp: newXp,
      level: Math.floor(Math.sqrt(newXp / 100)) || 1
    });

    // Reset Form
    setStoryForm({
      title: "",
      category: "Leadership",
      situation: "",
      task: "",
      action: "",
      result: ""
    });
    alert("STAR story saved successfully! (+50 XP)");
  };

  const handleDeleteStory = (id: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      const filtered = stories.filter(s => s.id !== id);
      saveStories(filtered);
    }
  };

  const handleOptimizeStory = async (id: string) => {
    const target = stories.find(s => s.id === id);
    if (!target) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/gemini/star-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: target.situation,
          task: target.task,
          action: target.action,
          result: target.result,
          category: target.category
        })
      });

      if (!res.ok) throw new Error("Failed to optimize story via Gemini API.");
      const data = await res.json();
      
      const updated = stories.map(s => {
        if (s.id === id) {
          return {
            ...s,
            starAnswer: data.starAnswer,
            deliveryAdvice: data.deliveryCoachAdvice // save custom advice
          };
        }
        return s;
      });
      saveStories(updated);
      
      // Earn XP for optimization!
      const newXp = twinProfile.xp + 30;
      saveTwinProfile({
        ...twinProfile,
        xp: newXp,
        level: Math.floor(Math.sqrt(newXp / 100)) || 1
      });

      alert("AI Optimization successfully injected! Your STAR story response has been polished. (+30 XP)");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // --- AI ELEVATOR PITCH GENERATOR ---
  const handleGeneratePitch = async () => {
    setAiLoading(true);
    try {
      // Gather profile inputs
      const profileSummary = `A developer with skills in ${twinProfile.strongSkills.join(", ")}. Target role: ${targetRole}. DSA Level: ${twinProfile.dsaLevel}. CGPA: ${twinProfile.cgpa}`;
      
      const res = await fetch("/api/gemini/elevator-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: targetRole,
          skills: twinProfile.strongSkills,
          experience: profileSummary,
          summary: "Eager developer tracking real-time mock evaluations."
        })
      });

      if (!res.ok) throw new Error("Failed to contact speech coach server API.");
      const data = await res.json();
      setGeneratedPitches(data);
      
      // Boost XP
      const newXp = twinProfile.xp + 25;
      saveTwinProfile({
        ...twinProfile,
        xp: newXp,
        level: Math.floor(Math.sqrt(newXp / 100)) || 1
      });
      alert("Elevator Pitches optimized and loaded! (+25 XP)");
    } catch (err: any) {
      alert("Pitch generation failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // --- INTEGRITY SCAN (CONTRADICTION FINDER) ---
  const handleIntegrityCheck = async () => {
    if (completedSessions.length === 0) {
      alert("Please complete at least one mock interview session first to check for credibility contradictions.");
      return;
    }

    setAiLoading(true);
    try {
      // Create transcripts payload from questions and answers
      const transcriptsPayload = completedSessions.flatMap((session, sessionIdx) => 
        session.responses.map(resp => ({
          session: `Mock Session #${sessionIdx + 1} (${session.jobRole})`,
          question: resp.questionText,
          answer: resp.transcript
        }))
      );

      const res = await fetch("/api/gemini/check-consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: transcriptsPayload })
      });

      if (!res.ok) throw new Error("Could not execute structural consistency audit.");
      const data = await res.json();
      
      setContradictions(data);
      setIntegrityScanned(true);

      // Save findings
      saveTwinProfile({
        ...twinProfile,
        consistencyContradictions: data
      });
      alert("Credibility consistency check complete!");
    } catch (err: any) {
      alert("Integrity Scan error: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTriggerPortfolioAudit = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/gemini/analyze-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github: twinProfile.gitHubUrl,
          linkedin: twinProfile.linkedInUrl,
          cgpa: twinProfile.cgpa,
          dsaLevel: twinProfile.dsaLevel,
          skills: twinProfile.strongSkills
        })
      });

      if (!res.ok) throw new Error("Failed to query portfolio scanner.");
      const data = await res.json();
      
      // Update score and reward
      const newXp = twinProfile.xp + 40;
      saveTwinProfile({
        ...twinProfile,
        portfolioScore: data.score,
        xp: newXp,
        level: Math.floor(Math.sqrt(newXp / 100)) || 1
      });
      alert(`Portfolio audit updated! Scored: ${data.score}/100. (+40 XP)`);
    } catch(err: any) {
      alert("Portfolio audit error: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Clipboard copies helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Roadmap Check
  const toggleRoadmapTask = (id: string) => {
    const updated = roadmap.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    saveRoadmap(updated);

    // Reward smaller XP
    const item = roadmap.find(r => r.id === id);
    if (item && !item.completed) {
      const newXp = twinProfile.xp + 15;
      saveTwinProfile({
        ...twinProfile,
        xp: newXp,
        level: Math.floor(Math.sqrt(newXp / 100)) || 1
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Global AI Loading Indicator */}
      {aiLoading && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-950 animate-pulse"></div>
              <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Consulting Gemini Career Coach...</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Applying advanced natural language reasoning to polish STAR responses, generate elevator pitches, and align portfolio scores.
            </p>
          </div>
        </div>
      )}

      {/* 2. Brand Welcome Hero */}
      <div className="relative bg-linear-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-950/50 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md">
                Active Career Twin
              </span>
              <span className="text-slate-400 text-xs">Updated just now</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight">InterviewOS Workspace</h1>
            <p className="text-indigo-200/80 text-xs md:text-sm mt-1.5 max-w-xl">
              An AI-driven personal career operating system. Track streaks, practice verbal posture, test keyword alignments, and audit credibility discrepancies from a unified workspace.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => onNavigate("mock")}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10"
            >
              <Video size={14} />
              Drill Interview Room
            </button>
            <button 
              onClick={() => onNavigate("resume")}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-white font-bold text-xs px-5 py-3 rounded-xl"
            >
              <FileText size={14} />
              Optimize Resume
            </button>
          </div>
        </div>
      </div>

      {/* 3. Outer Bento Counters Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Video size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Completed Mocks</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{completedSessions.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Mock Composite</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {latestMockScore > 0 ? `${latestMockScore}%` : "—"}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Resume Match</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {currentAtsScore > 0 ? `${currentAtsScore}%` : "Not Scored"}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Career XP Level</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">Lvl {levelInfo.level}</h3>
          </div>
        </div>
      </div>

      {/* 4. Sub Tab Navigation Header */}
      <div className="border-b border-slate-200 dark:border-slate-850 flex gap-1 overflow-x-auto pb-px">
        {[
          { id: "twin", label: "Career Digital Twin", icon: Trophy },
          { id: "predictor", label: "Placement Predictor", icon: Compass },
          { id: "roadmap", label: "AI Career Roadmap", icon: Activity },
          { id: "star", label: "STAR Story Library", icon: BookOpen },
          { id: "pitch", label: "Elevator Pitch Studio", icon: Mic },
          { id: "integrity", label: "Integrity Credibility Scan", icon: ShieldAlert }
        ].map(tabItem => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setSubTab(tabItem.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
                subTab === tabItem.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={14} />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* 5. Sub Tab Body Router */}
      <div className="min-h-[400px]">
        
        {/* --- TAB A: DIGITAL TWIN --- */}
        {subTab === "twin" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gamification Left Block */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">Level {levelInfo.level}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Professional Grade XP: {twinProfile.xp} / {levelInfo.nextLvlXp}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Trophy size={18} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-[10px] text-slate-400 mt-1 font-mono font-bold">{levelInfo.progressPercent}% progress to Level {levelInfo.level + 1}</p>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Streak Tracker</h4>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div 
                        key={day} 
                        className={`flex-1 text-center p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          day <= twinProfile.streakCount
                            ? "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-600"
                            : "bg-slate-50/50 dark:bg-slate-850/40 border-transparent text-slate-300 dark:text-slate-600"
                        }`}
                      >
                        <span className="text-[9px] font-bold">D{day}</span>
                        <CheckCircle size={11} className={`mt-1 ${day <= twinProfile.streakCount ? "opacity-100" : "opacity-20"}`} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
                    Active Streak: <strong className="text-indigo-600 dark:text-indigo-400">{twinProfile.streakCount} days</strong>. Practice daily to avoid XP decay.
                  </p>
                </div>
              </div>

              {/* Badges Container */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Award size={16} className="text-indigo-600" />
                  Unlocked Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {twinProfile.badges.map(badge => (
                    <div key={badge.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100/30 dark:border-slate-800/40 flex flex-col items-center text-center">
                      <div className="bg-white dark:bg-slate-900 p-2 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-inner">
                        {badge.icon === "Trophy" ? <Trophy size={16} /> : <BookOpen size={16} />}
                      </div>
                      <p className="font-bold text-[10px] text-slate-800 dark:text-slate-200 mt-2 truncate w-full">{badge.name}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5 leading-tight truncate w-full">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inputs & Profile Right Block */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">Overarching Profile Config</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">This profile serves as the foundational data of your Career Twin.</p>
                  </div>
                  <button 
                    onClick={handleTriggerPortfolioAudit}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
                  >
                    <RefreshCw size={11} />
                    Audit Portfolio
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">GPA/Grades Equivalent</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={twinProfile.cgpa}
                      onChange={(e) => saveTwinProfile({ ...twinProfile, cgpa: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">DSA & Coding level</label>
                    <select
                      value={twinProfile.dsaLevel}
                      onChange={(e: any) => saveTwinProfile({ ...twinProfile, dsaLevel: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                    >
                      <option value="Beginner">Beginner (Basic Algorithms)</option>
                      <option value="Intermediate">Intermediate (Trees, Graphs, Recursion)</option>
                      <option value="Advanced">Advanced (Hard Dynamic Prog, Segment Trees)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">GitHub Repository Profile Link</label>
                    <div className="relative">
                      <Github size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="url" 
                        value={twinProfile.gitHubUrl}
                        onChange={(e) => saveTwinProfile({ ...twinProfile, gitHubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">LinkedIn Career URL</label>
                    <div className="relative">
                      <Linkedin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="url" 
                        value={twinProfile.linkedInUrl}
                        onChange={(e) => saveTwinProfile({ ...twinProfile, linkedInUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio Score Card */}
                <div className="mt-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">Dynamic Twin Readiness Score</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-bold font-mono">{twinProfile.portfolioScore}/100</strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${twinProfile.portfolioScore}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2.5 leading-relaxed">
                    This score updates by running the AI Portfolio auditor. It uses your skills profile, public URLs completeness, and grade records to simulate recruiter vetting algorithms.
                  </p>
                </div>

                {/* Skill Chips List */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Identified Competency Gaps</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {twinProfile.strongSkills.map(s => (
                      <span key={s} className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        ✓ {s}
                      </span>
                    ))}
                    {twinProfile.weakSkills.map(w => (
                      <span key={w} className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        ⚠ Needs Improvement: {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB B: PLACEMENT PREDICTOR --- */}
        {subTab === "predictor" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-850 gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">Dynamic Career Match Simulator</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Weighing mock grades, DSA experience, and ATS resume compatibility ratios.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-hidden font-bold"
                >
                  {COMPANIES.map(comp => (
                    <option key={comp.id} value={comp.id}>Target: {comp.name}</option>
                  ))}
                </select>

                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Target Role (e.g. Front End)"
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-hidden font-bold"
                />
              </div>
            </div>

            {/* Simulated Clearing Probability View */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">Simulation Clearing Probability</p>
                
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Background Track */}
                  <svg className="absolute w-full h-full rotate-270" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(226,232,240,0.4)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" fill="transparent" 
                      stroke={predictorResult.score >= 80 ? "#10b981" : predictorResult.score >= 55 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - predictorResult.score / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold font-mono text-slate-800 dark:text-slate-100">{predictorResult.score}%</h2>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      predictorResult.status === "High" ? "bg-emerald-50 text-emerald-600" : predictorResult.status === "Moderate" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    }`}>
                      {predictorResult.status} Confidence
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-4 text-xs font-semibold">
                  <div className="text-center">
                    <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Target Bar</p>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{currentCompanyObj.reqMock}%</p>
                  </div>
                  <div className="border-r border-slate-200 dark:border-slate-800 h-8"></div>
                  <div className="text-center">
                    <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Your Mock</p>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{latestMockScore > 0 ? `${latestMockScore}%` : "0%"}</p>
                  </div>
                  <div className="border-r border-slate-200 dark:border-slate-800 h-8"></div>
                  <div className="text-center">
                    <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Resume</p>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{currentAtsScore > 0 ? `${currentAtsScore}%` : "0%"}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Company Breakdown Advice */}
              <div className="md:col-span-7 space-y-4">
                <div className={`p-4 bg-linear-to-r ${currentCompanyObj.barColor} text-white rounded-2xl`}>
                  <h4 className="font-extrabold text-sm flex items-center gap-2">
                    <Sparkles size={16} />
                    Target Bar: {currentCompanyObj.name}
                  </h4>
                  <p className="text-xs text-indigo-50/90 mt-1 leading-relaxed">
                    {currentCompanyObj.desc}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Dynamic Readiness Checklists</h4>
                  
                  <div className="space-y-2">
                    {/* ATS Verification */}
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100/20 dark:border-slate-800/20">
                      {predictorResult.atsGap <= 0 ? (
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle size={15} className="text-amber-500 shrink-0" />
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">ATS Resume Filter Matching</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {predictorResult.atsGap <= 0 
                            ? "Resume score exceeds target criteria!" 
                            : `Missing ${predictorResult.atsGap}% points. Improve keyword densities to bypass filters.`}
                        </p>
                      </div>
                    </div>

                    {/* Mock Interview Verification */}
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100/20 dark:border-slate-800/20">
                      {predictorResult.mockGap <= 0 ? (
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle size={15} className="text-amber-500 shrink-0" />
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">AI Recruiter Vocal Rigor</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {predictorResult.mockGap <= 0 
                            ? "Mock interview score matches requirements!" 
                            : `Your average is short by ${predictorResult.mockGap}%. Attempt another 2 technical mock sessions.`}
                        </p>
                      </div>
                    </div>

                    {/* DSA Verification */}
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100/20 dark:border-slate-800/20">
                      {!predictorResult.dsaGap ? (
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle size={15} className="text-red-500 shrink-0" />
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">DSA & Algorithm Readiness</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {predictorResult.dsaGap 
                            ? "Beginner status risks algorithmic disqualification at this company. Upgrade DSA level." 
                            : "Your current DSA level aligns well with the company's technical expectation."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- TAB C: ROADMAP TASK CHECKLIST --- */}
        {subTab === "roadmap" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">AI Career Roadmap Tasks</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Check off items to complete milestones and earn +15 XP per item.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Daily", "Weekly", "Monthly"].map(period => {
                const items = roadmap.filter(r => r.period === period);
                return (
                  <div key={period} className="bg-slate-50 dark:bg-slate-850/60 p-4 rounded-xl border border-slate-100/20 dark:border-slate-800/20 space-y-4">
                    <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                      {period} Milestone Tasks
                    </span>
                    
                    <div className="space-y-3">
                      {items.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => toggleRoadmapTask(item.id)}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800/60 flex items-start gap-3 cursor-pointer select-none hover:border-indigo-400 transition-colors"
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.completed ? (
                              <CheckCircle2 className="text-emerald-500" size={16} />
                            ) : (
                              <Circle className="text-slate-300 dark:text-slate-600 hover:text-indigo-500" size={16} />
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-xs ${item.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB D: STAR STORY LIBRARY --- */}
        {subTab === "star" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Left Column */}
            <div className="lg:col-span-5">
              <form onSubmit={handleCreateStory} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight pb-3 border-b border-slate-100 dark:border-slate-850">
                  Log a New STAR Experience
                </h3>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Story Title</label>
                  <input 
                    type="text" 
                    required
                    value={storyForm.title}
                    onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                    placeholder="e.g. Speeding Up Database Queries"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Category Category</label>
                    <select
                      value={storyForm.category}
                      onChange={(e: any) => setStoryForm({ ...storyForm, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500 font-medium"
                    >
                      <option value="Leadership">Leadership</option>
                      <option value="Failure">Failure / Learn</option>
                      <option value="Conflict">Conflict Resolution</option>
                      <option value="Innovation">Technical Innovation</option>
                      <option value="Teamwork">Teamwork & Collab</option>
                      <option value="Deadline">Deadline Pressure</option>
                      <option value="Ownership">Extreme Ownership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Situation (Context)</label>
                  <textarea 
                    required
                    rows={2}
                    value={storyForm.situation}
                    onChange={(e) => setStoryForm({ ...storyForm, situation: e.target.value })}
                    placeholder="Describe the context: What was the goal or core bottleneck?"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Task (Objective)</label>
                  <textarea 
                    required
                    rows={2}
                    value={storyForm.task}
                    onChange={(e) => setStoryForm({ ...storyForm, task: e.target.value })}
                    placeholder="What exact target was expected of you?"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Action (What You Did)</label>
                  <textarea 
                    required
                    rows={3}
                    value={storyForm.action}
                    onChange={(e) => setStoryForm({ ...storyForm, action: e.target.value })}
                    placeholder="Detail your actions: specific design, testing, or code choices..."
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Result (Outcome / Metrics)</label>
                  <textarea 
                    required
                    rows={2}
                    value={storyForm.result}
                    onChange={(e) => setStoryForm({ ...storyForm, result: e.target.value })}
                    placeholder="Quantify results if possible (e.g. 20% speedup, 0 bugs)."
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  Save STAR Story (+50 XP)
                </button>
              </form>
            </div>

            {/* List Right Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs flex-1">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-4">
                  Your Experienced Stories Library ({stories.length})
                </h3>

                {stories.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-xs text-slate-500">No STAR experience stories logged yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Build modular structured examples from internships, personal projects, or DSA contests.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                    {stories.map(story => (
                      <div 
                        key={story.id}
                        className="bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                              {story.category}
                            </span>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-1.5">{story.title}</h4>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleOptimizeStory(story.id)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg hover:scale-105 transition-all"
                              title="Gemini AI Optimization rewrite"
                            >
                              <Sparkles size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteStory(story.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* STAR raw data */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                            <strong className="text-slate-400">Situation:</strong>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{story.situation}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                            <strong className="text-slate-400">Task:</strong>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{story.task}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                            <strong className="text-slate-400">Action:</strong>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{story.action}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                            <strong className="text-slate-400">Result:</strong>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{story.result}</p>
                          </div>
                        </div>

                        {/* Optimized draft render */}
                        {story.starAnswer && (
                          <div className="mt-2.5 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/30 dark:border-indigo-900/40 rounded-xl relative">
                            <div className="absolute top-2.5 right-2.5">
                              <button 
                                onClick={() => copyToClipboard(story.starAnswer!, story.id)}
                                className="text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform p-1 bg-white dark:bg-slate-900 rounded-lg"
                              >
                                {copiedId === story.id ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                            <span className="text-[8px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1.5">
                              <Sparkles size={10} /> Optimized Delivery Narrative
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 text-[10px] leading-relaxed pr-6 italic">
                              "{story.starAnswer}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB E: ELEVATOR PITCH --- */}
        {subTab === "pitch" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-850 gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">AI Elevator Pitch Studio</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Generate customized high-impact spoken declarations tailored to specific roles.</p>
              </div>
              <button 
                onClick={handleGeneratePitch}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Sparkles size={13} />
                Generate Elevator Pitches
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Pitch Configurations Left */}
              <div className="md:col-span-4 bg-slate-50 dark:bg-slate-850/60 p-5 rounded-2xl border border-slate-100/20 dark:border-slate-800/20 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={14} className="text-indigo-600" />
                  Pitch Setup
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Speak Target length</label>
                    <div className="flex gap-1.5">
                      {[
                        { id: "pitch30s", label: "30s (75w)" },
                        { id: "pitch60s", label: "60s (150w)" },
                        { id: "pitch90s", label: "90s (225w)" }
                      ].map(len => (
                        <button
                          key={len.id}
                          onClick={() => setPitchLength(len.id as any)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            pitchLength === len.id 
                              ? "bg-indigo-600 text-white" 
                              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {len.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Target Position</label>
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Product Engineer"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Highlight Gaps / Focus</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {twinProfile.strongSkills.map(s => (
                        <span key={s} className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[8px] px-2 py-0.5 rounded-md font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pitch Display Right */}
              <div className="md:col-span-8 flex flex-col h-full min-h-[250px]">
                <div className="flex-1 bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-xl relative flex flex-col justify-between">
                  
                  {/* Top copy indicator */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-indigo-400">
                      SPEECH TELEPROMPTER • {pitchLength === "pitch30s" ? "30 Sec Outline" : pitchLength === "pitch60s" ? "60 Sec Outline" : "90 Sec Outline"}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(generatedPitches[pitchLength] || "", "speech_copy")}
                      className="text-indigo-400 hover:scale-105 transition-all p-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1 text-[9px] font-bold"
                    >
                      {copiedId === "speech_copy" ? (
                        <>
                          <CheckCircle size={10} className="text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          Copy Draft
                        </>
                      )}
                    </button>
                  </div>

                  {/* Main Transcript Body */}
                  <div className="flex-1 py-6">
                    <p className="text-slate-300 font-serif text-sm md:text-base leading-relaxed italic pr-4">
                      "{generatedPitches[pitchLength] || "Click generate to build tailored elevator drafts using your active digital twin profile parameters."}"
                    </p>
                  </div>

                  {/* Verbal advice warning */}
                  <div className="pt-3 border-t border-slate-850 flex items-center gap-2 text-[9px] text-slate-500">
                    <Clock size={11} />
                    <span>Verbal pace guideline: speak at ~130 words per minute. Practice delivery in Mock Interview tab.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- TAB F: LOGICAL CONSISTENCY INTEGRITY CHECKER --- */}
        {subTab === "integrity" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-850 gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">AI Transcript Credibility Scan</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Scans all completed mock interview transcripts to identify structural contradictions or factual inflation.</p>
              </div>
              <button 
                onClick={handleIntegrityCheck}
                disabled={completedSessions.length === 0}
                className={`bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  completedSessions.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-102 active:scale-98"
                }`}
              >
                <Cpu size={14} />
                Run Factual Integrity Scan
              </button>
            </div>

            {completedSessions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80">
                <ShieldAlert size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-xs text-slate-600 dark:text-slate-300">Mock Session Data Required</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
                  You must complete at least 1 mock interview session first so our validator can cross-reference answer transcripts for consistency anomalies.
                </p>
                <button
                  onClick={() => onNavigate("mock")}
                  className="mt-4 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg"
                >
                  Go Complete a Mock Run
                </button>
              </div>
            ) : !integrityScanned ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-100/20 dark:border-slate-800/20">
                <ShieldCheck size={40} className="mx-auto text-indigo-500 mb-2 animate-bounce" />
                <p className="font-bold text-xs text-slate-700 dark:text-slate-300">Awaiting Integrity Validation Scan</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Your mock session history holds {completedSessions.reduce((acc, curr) => acc + curr.responses.length, 0)} spoken responses. Click scan above to parse facts and timelines.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck size={18} className="text-emerald-600 mt-0.5" />
                  <div className="text-xs text-emerald-800 dark:text-emerald-400">
                    <p className="font-bold">Scan Complete — Logical Contradiction Reports</p>
                    <p className="text-[10px] mt-0.5 leading-relaxed">
                      Cross-referenced transcripts successfully. Recruiter filters often use AI parser validation to flag high-risk timeline discrepancies.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {contradictions.length === 0 ? (
                    <div className="p-6 bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center rounded-xl">
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">✓ Perfect Fact Match!</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">No conflicting figures or narrative loopholes detected in your responses. Rigor and credibility remain absolute.</p>
                    </div>
                  ) : (
                    contradictions.map((con, idx) => (
                      <div key={con.id || idx} className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-100/30 dark:border-red-900/40 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                          <AlertCircle size={13} />
                          <span>Contradiction Topic: {con.topic}</span>
                        </div>
                        
                        <div className="space-y-1.5 pl-5">
                          {con.statements.map((state, sidx) => (
                            <p key={sidx} className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                              - "{state}"
                            </p>
                          ))}
                        </div>

                        <p className="text-[10px] text-slate-600 dark:text-slate-400 pl-5 pt-1.5 border-t border-red-100/20 dark:border-red-900/10">
                          <strong>AI Diagnosis:</strong> {con.explanation}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

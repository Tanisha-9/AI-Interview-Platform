import React from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Sparkles, 
  ChevronRight, 
  Award, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Volume2, 
  Play, 
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Send,
  User,
  BrainCircuit
} from "lucide-react";
import { Question, InterviewSession, ResponseItem, ResponseScore, IntegrityEvent } from "../types";

interface MockInterviewRoomProps {
  onSessionCompleted: (session: InterviewSession) => void;
}

// Check for Web Speech API
const SpeechRecognition = 
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function MockInterviewRoom({ onSessionCompleted }: MockInterviewRoomProps) {
  // Config state
  const [role, setRole] = React.useState("Full-Stack Software Engineer");
  const [company, setCompany] = React.useState("Google");
  const [experience, setExperience] = React.useState("Mid-Level (3-5 years)");
  const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">("Medium");
  
  // App states
  const [step, setStep] = React.useState<"setup" | "interview" | "scoring" | "completed">("setup");
  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  
  // Interview active session
  const [session, setSession] = React.useState<InterviewSession | null>(null);
  
  // Media controls
  const [cameraActive, setCameraActive] = React.useState(false);
  const [micActive, setMicActive] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  // Speech Transcription
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const recognitionRef = React.useRef<any>(null);

  // Answer scoring flow
  const [isScoringAnswer, setIsScoringAnswer] = React.useState(false);
  const [singleScore, setSingleScore] = React.useState<ResponseScore | null>(null);

  // Dynamic Follow-up Thread state
  const [followUpText, setFollowUpText] = React.useState("");
  const [isFollowUpCompleted, setIsFollowUpCompleted] = React.useState(true);
  const [previousFollowUps, setPreviousFollowUps] = React.useState<string[]>([]);

  // Preparation Timer for question (seconds)
  const [prepTimer, setPrepTimer] = React.useState(30);
  const [answerTimer, setAnswerTimer] = React.useState(120);
  const [timerMode, setTimerMode] = React.useState<"prep" | "answer" | "paused">("prep");

  // Integrity Logging
  const [integrityScore, setIntegrityScore] = React.useState(100);
  const [integrityEvents, setIntegrityEvents] = React.useState<IntegrityEvent[]>([]);

  // 1. WebRTC Camera & Mic Setup
  const startMedia = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);
    } catch (error) {
      console.error("Camera access failed:", error);
      // Fallback for demo environments: we will still allow starting mock even if physical webcam is blocked/missing
      setCameraActive(false);
      setMicActive(false);
    }
  };

  const stopMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setMicActive(false);
  };

  // 2. Web Speech API - Real-time transcription
  React.useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + " ";
          }
        }
        if (finalTrans) {
          setTranscript(prev => (prev + " " + finalTrans).trim());
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
      };

      rec.onend = () => {
        if (isListening) {
          // Restart recognition if it gets turned off unexpectedly but user is listening
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error(e);
          }
        }
      };

      recognitionRef.current = rec;
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please type your responses manually below.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
      setTimerMode("answer");
    }
  };

  // 3. Tab Switch Integrity detector
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && step === "interview") {
        logIntegrityEvent("tab_switch", "User navigated away from the interview interface (tab switched/minimized).");
      }
    };

    const handleWindowBlur = () => {
      if (step === "interview") {
        logIntegrityEvent("tab_switch", "User clicked out of the interview screen (window lost focus).");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [step]);

  const logIntegrityEvent = (type: "tab_switch" | "face_lost" | "unusual_typing", details: string) => {
    const newEvent: IntegrityEvent = {
      id: "ev_" + Math.random().toString(36).substr(2, 9),
      type,
      details,
      timestamp: new Date().toISOString()
    };
    setIntegrityEvents(prev => [...prev, newEvent]);
    setIntegrityScore(prev => Math.max(0, prev - 15)); // deduct 15 points per cheating behavior
  };

  // 4. Timers handling
  React.useEffect(() => {
    if (step !== "interview" || timerMode === "paused") return;

    const interval = setInterval(() => {
      if (timerMode === "prep") {
        setPrepTimer(prev => {
          if (prev <= 1) {
            setTimerMode("answer");
            return 30;
          }
          return prev - 1;
        });
      } else if (timerMode === "answer") {
        setAnswerTimer(prev => {
          if (prev <= 1) {
            setTimerMode("paused");
            return 120;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timerMode]);

  // 5. Setup Action: Generate customized interview questions
  const initializeInterview = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skills: [], experience })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setQuestions(data);
      setCurrentIdx(0);
      setIntegrityScore(100);
      setIntegrityEvents([]);
      setStep("interview");
      setPrepTimer(30);
      setAnswerTimer(120);
      setTimerMode("prep");
      setTranscript("");
      setFollowUpText("");
      setIsFollowUpCompleted(true);
      setPreviousFollowUps([]);
      setSingleScore(null);
      
      const newSession: InterviewSession = {
        id: "sess_" + Math.random().toString(36).substr(2, 9),
        jobRole: role,
        company,
        interviewType: "voice",
        status: "active",
        integrityScore: 100,
        startedAt: new Date().toISOString(),
        questions: data,
        responses: [],
        integrityEvents: [],
        timelineEvents: [],
        confidenceCurve: []
      };
      setSession(newSession);
      startMedia();
    } catch (err: any) {
      alert("Error initiating AI interview planner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Action: Grade Response
  const submitAnswer = async () => {
    if (!transcript.trim()) {
      alert("Please provide an answer first, either by speaking or typing!");
      return;
    }

    if (isListening) {
      toggleListening();
    }

    setIsScoringAnswer(true);
    try {
      const currentQ = questions[currentIdx];
      const response = await fetch("/api/gemini/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: currentQ.text,
          transcript,
          modelAnswer: currentQ.modelAnswer
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setSingleScore(data);

      // Save response item
      const responseItem: ResponseItem = {
        questionId: currentQ.id,
        questionText: currentQ.text,
        category: currentQ.category,
        difficulty: currentQ.difficulty,
        transcript,
        score: data
      };

      if (session) {
        const updatedResponses = [...session.responses, responseItem];
        setSession({
          ...session,
          responses: updatedResponses
        });
      }

      // Check if candidate would benefit from an adaptive follow-up
      if (isFollowUpCompleted) {
        await checkAndGenerateFollowUp(currentQ.text, transcript);
      } else {
        setIsFollowUpCompleted(true);
      }

    } catch (err: any) {
      alert("Scoring failed: " + err.message);
    } finally {
      setIsScoringAnswer(false);
    }
  };

  // 7. Adaptive Follow-up generator
  const checkAndGenerateFollowUp = async (qText: string, ansText: string) => {
    try {
      const response = await fetch("/api/gemini/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          questionText: qText,
          transcript: ansText,
          previousFollowUps
        })
      });
      const data = await response.json();
      if (data.isComplete) {
        setIsFollowUpCompleted(true);
      } else {
        setIsFollowUpCompleted(false);
        setFollowUpText(data.text);
        setPreviousFollowUps(prev => [...prev, data.text]);
        // Reset answer timers for the follow-up
        setTranscript("");
        setAnswerTimer(90);
        setTimerMode("prep");
      }
    } catch (e) {
      console.error("Adaptive follow-up generator error:", e);
      setIsFollowUpCompleted(true);
    }
  };

  // 8. Next Question Action
  const nextQuestion = () => {
    setSingleScore(null);
    setTranscript("");
    setFollowUpText("");
    setIsFollowUpCompleted(true);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setPrepTimer(30);
      setAnswerTimer(120);
      setTimerMode("prep");
    } else {
      finishInterview();
    }
  };

  // 9. Conclude session: Generate grand overall synthesis
  const finishInterview = async () => {
    if (!session) return;
    setLoading(true);
    setStep("scoring");
    stopMedia();

    try {
      const response = await fetch("/api/gemini/overall-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: role,
          company,
          responses: session.responses
        })
      });
      const report = await response.json();
      
      const completedSession: InterviewSession = {
        ...session,
        status: "completed",
        endedAt: new Date().toISOString(),
        integrityScore: integrityScore,
        integrityEvents: integrityEvents,
        overallReport: report
      };

      setSession(completedSession);
      onSessionCompleted(completedSession);
      setStep("completed");
    } catch (err: any) {
      alert("Synthesizing failed: " + err.message);
      setStep("completed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm overflow-hidden">
      {step === "setup" && (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <BrainCircuit size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Setup Practising Preferences</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Select your role and background, and the modern Gemini engine will compile bespoke interview scenarios.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Professional Role
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Experience Seniority
                </label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Junior (0-2 years)</option>
                  <option>Mid-Level (3-5 years)</option>
                  <option>Senior (5+ years)</option>
                  <option>Lead / Architect</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                AI Difficulty Constraints
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["Easy", "Medium", "Hard"] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2.5 rounded-xl border font-bold text-xs transition-all ${
                      difficulty === d
                        ? "bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                        : "bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={initializeInterview}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-600/10 active:scale-[0.98]"
            >
              {loading ? (
                <span>Generating custom scenario...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  Compile & Initiate Mock Session
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "interview" && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live HUD webcam + controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center text-white shadow-md">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="text-center p-4">
                  <VideoOff size={40} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">Webcam stream inactive</p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
                    Ensure camera access is granted, or continue mock practice using audio/text fallbacks.
                  </p>
                </div>
              )}

              {/* Webcam indicators */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE PRACTICE CAM
              </div>
            </div>

            {/* Media toggle buttons */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={cameraActive ? stopMedia : startMedia}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  cameraActive
                    ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    : "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40"
                }`}
              >
                {cameraActive ? <VideoOff size={14} /> : <Video size={14} />}
                Cam
              </button>
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  micActive
                    ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    : "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40"
                }`}
              >
                {micActive ? <MicOff size={14} /> : <Mic size={14} />}
                Mic
              </button>
            </div>

            {/* Integrity / Anti-Cheating Indicators HUD */}
            <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Session Trust Score
                </span>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    integrityScore >= 80
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {integrityScore}% Trust
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    integrityScore >= 80 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${integrityScore}%` }}
                ></div>
              </div>

              {/* Recent events logger */}
              {integrityEvents.length > 0 ? (
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {integrityEvents.map(ev => (
                    <div key={ev.id} className="flex gap-1.5 items-start text-[9px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                      <p className="leading-tight">{ev.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
                  No formatting or focus anomalies recorded. Good job.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Question hud & transcription input */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            {/* Question card */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-indigo-950/20 dark:to-indigo-900/5 border border-indigo-100/30 dark:border-indigo-900/30 rounded-2xl p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length} • {questions[currentIdx].category}
                </span>
                
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  <Clock size={14} />
                  {timerMode === "prep" ? (
                    <span className="text-indigo-600 dark:text-indigo-400">Prep: {prepTimer}s</span>
                  ) : (
                    <span>Answer: {answerTimer}s</span>
                  )}
                </div>
              </div>

              {/* Actual question text */}
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {isFollowUpCompleted ? questions[currentIdx].text : followUpText}
              </h3>

              {!isFollowUpCompleted && (
                <div className="mt-3.5 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900/20 px-3.5 py-2 rounded-xl flex items-start gap-2">
                  <Volume2 className="text-indigo-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 italic font-medium leading-tight">
                    AI Contextual Follow-up Question
                  </p>
                </div>
              )}
            </div>

            {/* Answer Box */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Answer Transcript
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Mic size={12} />
                    {isListening ? "Listening..." : "Speak Answer"}
                  </button>
                  <button
                    onClick={() => setTranscript("")}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition-all"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>

              {/* Text Area transcription box */}
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Talk on camera, or write your structured answer in detail here. High-quality answers generally include technical keywords, direct STAR accomplishments, or precise action steps."
                className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />

              {/* Evaluation score preview */}
              {singleScore && (
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Intermediate Score Feedback
                    </span>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                      Answer Grade: {singleScore.overall}/10
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l: "Clarity", val: singleScore.clarity },
                      { l: "Relevance", val: singleScore.relevance },
                      { l: "Depth", val: singleScore.depth },
                      { l: "Comm", val: singleScore.communication }
                    ].map(p => (
                      <div key={p.l} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-lg text-center">
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{p.l}</p>
                        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{p.val}/10</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
                    {singleScore.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to exit? Your progress for this practice session will be lost.")) {
                    stopMedia();
                    setStep("setup");
                  }
                }}
                className="text-xs font-semibold hover:text-slate-900 text-slate-500 dark:hover:text-slate-300"
              >
                Quit Session
              </button>

              <div className="flex gap-2">
                {!singleScore ? (
                  <button
                    onClick={submitAnswer}
                    disabled={isScoringAnswer || !transcript.trim()}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {isScoringAnswer ? (
                      <span>Analyzing response...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        Submit & Grade Answer
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    {currentIdx + 1 < questions.length ? "Next Question" : "View Comprehensive Evaluation"}
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "scoring" && (
        <div className="text-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 mx-auto"></div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Compiling Evaluation Matrix</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto">
            The Gemini recruiter engine is evaluating your transcripts, speech flow, integrity metrics, and rubric compliance to formulate a career preparation report.
          </p>
        </div>
      )}

      {step === "completed" && session && session.overallReport && (
        <div className="max-w-3xl mx-auto space-y-6 py-4">
          {/* Header Summary Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-lg border border-emerald-500/20 text-center relative overflow-hidden">
            <span className="bg-emerald-500 bg-opacity-35 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              AI RECRUITER REPORT SUMMARY
            </span>
            <div className="mt-4 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-extrabold">{session.overallReport.compositeScore}%</h2>
              <p className="text-xs text-emerald-100 font-medium mt-1 uppercase tracking-wider">Composite Prep Score</p>
            </div>
            <p className="text-emerald-50 text-sm mt-3 max-w-md mx-auto">
              Outstanding effort practicing your interview skills. Here is your personalized Career Coaching Roadmap.
            </p>
          </div>

          {/* Dual columns for strengths/weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 rounded-xl">
              <h4 className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle size={14} />
                Key Architectural Strengths
              </h4>
              <ul className="space-y-2">
                {session.overallReport.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-emerald-400">
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/20 rounded-xl">
              <h4 className="font-extrabold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldAlert size={14} />
                Gaps & Gaps For Improvement
              </h4>
              <ul className="space-y-2">
                {session.overallReport.areasForImprovement.map((area, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-amber-400">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coaching advice block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit size={14} className="text-indigo-500" />
              Comprehensive Recruiting Coaching Roadmap
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {session.overallReport.coachingAdvice}
            </p>
          </div>

          {/* Integrity Compliance */}
          {session.integrityEvents.length > 0 && (
            <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/20 dark:border-amber-900/20 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Focus & Formatting Anomaly Logs
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                During the mock practice session, our interface noted a couple of focus indicators or tab-switches. Make sure to maintain strict browser focus to simulate professional testing platform constraints.
              </p>
              <div className="space-y-1 pt-1">
                {session.integrityEvents.map(ev => (
                  <div key={ev.id} className="text-[10px] text-slate-600 dark:text-slate-400 pl-3 border-l border-amber-300">
                    {new Date(ev.timestamp).toLocaleTimeString([], { timeStyle: "short" })} • {ev.details}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Re-practice actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep("setup")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              Practice Another Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

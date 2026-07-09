import React from "react";
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  ListChecks, 
  Settings, 
  Info,
  ExternalLink,
  BookOpen,
  UserCheck
} from "lucide-react";
import { AtsResult } from "../types";

export default function AtsScorer() {
  const [resumeText, setResumeText] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AtsResult | null>(null);

  // Load from local storage on mount
  React.useEffect(() => {
    const cached = localStorage.getItem("ats_latest_result");
    if (cached) {
      try {
        setResult(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleScore = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert("Please paste both your resume text and target job description to run the parser!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gemini/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      // Save latest scores to localStorage
      localStorage.setItem("ats_latest_result", JSON.stringify(data));
      localStorage.setItem("ats_latest_score", data.score.toString());
    } catch (err: any) {
      alert("ATS evaluation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    localStorage.removeItem("ats_latest_result");
    localStorage.removeItem("ats_latest_score");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="text-indigo-500" />
            ATS Resume Optimizer
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            Evaluate keyword density and alignment against target job descriptions.
          </p>
        </div>
        {result && (
          <button
            onClick={clearResult}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Reset Analysis
          </button>
        )}
      </div>

      {!result ? (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job description paste block */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Target Job Description (Paste Text)
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the core requirements, responsibilities, or technical specification text of the job post here."
                className="w-full min-h-[220px] p-4 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Resume text paste block */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Your Resume Draft (Paste Text)
              </label>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste the current text draft of your resume (including Experiences, Skills, Projects) here."
                className="w-full min-h-[220px] p-4 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          <button
            onClick={handleScore}
            disabled={loading || !resumeText.trim() || !jobDescription.trim()}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span>Simulating ATS Keyword Scanner...</span>
            ) : (
              <>
                <Sparkles size={16} className="text-indigo-400" />
                Analyze ATS Alignment
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {/* Main Scoring visual row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/50 dark:bg-slate-850/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            {/* Visual Gauge circle */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    strokeWidth="10"
                    fill="transparent"
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - result.score / 100)}`}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${
                      result.score >= 80
                        ? "stroke-emerald-500"
                        : result.score >= 60
                        ? "stroke-amber-500"
                        : "stroke-rose-500"
                    }`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                    {result.score}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">ATS Score</span>
                </div>
              </div>
            </div>

            {/* Overview results block */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Keywords Matching Metric
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {result.keywordMatchPercentage}%
                  </h3>
                  <p className="text-xs text-slate-400">of critical role-specific buzzwords matched</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Matched Keywords</p>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {result.matchedKeywords.length} Found
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Missing Gaps</p>
                  <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {result.missingKeywords.length} Unmatched
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed keyword breakdown badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="text-emerald-500" size={14} />
                Successfully Matched Buzzwords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.length > 0 ? (
                  result.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-lg"
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No keywords matched yet</span>
                )}
              </div>
            </div>

            <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <XCircle className="text-rose-400" size={14} />
                Critical Missing Buzzwords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.length > 0 ? (
                  result.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-lg"
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-emerald-600 font-bold">Excellent keyword matching score!</span>
                )}
              </div>
            </div>
          </div>

          {/* Gaps Analysis column layout */}
          <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="text-indigo-500" size={14} />
              Professional Skill Gap Synthesis
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Technical Competency</p>
                <ul className="space-y-1">
                  {result.skillsAnalysis.technical.slice(0, 5).map((sk, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                      {sk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Soft Qualities</p>
                <ul className="space-y-1">
                  {result.skillsAnalysis.soft.slice(0, 5).map((sk, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      {sk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Critical Gaps</p>
                <ul className="space-y-1">
                  {result.skillsAnalysis.gaps.slice(0, 5).map((sk, i) => (
                    <li key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle size={11} />
                      {sk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Structural Critique & Tips checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Structural Feedback */}
            <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-4">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ListChecks className="text-indigo-500" size={14} />
                Structural Critique
              </h4>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Impact & Metrics Alignment:</p>
                  <p className="mt-0.5">{result.structuralFeedback.impactStatements}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Formatting & ATS Parsability:</p>
                  <p className="mt-0.5">{result.structuralFeedback.formatting}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Linguistic Readability:</p>
                  <p className="mt-0.5">{result.structuralFeedback.readability}</p>
                </div>
              </div>
            </div>

            {/* Improvement Tips Checklist */}
            <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="text-indigo-500" size={14} />
                Action-Oriented Corrections Checklist
              </h4>

              <div className="space-y-2.5">
                {result.improvementTips.map((tip, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="p-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-500 rounded font-mono text-[9px] font-extrabold w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

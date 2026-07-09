import React from "react";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Printer, 
  HelpCircle,
  Briefcase,
  GraduationCap,
  Hammer,
  Heart,
  Settings,
  X,
  FileCheck
} from "lucide-react";
import { ResumeData } from "../types";

export default function ResumeEditor() {
  const defaultResume: ResumeData = {
    contact: {
      name: "Tanisha Ghanty",
      email: "tanishaghanty@gmail.com",
      phone: "+1 (555) 019-2834",
      location: "San Francisco, CA",
      website: "tanisha.dev"
    },
    summary: "Dedicated Full-Stack Software Engineer with 3+ years of experience building scalable web applications. Adept in TypeScript, React, Node.js, and server-side model integrations. Passionate about engineering high-impact tools that solve user needs with robust code structures.",
    experience: [
      {
        id: "exp_1",
        company: "InnovateTech Inc.",
        role: "Software Engineer",
        startDate: "Jun 2024",
        endDate: "Present",
        description: "Engineered responsive full-stack dashboards using React, Node.js, and Express, improving server latency by 20%. Led the migration of legacy database modules to Cloud SQL, securing client transactions and eliminating schema synchronization failures."
      }
    ],
    education: [
      {
        id: "edu_1",
        institution: "State University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        gradYear: "2024",
        gpa: "3.8/4.0"
      }
    ],
    skills: ["TypeScript", "JavaScript", "React", "Node.js", "Express", "Tailwind CSS", "PostgreSQL", "Firebase", "REST APIs", "Git"],
    projects: [
      {
        id: "proj_1",
        name: "Mock Interviewer AI Portal",
        description: "Built an interactive webcam practicing chamber leveraging browser Web Speech transcription and Gemini model evaluation pipelines. Scaled memory-efficient client local state structures to persist performance evaluation records.",
        techStack: ["React", "Express", "TypeScript", "Vite", "Gemini API"],
        link: "github.com/example/interview-portal"
      }
    ]
  };

  const [resume, setResume] = React.useState<ResumeData>(defaultResume);
  const [activeTab, setActiveTab] = React.useState<"edit" | "preview">("edit");

  // AI Improvement Modal / Dialog State
  const [improvingSection, setImprovingSection] = React.useState<string | null>(null);
  const [improvingFieldPath, setImprovingFieldPath] = React.useState<{ section: string, id?: string, field: string } | null>(null);
  const [isImproving, setIsImproving] = React.useState(false);
  const [aiCritique, setAiCritique] = React.useState("");
  const [aiImprovedText, setAiImprovedText] = React.useState("");

  // Load from local storage
  React.useEffect(() => {
    const cached = localStorage.getItem("resume_draft");
    if (cached) {
      try {
        setResume(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveResume = (updated: ResumeData) => {
    setResume(updated);
    localStorage.setItem("resume_draft", JSON.stringify(updated));
  };

  // Contacts handler
  const handleContactChange = (field: keyof ResumeData["contact"], val: string) => {
    const updated = {
      ...resume,
      contact: {
        ...resume.contact,
        [field]: val
      }
    };
    saveResume(updated);
  };

  // Skill handles
  const handleSkillsChange = (text: string) => {
    const list = text.split(",").map(s => s.trim()).filter(Boolean);
    saveResume({ ...resume, skills: list });
  };

  // Item adders
  const addExperience = () => {
    const newItem = {
      id: "exp_" + Date.now(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    saveResume({ ...resume, experience: [...resume.experience, newItem] });
  };

  const removeExperience = (id: string) => {
    saveResume({ ...resume, experience: resume.experience.filter(e => e.id !== id) });
  };

  const handleExperienceChange = (id: string, field: string, val: string) => {
    const list = resume.experience.map(exp => {
      if (exp.id === id) {
        return { ...exp, [field]: val };
      }
      return exp;
    });
    saveResume({ ...resume, experience: list });
  };

  const addEducation = () => {
    const newItem = {
      id: "edu_" + Date.now(),
      institution: "",
      degree: "",
      field: "",
      gradYear: "",
      gpa: ""
    };
    saveResume({ ...resume, education: [...resume.education, newItem] });
  };

  const removeEducation = (id: string) => {
    saveResume({ ...resume, education: resume.education.filter(e => e.id !== id) });
  };

  const handleEducationChange = (id: string, field: string, val: string) => {
    const list = resume.education.map(edu => {
      if (edu.id === id) {
        return { ...edu, [field]: val };
      }
      return edu;
    });
    saveResume({ ...resume, education: list });
  };

  const addProject = () => {
    const newItem = {
      id: "proj_" + Date.now(),
      name: "",
      description: "",
      techStack: [],
      link: ""
    };
    saveResume({ ...resume, projects: [...resume.projects, newItem] });
  };

  const removeProject = (id: string) => {
    saveResume({ ...resume, projects: resume.projects.filter(p => p.id !== id) });
  };

  const handleProjectChange = (id: string, field: string, val: any) => {
    const list = resume.projects.map(proj => {
      if (proj.id === id) {
        if (field === "techStack") {
          const arr = typeof val === "string" ? val.split(",").map(t => t.trim()).filter(Boolean) : val;
          return { ...proj, techStack: arr };
        }
        return { ...proj, [field]: val };
      }
      return proj;
    });
    saveResume({ ...resume, projects: list });
  };

  // AI Optimizer triggering
  const triggerAiImprovement = async (section: string, field: string, currentContent: string, id?: string) => {
    setImprovingSection(section);
    setImprovingFieldPath({ section, id, field });
    setIsImproving(true);
    setAiCritique("");
    setAiImprovedText("");

    try {
      const response = await fetch("/api/gemini/improve-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionName: section, sectionContent: currentContent })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiCritique(data.critique);
      setAiImprovedText(data.improvedContent);
    } catch (err: any) {
      alert("Failed to contact Gemini writer: " + err.message);
      setImprovingSection(null);
    } finally {
      setIsImproving(false);
    }
  };

  const acceptAiImprovement = () => {
    if (!improvingFieldPath) return;

    const { section, id, field } = improvingFieldPath;
    if (section === "Career Summary") {
      saveResume({ ...resume, summary: aiImprovedText });
    } else if (section === "Work Experience" && id) {
      const list = resume.experience.map(exp => {
        if (exp.id === id) {
          return { ...exp, [field]: aiImprovedText };
        }
        return exp;
      });
      saveResume({ ...resume, experience: list });
    } else if (section === "Projects" && id) {
      const list = resume.projects.map(proj => {
        if (proj.id === id) {
          return { ...proj, [field]: aiImprovedText };
        }
        return proj;
      });
      saveResume({ ...resume, projects: list });
    }

    setImprovingSection(null);
    setImprovingFieldPath(null);
  };

  // Browser-based beautiful Resume Print engine
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 dark:border-slate-850 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileCheck className="text-indigo-500" />
            Resume Builder & Editor
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            Create structured sections and optimize layouts using career writing guidelines.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "edit"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400"
            }`}
          >
            Form Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "preview"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400"
            }`}
          >
            Live Print Preview
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Printer size={13} />
            Export
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="mt-6 space-y-8">
          {/* Section 1: Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              Contact Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Name</label>
                <input
                  type="text"
                  value={resume.contact.name}
                  onChange={e => handleContactChange("name", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Email</label>
                <input
                  type="email"
                  value={resume.contact.email}
                  onChange={e => handleContactChange("email", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Phone</label>
                <input
                  type="text"
                  value={resume.contact.phone}
                  onChange={e => handleContactChange("phone", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Location</label>
                <input
                  type="text"
                  value={resume.contact.location}
                  onChange={e => handleContactChange("location", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Website</label>
                <input
                  type="text"
                  value={resume.contact.website}
                  onChange={e => handleContactChange("website", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Career Summary Statement
              </h3>
              <button
                onClick={() => triggerAiImprovement("Career Summary", "summary", resume.summary)}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
              >
                <Sparkles size={11} />
                Optimize Summary
              </button>
            </div>
            <textarea
              value={resume.summary}
              onChange={e => saveResume({ ...resume, summary: e.target.value })}
              className="w-full min-h-[80px] p-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Section 3: Work Experience list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                Work Experiences
              </h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
              >
                <Plus size={12} />
                Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {resume.experience.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3 relative group">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={e => handleExperienceChange(exp.id, "company", e.target.value)}
                        placeholder="e.g. Google"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={e => handleExperienceChange(exp.id, "role", e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={e => handleExperienceChange(exp.id, "startDate", e.target.value)}
                        placeholder="e.g. Jun 2024"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={e => handleExperienceChange(exp.id, "endDate", e.target.value)}
                        placeholder="e.g. Present"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Description Bullets</label>
                      <button
                        onClick={() => triggerAiImprovement("Work Experience", "description", exp.description, exp.id)}
                        className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-600 hover:text-indigo-500"
                      >
                        <Sparkles size={10} />
                        Improve Bullets
                      </button>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={e => handleExperienceChange(exp.id, "description", e.target.value)}
                      placeholder="Highlight technical hurdles solved and metric improvements using the X-Y-Z formula. (e.g. Engineered responsive full-stack dashboards using React and Express, improving server latency by 20%.)"
                      className="w-full min-h-[90px] p-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Skills list */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Technical Core Competencies (Comma-separated)
            </h3>
            <input
              type="text"
              value={resume.skills.join(", ")}
              onChange={e => handleSkillsChange(e.target.value)}
              placeholder="TypeScript, React, Node.js, Express, Tailwind CSS, PostgreSQL"
              className="w-full px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Section 5: Projects */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Featured Projects
              </h3>
              <button
                onClick={addProject}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
              >
                <Plus size={12} />
                Add Project
              </button>
            </div>

            <div className="space-y-6">
              {resume.projects.map((proj, idx) => (
                <div key={proj.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3 relative">
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Project Name</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={e => handleProjectChange(proj.id, "name", e.target.value)}
                        placeholder="e.g. Chat App Portal"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Tech Stack (Comma-separated)</label>
                      <input
                        type="text"
                        value={proj.techStack.join(", ")}
                        onChange={e => handleProjectChange(proj.id, "techStack", e.target.value)}
                        placeholder="React, Socket.IO"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Github/Live Link</label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={e => handleProjectChange(proj.id, "link", e.target.value)}
                        placeholder="e.g. github.com/user/project"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Project Details</label>
                      <button
                        onClick={() => triggerAiImprovement("Projects", "description", proj.description, proj.id)}
                        className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-600 hover:text-indigo-500"
                      >
                        <Sparkles size={10} />
                        Improve Details
                      </button>
                    </div>
                    <textarea
                      value={proj.description}
                      onChange={e => handleProjectChange(proj.id, "description", e.target.value)}
                      placeholder="Outline problem solving and product utility achievements."
                      className="w-full min-h-[70px] p-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Education */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Academic Background
              </h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
              >
                <Plus size={12} />
                Add Education
              </button>
            </div>

            <div className="space-y-6">
              {resume.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3 relative">
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Institution Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={e => handleEducationChange(edu.id, "institution", e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => handleEducationChange(edu.id, "degree", e.target.value)}
                        placeholder="e.g. B.S."
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Field</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={e => handleEducationChange(edu.id, "field", e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Grad/Exp Year</label>
                      <input
                        type="text"
                        value={edu.gradYear}
                        onChange={e => handleEducationChange(edu.id, "gradYear", e.target.value)}
                        placeholder="e.g. 2024"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Section Live Print Preview Layout */
        <div className="mt-6 p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-center overflow-x-auto">
          <div 
            id="printable-resume-node"
            className="w-full max-w-[700px] bg-white text-slate-900 p-8 shadow-md border border-slate-100 rounded-lg min-h-[900px] font-sans text-xs leading-relaxed flex flex-col justify-between"
            style={{ color: "#1e293b" }}
          >
            <div>
              {/* Header block */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">{resume.contact.name}</h1>
                <div className="flex justify-center flex-wrap gap-2 text-[10px] text-slate-500 font-medium">
                  <span>{resume.contact.email}</span>
                  <span>•</span>
                  <span>{resume.contact.phone}</span>
                  <span>•</span>
                  <span>{resume.contact.location}</span>
                  {resume.contact.website && (
                    <>
                      <span>•</span>
                      <span>{resume.contact.website}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary Statement */}
              {resume.summary && (
                <div className="mt-4">
                  <p className="text-slate-700 italic leading-relaxed text-[11px]">{resume.summary}</p>
                </div>
              )}

              {/* Work Experience */}
              {resume.experience.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1">
                    <Briefcase size={12} />
                    Work Experience
                  </h3>
                  
                  <div className="space-y-4">
                    {resume.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-start font-bold text-slate-800 text-[11px]">
                          <span>{exp.role} <span className="font-medium text-slate-500">at {exp.company}</span></span>
                          <span className="text-slate-400 text-[10px] font-medium">{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed pl-2 border-l border-slate-100">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Core Competencies skills block */}
              {resume.skills.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1">
                    <Hammer size={12} />
                    Technical Competencies
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resume.skills.map((sk, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[9.5px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1">
                    Featured Projects
                  </h3>
                  <div className="space-y-4">
                    {resume.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-start font-bold text-slate-800 text-[11px]">
                          <span>{proj.name}</span>
                          {proj.link && <span className="text-[10px] text-indigo-600 font-medium">{proj.link}</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Tech Stack: {proj.techStack.join(", ")}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 pl-2 border-l border-slate-100">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1">
                    <GraduationCap size={12} />
                    Education History
                  </h3>
                  <div className="space-y-3">
                    {resume.education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">{edu.institution}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{edu.degree} in {edu.field}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Class of {edu.gradYear}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
              Generated via AI Interview Planner & Manager • {new Date().getFullYear()}
            </div>
          </div>
        </div>
      )}

      {/* AI Improvement Modal Dialogue */}
      {improvingSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Gemini Optimizer: {improvingSection}
                </h3>
              </div>
              <button
                onClick={() => {
                  setImprovingSection(null);
                  setImprovingFieldPath(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {isImproving ? (
                <div className="text-center py-10 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 mx-auto"></div>
                  <p className="text-xs text-slate-500 font-semibold">Rewriting section into metrics-driven bullets...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Critique box */}
                  {aiCritique && (
                    <div className="p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/20 rounded-xl space-y-1.5">
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        AI Critique / Feedback Gaps
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {aiCritique}
                      </p>
                    </div>
                  )}

                  {/* Improved Content Box */}
                  {aiImprovedText && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider">
                        Optimized Executive Content (XYZ Formula)
                      </p>
                      <textarea
                        value={aiImprovedText}
                        onChange={e => setAiImprovedText(e.target.value)}
                        className="w-full min-h-[140px] p-3 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-900 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isImproving && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setImprovingSection(null);
                    setImprovingFieldPath(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={acceptAiImprovement}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
                >
                  Adopt Rewrite
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

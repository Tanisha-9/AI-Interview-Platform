export interface ResumeData {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    gradYear: string;
    gpa?: string;
  }[];
  skills: string[];
  projects: {
    id: string;
    name: string;
    description: string;
    techStack: string[];
    link?: string;
  }[];
}

export interface AtsResult {
  score: number;
  keywordMatchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillsAnalysis: {
    technical: string[];
    soft: string[];
    gaps: string[];
  };
  structuralFeedback: {
    impactStatements: string;
    formatting: string;
    readability: string;
  };
  improvementTips: string[];
}

export interface PrepTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ScheduledInterview {
  id: string;
  company: string;
  role: string;
  scheduledAt: string; // ISO String or datetime
  notes: string;
  color: string;
  tasks: PrepTask[];
}

export interface Question {
  id: string;
  text: string;
  category: 'Technical' | 'Behavioral' | 'Situational' | 'General' | 'Coding' | 'System Design' | 'HR';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  modelAnswer?: string;
}

export interface ResponseScore {
  clarity: number; // 0-10
  relevance: number; // 0-10
  depth: number; // 0-10
  communication: number; // 0-10
  overall: number; // 0-10
  feedback: string;
}

export interface ResponseItem {
  questionId: string;
  questionText: string;
  category: string;
  difficulty: string;
  transcript: string;
  score?: ResponseScore;
  confidenceScore?: number; // 0-100
  speechSpeed?: number; // words per min
  pausesCount?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Hesitant';
}

export interface IntegrityEvent {
  id: string;
  type: 'tab_switch' | 'face_lost' | 'unusual_typing' | 'contradiction';
  details: string;
  timestamp: string; // ISO String
}

export interface TimelineEvent {
  timeOffset: string; // e.g. "01:23"
  label: string; // "Good introduction", "Missed edge case", etc.
  type: 'success' | 'warning' | 'info' | 'critical';
  details: string;
}

export interface ConfidenceDataPoint {
  label: string; // "Q1", "Q2" etc
  score: number; // 0-100
  speed: number;
  pauses: number;
  sentiment: string;
}

export interface InterviewSession {
  id: string;
  jobRole: string;
  company: string;
  interviewType: 'voice' | 'text' | 'coding' | 'behavioral' | 'hr' | 'company_specific';
  status: 'pending' | 'active' | 'completed';
  integrityScore: number; // starts at 100
  startedAt: string;
  endedAt?: string;
  questions: Question[];
  responses: ResponseItem[];
  integrityEvents: IntegrityEvent[];
  timelineEvents: TimelineEvent[];
  confidenceCurve: ConfidenceDataPoint[];
  recruiterNotes?: {
    verdict: 'Would Hire' | 'Maybe' | 'Reject';
    strengths: string[];
    weaknesses: string[];
    reasons: string;
    suggestions: string;
  };
  overallReport?: {
    strengths: string[];
    areasForImprovement: string[];
    coachingAdvice: string;
    compositeScore: number;
  };
}

// STAR Stories Interface
export interface StarStory {
  id: string;
  title: string;
  category: 'Leadership' | 'Failure' | 'Conflict' | 'Innovation' | 'Teamwork' | 'Deadline' | 'Ownership';
  situation: string;
  task: string;
  action: string;
  result: string;
  starAnswer?: string;
  createdAt: string;
}

// Career Digital Twin Profile
export interface DigitalTwinProfile {
  streakCount: number;
  lastActive: string;
  level: number;
  xp: number;
  badges: { id: string; name: string; description: string; unlockedAt: string; icon: string }[];
  cgpa: number;
  dsaLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  gitHubUrl: string;
  linkedInUrl: string;
  portfolioScore: number;
  weakSkills: string[];
  strongSkills: string[];
  consistencyContradictions: { id: string; topic: string; statements: string[]; explanation: string }[];
}

// AI Career Roadmap Milestone
export interface RoadmapItem {
  id: string;
  targetCompany: string;
  period: 'Daily' | 'Weekly' | 'Monthly';
  title: string;
  description: string;
  completed: boolean;
  updatedAfterInterview?: boolean;
}

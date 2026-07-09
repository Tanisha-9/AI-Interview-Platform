import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limits for resume parsing / uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lazy initializer for Google GenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it via the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API Routes

// 1. Generate Interview Questions
app.post("/api/gemini/questions", async (req, res) => {
  try {
    const { role, skills, experience } = req.body;
    if (!role) {
      res.status(400).json({ error: "Role is required" });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Generate exactly 5 realistic, industry-standard interview questions for a candidate preparing for the role of "${role}".
    ${skills && skills.length > 0 ? `The candidate has the following skills: ${skills.join(", ")}.` : ""}
    ${experience ? `The candidate's brief experience or background: ${experience}.` : ""}
    
    Make sure to generate:
    - At least 2 Technical questions specific to the role.
    - At least 1 Behavioral question (following standard STAR method triggers).
    - At least 1 Situational/problem-solving question.
    - Questions must range from Easy to Hard.
    
    Provide a concise "modelAnswer" for each question as a reference outline of what a strong response should cover.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, fair, and professional technical recruiter. You generate high-quality, practical interview questions tailored to specific roles and backgrounds.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A simple unique ID like q1, q2" },
              text: { type: Type.STRING, description: "The full question text to ask the candidate" },
              category: { type: Type.STRING, description: "Technical, Behavioral, Situational, or General" },
              difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
              modelAnswer: { type: Type.STRING, description: "A brief checklist or reference guide on what points a perfect answer should touch on" }
            },
            required: ["id", "text", "category", "difficulty", "modelAnswer"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate interview questions" });
  }
});

// 2. Generate Follow-up Question
app.post("/api/gemini/follow-up", async (req, res) => {
  try {
    const { role, questionText, transcript, previousFollowUps = [] } = req.body;
    if (!questionText || !transcript) {
      res.status(400).json({ error: "questionText and transcript are required" });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `You are a real-time interviewer for the role "${role}".
    
    The original question was: "${questionText}"
    The candidate's spoken transcript is: "${transcript}"
    
    ${previousFollowUps.length > 0 ? `Previous follow-ups in this sub-thread: ${previousFollowUps.join(" | ")}` : ""}

    Based on the answer, generate a single, highly contextual, short follow-up question.
    - If the candidate's answer was complete and robust, you can instead set "isComplete" to true and let the follow-up text be an transition sentence.
    - If they left out crucial elements or you want them to elaborate on a specific point they mentioned, generate a sharp follow-up.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are conducting an interactive interview. Keep follow-ups conversational, direct, and under 25 words.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The follow-up question text or transition statement" },
            isComplete: { type: Type.BOOLEAN, description: "Set to true if no further follow-up is needed for this topic" },
            suggestionHint: { type: Type.STRING, description: "A brief hint on what they should highlight in their response to this follow-up" }
          },
          required: ["text", "isComplete"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error generating follow-up:", error);
    res.status(500).json({ error: error.message || "Failed to generate follow-up question" });
  }
});

// 3. Score Single Response
app.post("/api/gemini/score", async (req, res) => {
  try {
    const { questionText, transcript, modelAnswer } = req.body;
    if (!questionText || !transcript) {
      res.status(400).json({ error: "questionText and transcript are required" });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Grade the candidate's response to the interview question.
    Question: "${questionText}"
    Candidate response: "${transcript}"
    ${modelAnswer ? `Reference Guideline/Model Checklist: "${modelAnswer}"` : ""}
    
    Perform strict grading across four pillars from 0 to 10:
    1. Clarity: Is the response easy to follow and structured?
    2. Relevance: Does it directly answer the core of the question?
    3. Depth: Does it showcase thorough knowledge/experience, avoiding vague generalizations?
    4. Communication: Tone, word choice, professional articulation, and precision.
    
    Provide constructive feedback that highlights what they did well and specifically what they missed.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an objective, encouraging, but strict technical grader. Your scores reflect real-world hiring criteria.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarity: { type: Type.INTEGER, description: "Score out of 10" },
            relevance: { type: Type.INTEGER, description: "Score out of 10" },
            depth: { type: Type.INTEGER, description: "Score out of 10" },
            communication: { type: Type.INTEGER, description: "Score out of 10" },
            overall: { type: Type.INTEGER, description: "Weighted overall score out of 10" },
            feedback: { type: Type.STRING, description: "Detailed, bulleted, constructive review of strengths and weaknesses" }
          },
          required: ["clarity", "relevance", "depth", "communication", "overall", "feedback"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error scoring response:", error);
    res.status(500).json({ error: error.message || "Failed to score candidate response" });
  }
});

// 4. Generate Session Feedback Report
app.post("/api/gemini/overall-report", async (req, res) => {
  try {
    const { jobRole, company, responses } = req.body;
    if (!responses || !Array.isArray(responses)) {
      res.status(400).json({ error: "responses list is required" });
      return;
    }

    const ai = getGeminiClient();
    const responsesSummary = responses.map((r: any, i: number) => `
    [Q${i+1}] ${r.questionText}
    Answer: "${r.transcript}"
    Pillar Scores: Clarity=${r.score?.clarity}, Relevance=${r.score?.relevance}, Depth=${r.score?.depth}, Comm=${r.score?.communication}
    Feedback: ${r.score?.feedback}
    `).join("\n---\n");

    const prompt = `The candidate has completed an interview session for the position of "${jobRole}" ${company ? `at "${company}"` : ""}.
    Below is the complete transcript of the questions asked, responses given, and intermediate scores:
    
    ${responsesSummary}
    
    Synthesize these results into a comprehensive overall report. Identify overall thematic strengths (at least 3), areas for improvement (at least 3), and specific action-oriented coaching advice. Calculate a composite score (out of 100) that reflects their hiring suitability.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior talent development manager. You summarize candidate evaluations into high-impact, developmental insights.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "At least 3 core strengths identified" },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "At least 3 specific gaps/areas to work on" },
            coachingAdvice: { type: Type.STRING, description: "Detailed, personalized roadmap to improve performance" },
            compositeScore: { type: Type.INTEGER, description: "Overall suitability score from 0 to 100" }
          },
          required: ["strengths", "areasForImprovement", "coachingAdvice", "compositeScore"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error generating overall report:", error);
    res.status(500).json({ error: error.message || "Failed to generate comprehensive report" });
  }
});

// 5. ATS Resume Scorer
app.post("/api/gemini/ats-score", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      res.status(400).json({ error: "resumeText and jobDescription are required" });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Analyze the candidate's resume against the target Job Description to simulate an Applicant Tracking System (ATS) filter and generate deep feedback.
    
    Target Job Description:
    """
    ${jobDescription}
    """
    
    Candidate Resume Text:
    """
    ${resumeText}
    """
    
    Extract:
    1. Score: Overall alignment score (0-100) based on requirements, qualifications, and formatting.
    2. Keywords Match: Core tech/industry keywords found in JD and whether they are present in the resume. Express matches as keywords lists.
    3. Skills Analysis: Direct technical skills matched/missing and soft skills alignment, highlighting skill gaps.
    4. Structural Feedback: Action-oriented critiques on their use of impact statements (quantified results), resume formatting, and overall visual/linguistic readability.
    5. Detailed Improvement Tips: Specific bullet-pointed edits they should make to instantly increase their compatibility.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an advanced modern ATS parser and resume optimizer. You offer extremely rigorous, direct, and valuable career counseling.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            keywordMatchPercentage: { type: Type.INTEGER },
            matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillsAnalysis: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Matched tech skills" },
                soft: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Matched soft skills" },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical skills requested in JD but missing/weak in resume" }
              },
              required: ["technical", "soft", "gaps"]
            },
            structuralFeedback: {
              type: Type.OBJECT,
              properties: {
                impactStatements: { type: Type.STRING, description: "Feedback on whether achievements are quantified" },
                formatting: { type: Type.STRING, description: "Formatting suggestions" },
                readability: { type: Type.STRING, description: "Feedback on conciseness and language flow" }
              },
              required: ["impactStatements", "formatting", "readability"]
            },
            improvementTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific steps to fix the resume" }
          },
          required: ["score", "keywordMatchPercentage", "matchedKeywords", "missingKeywords", "skillsAnalysis", "structuralFeedback", "improvementTips"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error calculating ATS score:", error);
    res.status(500).json({ error: error.message || "Failed to parse and score resume" });
  }
});

// 6. Resume Section improver
app.post("/api/gemini/improve-section", async (req, res) => {
  try {
    const { sectionName, sectionContent } = req.body;
    if (!sectionName || !sectionContent) {
      res.status(400).json({ error: "sectionName and sectionContent are required" });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Optimize this specific resume section using professional industry standards (strong active verbs, quantified impact, high-value keyword density).
    
    Section Name: ${sectionName}
    Current Content:
    """
    ${typeof sectionContent === "string" ? sectionContent : JSON.stringify(sectionContent, null, 2)}
    """
    
    Suggest a completely rewritten, optimized version. Output a brief critique explanation and then the direct revised text that the candidate can copy/paste.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional executive resume writer. Your corrections are sharp, polished, punchy, and highlight measurable success (e.g. using the X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critique: { type: Type.STRING, description: "Brief bulleted analysis of what was weak or missing in the original section" },
            improvedContent: { type: Type.STRING, description: "The beautiful copy/paste ready rewritten content" }
          },
          required: ["critique", "improvedContent"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error improving section:", error);
    res.status(500).json({ error: error.message || "Failed to improve section" });
  }
});

// 7. STAR Story answer generator
app.post("/api/gemini/star-generate", async (req, res) => {
  try {
    const { situation, task, action, result, category } = req.body;
    if (!situation || !task || !action || !result) {
      res.status(400).json({ error: "All STAR components (situation, task, action, result) are required" });
      return;
    }
    const ai = getGeminiClient();
    const prompt = `Rewrite and combine the following STAR (Situation, Task, Action, Result) interview response into a highly professional, cohesive, and compelling narrative suitable for an elite technical interview.
    
    Category: ${category || "General"}
    Situation: "${situation}"
    Task: "${task}"
    Action: "${action}"
    Result: "${result}"
    
    Optimize this response using strong action verbs, professional delivery structures, and high impact statements. Provide both an optimized cohesive answer and specific bulleted advice on how to deliver this story verbally.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite executive interview coach. You turn rough career stories into stellar STAR responses.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            starAnswer: { type: Type.STRING, description: "The beautifully written, cohesive story following the STAR model" },
            deliveryCoachAdvice: { type: Type.STRING, description: "Bullet points on tone, emphasis, or numbers to mention during delivery" }
          },
          required: ["starAnswer", "deliveryCoachAdvice"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error generating STAR story:", error);
    res.status(500).json({ error: error.message || "Failed to generate STAR story" });
  }
});

// 8. Transcript Consistency Validator (Contradiction Finder)
app.post("/api/gemini/check-consistency", async (req, res) => {
  try {
    const { transcripts } = req.body;
    if (!transcripts || !Array.isArray(transcripts)) {
      res.status(400).json({ error: "Transcripts array is required" });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Analyze these mock interview transcript responses for logical contradictions, exaggerations, or structural discrepancies.
    
    Transcripts:
    """
    ${JSON.stringify(transcripts, null, 2)}
    """
    
    Examine whether dates, experience lengths, technical statements, role responsibilities, or tools mentioned in different questions conflict with one another (e.g. stating 'I led a team of 10' in one response, and 'I have only worked as an individual contributor' in another).
    
    Return any identified contradictions. If none are found, return an empty array.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional integrity validator. You flag factual contradictions and discrepancies in candidate interview responses with strict accuracy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING, description: "The core topic of the contradiction (e.g. 'Years of Experience', 'Team Leadership')" },
              statements: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "The contradictory statements made by the candidate" 
              },
              explanation: { type: Type.STRING, description: "Why these statements contradict and what risks it poses to credibility" }
            },
            required: ["id", "topic", "statements", "explanation"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error checking consistency:", error);
    res.status(500).json({ error: error.message || "Failed to check consistency" });
  }
});

// 9. Elevator Pitch Generator
app.post("/api/gemini/elevator-pitch", async (req, res) => {
  try {
    const { role, skills, experience, summary } = req.body;
    const ai = getGeminiClient();
    const prompt = `Generate three different versions of a personal elevator pitch (30 seconds, 60 seconds, and 90 seconds) for a candidate preparing for interviews.
    
    Role: "${role || "Software Engineer"}"
    Skills: "${skills ? skills.join(", ") : "general technical skills"}"
    Experience summary: "${experience || summary || "Not provided"}"
    
    Create professional, punchy, and confident pitches. The 30s pitch should be ultra-focused; the 60s pitch should highlight key career achievements; the 90s pitch should include personal motivation and future career alignment.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an executive communication coach. You help professionals articulate their worth succinctly and powerfully.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pitch30s: { type: Type.STRING, description: "The 30-second pitch (~75 words)" },
            pitch60s: { type: Type.STRING, description: "The 60-second pitch (~150 words)" },
            pitch90s: { type: Type.STRING, description: "The 90-second pitch (~225 words)" }
          },
          required: ["pitch30s", "pitch60s", "pitch90s"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error generating elevator pitch:", error);
    res.status(500).json({ error: error.message || "Failed to generate elevator pitch" });
  }
});

// 10. Portfolio Auditor & Score Calculator
app.post("/api/gemini/analyze-portfolio", async (req, res) => {
  try {
    const { github, linkedin, cgpa, dsaLevel, skills } = req.body;
    const ai = getGeminiClient();
    const prompt = `Analyze a candidate's portfolio inputs to calculate an overall 'Portfolio & Career Readiness Score' out of 100 and generate actionable advice.
    
    GitHub: "${github || "Not linked"}"
    LinkedIn: "${linkedin || "Not linked"}"
    CGPA / Grades: "${cgpa || "Not provided"}"
    DSA / Coding Skill Level: "${dsaLevel || "Not provided"}"
    Skills: "${skills ? skills.join(", ") : "Not provided"}"
    
    Assess how comprehensive these materials are. Provide a readiness score, highlight 3 strengths, 3 weak spots / gaps, and suggest a checklist of items to improve their score.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert technical resume reviewer and portfolio auditor.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Calculated portfolio readiness score out of 100" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementChecklist: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "strengths", "gaps", "improvementChecklist"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error("Error analyzing portfolio:", error);
    res.status(500).json({ error: error.message || "Failed to analyze portfolio" });
  }
});

// Serve frontend assets / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

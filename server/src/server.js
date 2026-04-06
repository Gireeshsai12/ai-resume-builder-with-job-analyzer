import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const resumeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New Resume" },
    targetRole: { type: String, default: "Software Engineer" },
    sections: {
      summary: { type: String, default: "" },
      skills: {
        technical: { type: [String], default: [] },
      },
      experience: [
        {
          company: { type: String, default: "" },
          role: { type: String, default: "" },
          description: { type: [String], default: [] },
        },
      ],
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

app.get("/", (req, res) => {
  res.json({ message: "AI Resume Builder backend running" });
});

app.get("/api/resumes", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error("Fetch resumes error:", error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

app.get("/api/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    console.error("Fetch resume error:", error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

app.post("/api/resumes", async (req, res) => {
  try {
    const newResume = new Resume({
      title: req.body.title || "New Resume",
      targetRole: req.body.targetRole || "Software Engineer",
      sections: {
        summary: "",
        skills: {
          technical: [],
        },
        experience: [
          {
            company: "",
            role: "",
            description: [],
          },
        ],
      },
    });

    const savedResume = await newResume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    console.error("Create resume error:", error);
    res.status(500).json({ error: "Failed to create resume" });
  }
});

app.put("/api/resumes/:id", async (req, res) => {
  try {
    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json(updatedResume);
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({ error: "Failed to update resume" });
  }
});

app.post("/api/generate-summary", async (req, res) => {
  try {
    const { role, skills } = req.body;

    const prompt = `
Write a professional ATS-friendly resume summary.

Target Role: ${role}
Skills: ${skills}

Rules:
- 2 to 3 lines only
- Professional tone
- Strong and impactful
- No headings
- No markdown
- Output only the summary text
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    res.json({ text });
  } catch (error) {
    console.error("Generate summary error:", error);
    res.status(500).json({
      error: "Failed to generate summary",
      details: error.message,
    });
  }
});

app.post("/api/generate-bullets", async (req, res) => {
  try {
    const { role, company, description } = req.body;

    const prompt = `
Generate 3 strong ATS-friendly resume bullet points.

Role: ${role}
Company: ${company}
Base Description: ${description}

Rules:
- Start each bullet with an action verb
- Make them concise and professional
- No markdown headings
- Return plain text bullet points only
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    res.json({ text });
  } catch (error) {
    console.error("Generate bullets error:", error);
    res.status(500).json({
      error: "Failed to generate bullets",
      details: error.message,
    });
  }
});

app.post("/api/ats-score/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const summary = resume.sections?.summary || "";
    const skills = resume.sections?.skills?.technical || [];
    const experience = resume.sections?.experience || [];

    let score = 0;
    const feedback = [];

    if (resume.title && resume.title.trim().length > 3) {
      score += 15;
    } else {
      feedback.push("Add a clearer resume title.");
    }

    if (resume.targetRole && resume.targetRole.trim().length > 3) {
      score += 15;
    } else {
      feedback.push("Add a specific target role.");
    }

    if (summary.trim().length >= 80) {
      score += 20;
    } else {
      feedback.push("Professional summary is too short.");
    }

    if (skills.length >= 3) {
      score += 20;
    } else {
      feedback.push("Add more relevant technical skills.");
    }

    if (experience.length > 0 && experience[0].role && experience[0].company) {
      score += 10;
    } else {
      feedback.push("Add complete experience details.");
    }

    const bulletCount = experience[0]?.description?.length || 0;
    if (bulletCount >= 2) {
      score += 20;
    } else {
      feedback.push("Add at least 2 strong experience bullet points.");
    }

    let level = "Needs Improvement";
    if (score >= 80) level = "Strong";
    else if (score >= 60) level = "Good";

    res.json({
      score,
      level,
      feedback,
      checks: {
        hasTitle: !!resume.title,
        hasTargetRole: !!resume.targetRole,
        summaryLength: summary.trim().length,
        skillsCount: skills.length,
        bulletCount,
      },
    });
  } catch (error) {
    console.error("ATS score error:", error);
    res.status(500).json({ error: "Failed to calculate ATS score" });
  }
});

app.post("/api/job-match/:id", async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const resumeText = `
Resume Title: ${resume.title}
Target Role: ${resume.targetRole}

Summary:
${resume.sections?.summary || ""}

Skills:
${(resume.sections?.skills?.technical || []).join(", ")}

Experience:
${(resume.sections?.experience || [])
  .map(
    (exp) => `
Company: ${exp.company}
Role: ${exp.role}
Description:
${(exp.description || []).join("\n")}
`
  )
  .join("\n")}
`;

    const prompt = `
You are an expert resume evaluator.

Compare this resume with the given job description and return ONLY valid JSON.
Do not include markdown fences.
Do not include any extra text.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON in exactly this structure:
{
  "matchScore": 0,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["point1", "point2", "point3"],
  "suggestions": ["point1", "point2", "point3"]
}

Rules:
- matchScore must be an integer from 0 to 100
- matchedSkills should contain only concise skill names
- missingSkills should contain only concise skill names
- strengths should be short resume strengths
- suggestions should be short actionable improvements
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (error) {
    console.error("Job match error:", error);
    res.status(500).json({
      error: "Failed to analyze job match",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
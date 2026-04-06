import express from 'express';
import cors from 'cors';
import { generateContent } from './config/gemini.config.js';
import resumeRoutes from './routes/resume.routes.js';
import aiRoutes from './routes/ai.routes.js';
import atsRoutes from './routes/ats.routes.js';
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
} from './services/resume.service.js';
import { calculateATSScore } from './services/ats.service.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ats', atsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server working 🚀' });
});

app.get('/test-gemini', async (req, res) => {
  try {
    const result = await generateContent('Say hello in one short sentence.');
    res.json({ success: true, response: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-ai-summary', async (req, res) => {
  try {
    const summary = await generateContent(
      'Generate a short resume summary for a Software Engineer with React and Node.js skills.'
    );
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-ai-bullets', async (req, res) => {
  try {
    const bullets = await generateContent(
      'Generate 3 strong resume bullet points for a React developer project.'
    );
    res.json({ success: true, bullets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-create-resume', async (req, res) => {
  try {
    const userId = '661111111111111111111111';
    const resume = await createResume(userId, {
      title: 'My Resume',
      targetRole: 'Software Engineer',
    });
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-all-resumes', async (req, res) => {
  try {
    const userId = '661111111111111111111111';
    const resumes = await getUserResumes(userId);
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-one-resume/:id', async (req, res) => {
  try {
    const resume = await getResumeById(req.params.id);
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-update-resume/:id', async (req, res) => {
  try {
    const updated = await updateResume(req.params.id, {
      title: 'Updated Resume',
      targetRole: 'Full Stack Developer',
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-delete-resume/:id', async (req, res) => {
  try {
    await deleteResume(req.params.id);
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/test-ats/:id', async (req, res) => {
  try {
    const jobDescription =
      'Looking for a Software Engineer with React, Node.js, MongoDB, and problem-solving skills';

    const resume = await getResumeById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const result = calculateATSScore(resume, jobDescription);

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default app;
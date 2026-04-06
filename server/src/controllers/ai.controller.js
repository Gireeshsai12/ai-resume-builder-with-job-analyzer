import {
  generateSummary,
  generateBulletPoints,
} from '../services/ai.service.js';

const generateSummaryController = async (req, res) => {
  try {
    const { name, role, skills } = req.body;

    const summary = await generateSummary({ name, role, skills });

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateBulletsController = async (req, res) => {
  try {
    const { role, experience, skills } = req.body;

    const bullets = await generateBulletPoints({
      role,
      experience,
      skills,
    });

    res.json({ success: true, bullets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { generateSummaryController, generateBulletsController };
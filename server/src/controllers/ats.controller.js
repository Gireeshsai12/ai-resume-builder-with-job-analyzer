import { calculateATSScore } from '../services/ats.service.js';
import { getResumeById } from '../services/resume.service.js';

const analyzeATS = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    const resume = await getResumeById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const result = calculateATSScore(resume, jobDescription);

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { analyzeATS };
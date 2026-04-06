import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
} from '../services/resume.service.js';

const create = async (req, res) => {
  try {
    const userId = "661111111111111111111111"; // temp user
    const resume = await createResume(userId, req.body);
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userId = "661111111111111111111111";
    const resumes = await getUserResumes(userId);
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOne = async (req, res) => {
  try {
    const resume = await getResumeById(req.params.id);
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const resume = await updateResume(req.params.id, req.body);
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteResume(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { create, getAll, getOne, update, remove };
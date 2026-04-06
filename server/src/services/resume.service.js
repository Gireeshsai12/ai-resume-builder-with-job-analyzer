import Resume from '../models/Resume.model.js';

const createResume = async (userId, data) => {
  const resume = new Resume({
    userId,
    ...data,
  });

  return await resume.save();
};

const getUserResumes = async (userId) => {
  return await Resume.find({ userId }).sort({ createdAt: -1 });
};

const getResumeById = async (id) => {
  return await Resume.findById(id);
};

const updateResume = async (id, data) => {
  return await Resume.findByIdAndUpdate(id, data, { new: true });
};

const deleteResume = async (id) => {
  return await Resume.findByIdAndDelete(id);
};

export {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
};
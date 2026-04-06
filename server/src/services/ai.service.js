import { generateContent } from '../config/gemini.config.js';

const generateSummary = async (data) => {
  const prompt = `
Create a professional resume summary.

Name: ${data.name}
Role: ${data.role}
Skills: ${data.skills}

Keep it 2-3 lines.
`;

  const result = await generateContent(prompt);
  return result;
};

const generateBulletPoints = async (data) => {
  const prompt = `
Generate 3 strong resume bullet points using STAR method.

Role: ${data.role}
Project/Experience: ${data.experience}
Skills: ${data.skills}

Each bullet should:
- Start with action verb
- Include impact/result
- Be concise
`;

  const result = await generateContent(prompt);
  return result;
};

export { generateSummary, generateBulletPoints };
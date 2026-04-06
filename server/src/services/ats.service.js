const calculateATSScore = (resume, jobDescription) => {
  const jdWords = jobDescription.toLowerCase().split(/\W+/);
  const resumeText = JSON.stringify(resume).toLowerCase();

  let matchCount = 0;

  jdWords.forEach((word) => {
    if (resumeText.includes(word)) {
      matchCount++;
    }
  });

  const score = Math.min(
    100,
    Math.round((matchCount / jdWords.length) * 100)
  );

  const missingKeywords = jdWords.filter(
    (word) => !resumeText.includes(word)
  );

  // 🔥 NEW: Suggestions logic
  const suggestions = [];

  if (score < 50) {
    suggestions.push('Add more relevant skills from the job description');
  }

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Include these keywords: ${missingKeywords.slice(0, 5).join(', ')}`
    );
  }

  if (!resume.sections?.summary) {
    suggestions.push('Add a strong professional summary');
  }

  if (!resume.sections?.experience?.length) {
    suggestions.push('Add work experience with impact statements');
  }

  return {
    score,
    matchCount,
    totalKeywords: jdWords.length,
    missingKeywords: [...new Set(missingKeywords)].slice(0, 10),
    suggestions,
  };
};

export { calculateATSScore };
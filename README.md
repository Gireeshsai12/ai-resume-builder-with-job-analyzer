# AI Resume Builder with Job Match Analyzer

An AI-powered full-stack web application that helps users create, optimize, and analyze resumes using modern web technologies and artificial intelligence.

##  Overview
This project is designed to simplify the resume creation process and improve job readiness by integrating AI-powered content generation and job compatibility analysis.
Users can:
* Build professional resumes
* Generate AI-based summaries and experience bullets
* Analyze how well their resume matches a job description
* Identify missing skills and improve their chances of selection
* Export resumes as clean, professional PDFs

##  Key Features

###  Resume Builder
* Dynamic resume creation with multiple sections
* Add/edit:
  * Contact information
  * Summary
  * Skills
  * Experience
  * Projects
  * Education

###  AI Content Generation
* Generate **professional summaries**
* Generate **experience bullet points**
* Uses AI APIs (Gemini/OpenAI)

###  Job Match Analyzer
* Compare resume with job description
* Extract relevant skills from both inputs
* Calculate match percentage
* Identify missing skills
* Provide suggestions to improve resume

###  Real-Time Preview
* Live resume preview while editing
* Instant updates for better UX

###  PDF Export
* Download resume as PDF
* Clean and professional formatting
* Uses html2canvas + jsPDF

## 🛠 Tech Stack
### Frontend
* React.js
* Vite
* CSS / Tailwind (if used)
### Backend
* Node.js
* Express.js
### Database
* MongoDB
### AI Integration
* Gemini API / OpenAI API
### Other Libraries
* html2canvas
* jsPDF

##  Project Structure

```bash
ai-resume-builder-with-job-analyzer/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── config/
│   ├── server.js
│   └── package.json
│
├── screenshots/
│   ├── editor.png
│   ├── analyzer.png
│   └── pdf.png
│
├── README.md
└── .gitignore
```
##  Installation & Setup

### 1️ Clone the repository

git clone https://github.com/your-username/ai-resume-builder-with-job-analyzer.git
cd ai-resume-builder-with-job-analyzer

### 2️ Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../backend
npm install
```
### 3️ Setup Environment Variables

Create a `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_api_key
```

### 4️ Run the application

#### Start backend

```bash
npm start
```

#### Start frontend

```bash
cd ../frontend
npm run dev
```

##  How It Works

1. User enters resume details
2. AI generates summary and bullet points
3. Resume is displayed in real-time preview
4. User can input a job description
5. System analyzes:

   * Skill match
   * Missing keywords
   * Suggestions
6. User exports final resume as PDF

##  Use Cases

* Students building resumes
* Job seekers optimizing resumes
* Preparing for ATS-based hiring systems
* Improving resume-job alignment

##  Future Enhancements

* User authentication (login/signup)
* Multiple resume templates
* Cloud deployment (Vercel / Render)
* Advanced ATS scoring
* AI-based resume rewriting
* Resume history & versioning

##  Challenges & Learnings

* Handling dynamic resume sections in React
* Managing state for complex forms
* Integrating AI APIs effectively
* Designing real-time UI updates
* Generating consistent PDF layouts

##  Author

**Gireesh Sai Kalluri**
Computer Science Student – UMass Lowell
Aspiring Software Engineer | Full Stack Developer

##  Support

If you found this project helpful:

* Star ⭐ the repository
* Share feedback
* Connect on LinkedIn



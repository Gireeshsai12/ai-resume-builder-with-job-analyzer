import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/resumes");
      setResumes(res.data);
    } catch (error) {
      console.error("Fetch resumes error:", error);
      alert("Failed to fetch resumes");
    }
  };

  const handleCreateResume = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/resumes", {
        title: "New Resume",
        targetRole: "Software Engineer",
      });

      navigate(`/editor/${res.data._id}`);
    } catch (error) {
      console.error("Create resume error:", error);
      alert("Failed to create resume");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "72px", marginBottom: "10px", color: "#22344d" }}>
          AI Resume Builder 🚀
        </h1>

        <p style={{ fontSize: "24px", color: "#555", marginBottom: "30px" }}>
          Smart resume tools powered by AI
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
          <button onClick={handleCreateResume} style={primaryButtonStyle}>
            ➕ Create Resume
          </button>
          <button style={secondaryButtonStyle}>🤖 AI Summary</button>
          <button style={secondaryButtonStyle}>✨ AI Bullets</button>
        </div>

        <h2 style={{ fontSize: "40px", color: "#22344d", marginBottom: "20px" }}>
          Resumes
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "22px",
          }}
        >
          {resumes.map((resume) => (
            <div key={resume._id} style={cardStyle}>
              <h3 style={{ marginBottom: "10px", color: "#22344d", fontSize: "30px" }}>
                {resume.title}
              </h3>

              <p style={{ fontSize: "20px", color: "#555", marginBottom: "22px" }}>
                {resume.targetRole}
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate(`/editor/${resume._id}`)}
                  style={secondaryButtonStyle}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => navigate(`/ats/${resume._id}`)}
                  style={atsButtonStyle}
                >
                  📊 Check ATS
                </button>

                <button
                  onClick={() => navigate(`/job-match/${resume._id}`)}
                  style={jobMatchButtonStyle}
                >
                  🎯 Job Match
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  padding: "14px 22px",
  fontSize: "20px",
  borderRadius: "12px",
  border: "none",
  background: "#22344d",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const atsButtonStyle = {
  padding: "12px 18px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "none",
  background: "#e9f2ff",
  color: "#174ea6",
  cursor: "pointer",
};

const jobMatchButtonStyle = {
  padding: "12px 18px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "none",
  background: "#fff0f6",
  color: "#c2185b",
  cursor: "pointer",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 6px 22px rgba(0,0,0,0.08)",
};
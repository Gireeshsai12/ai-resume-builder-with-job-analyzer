import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function JobMatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`http://localhost:5000/api/job-match/${id}`, {
        jobDescription,
      });
      setResult(res.data);
    } catch (error) {
      console.error("Job match error:", error);
      alert("Failed to analyze job match");
    } finally {
      setLoading(false);
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
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "24px",
        }}
      >
        <div style={panelStyle}>
          <h1 style={{ fontSize: "52px", marginBottom: "12px", color: "#22344d" }}>
            Job Match Analyzer 🎯
          </h1>

          <p style={{ fontSize: "20px", color: "#555", marginBottom: "24px" }}>
            Paste a job description and compare it with your resume
          </p>

          <label style={labelStyle}>Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={18}
            placeholder="Paste the full job description here..."
            style={textareaStyle}
          />

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "20px" }}>
            <button onClick={handleAnalyze} style={primaryButtonStyle} disabled={loading}>
              {loading ? "Analyzing..." : "🔍 Analyze Match"}
            </button>

            <button onClick={() => navigate(`/editor/${id}`)} style={secondaryButtonStyle}>
              ✏️ Back to Editor
            </button>

            <button onClick={() => navigate(`/ats/${id}`)} style={secondaryButtonStyle}>
              📊 ATS Checker
            </button>

            <button onClick={() => navigate("/")} style={secondaryButtonStyle}>
              ← Dashboard
            </button>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={{ fontSize: "36px", marginBottom: "20px", color: "#22344d" }}>
            Analysis Result
          </h2>

          {!result ? (
            <div style={{ color: "#666", fontSize: "18px", lineHeight: 1.7 }}>
              No analysis yet. Paste a job description and click <strong>Analyze Match</strong>.
            </div>
          ) : (
            <>
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: "#22344d",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "38px",
                  fontWeight: "bold",
                  marginBottom: "26px",
                }}
              >
                {result.matchScore}%
              </div>

              <Section title="Matched Skills" items={result.matchedSkills} good />
              <Section title="Missing Skills" items={result.missingSkills} warn />
              <Section title="Strengths" items={result.strengths} />
              <Section title="Suggestions" items={result.suggestions} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, good = false, warn = false }) {
  const bg = good ? "#e8f7ee" : warn ? "#fff4e5" : "#f8fafc";
  const color = good ? "#166534" : warn ? "#b45309" : "#22344d";

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontSize: "24px", marginBottom: "12px", color: "#22344d" }}>
        {title}
      </h3>
      <div
        style={{
          background: bg,
          borderRadius: "14px",
          padding: "16px 18px",
          border: "1px solid #dde6ee",
        }}
      >
        {items && items.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: "22px", lineHeight: 1.8, color }}>
            {items.map((item, index) => (
              <li key={index} style={{ fontSize: "17px" }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, fontSize: "17px", color: "#666" }}>No items found.</p>
        )}
      </div>
    </div>
  );
}

const panelStyle = {
  background: "white",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "18px",
  fontWeight: "600",
  color: "#22344d",
};

const textareaStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #cfd8e3",
  fontSize: "17px",
  boxSizing: "border-box",
  resize: "vertical",
  fontFamily: "inherit",
};

const primaryButtonStyle = {
  padding: "12px 20px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "none",
  background: "#22344d",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};
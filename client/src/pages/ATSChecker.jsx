import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ATSChecker() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchScore();
  }, [id]);

  const fetchScore = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/ats-score/${id}`);
      setResult(res.data);
    } catch (error) {
      console.error("ATS fetch error:", error);
      alert("Failed to calculate ATS score");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "30px", fontSize: "22px" }}>Checking ATS score...</div>;
  }

  if (!result) {
    return <div style={{ padding: "30px" }}>No result found.</div>;
  }

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
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "52px", marginBottom: "10px", color: "#22344d" }}>
          ATS Checker 📊
        </h1>

        <p style={{ fontSize: "20px", color: "#555", marginBottom: "30px" }}>
          Resume compatibility analysis
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "#22344d",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "42px",
              fontWeight: "bold",
            }}
          >
            {result.score}%
          </div>

          <div>
            <h2 style={{ marginBottom: "10px", color: "#22344d" }}>Overall Rating: {result.level}</h2>
            <p style={{ fontSize: "18px", color: "#444" }}>
              This score is based on summary quality, skills, role clarity, and experience bullets.
            </p>
          </div>
        </div>

        <h2 style={sectionTitle}>Resume Checks</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "30px" }}>
          <div style={cardStyle}>
            <strong>Title</strong>
            <p>{result.checks.hasTitle ? "Present" : "Missing"}</p>
          </div>
          <div style={cardStyle}>
            <strong>Target Role</strong>
            <p>{result.checks.hasTargetRole ? "Present" : "Missing"}</p>
          </div>
          <div style={cardStyle}>
            <strong>Summary Length</strong>
            <p>{result.checks.summaryLength} characters</p>
          </div>
          <div style={cardStyle}>
            <strong>Skills Count</strong>
            <p>{result.checks.skillsCount}</p>
          </div>
          <div style={cardStyle}>
            <strong>Bullet Count</strong>
            <p>{result.checks.bulletCount}</p>
          </div>
        </div>

        <h2 style={sectionTitle}>Improvement Feedback</h2>
        {result.feedback.length === 0 ? (
          <div style={goodBoxStyle}>Your resume looks strong for ATS basics.</div>
        ) : (
          <ul style={{ paddingLeft: "24px", fontSize: "18px", lineHeight: 1.8 }}>
            {result.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "30px" }}>
          <button onClick={() => navigate(`/editor/${id}`)} style={primaryButtonStyle}>
            ✏️ Back to Editor
          </button>

          <button onClick={() => navigate("/")} style={secondaryButtonStyle}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionTitle = {
  fontSize: "28px",
  color: "#22344d",
  marginBottom: "16px",
};

const cardStyle = {
  background: "#f8fafc",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid #d9e2ec",
};

const goodBoxStyle = {
  background: "#e8f7ee",
  color: "#166534",
  padding: "16px",
  borderRadius: "12px",
  fontSize: "18px",
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
  border: "1px solid #bbb",
  background: "#fff",
  cursor: "pointer",
};
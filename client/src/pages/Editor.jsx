import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");

  const [experiences, setExperiences] = useState([
    { company: "", role: "", description: "" },
  ]);

  const [projects, setProjects] = useState([
    { name: "", description: "" },
  ]);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resumes/${id}`);
      const data = res.data || {};

      setTitle(data.title || "");
      setTargetRole(data.targetRole || "");

      setFullName(data.sections?.contact?.fullName || "");
      setEmail(data.sections?.contact?.email || "");
      setPhone(data.sections?.contact?.phone || "");
      setLocation(data.sections?.contact?.location || "");
      setLinkedin(data.sections?.contact?.linkedin || "");

      setSummary(data.sections?.summary || "");

      setSkills(
        Array.isArray(data.sections?.skills?.technical)
          ? data.sections.skills.technical.join(", ")
          : ""
      );

      setEducation(data.sections?.education?.[0]?.school || "");

      const fetchedExperiences = Array.isArray(data.sections?.experience)
        ? data.sections.experience.map((exp) => ({
            company: exp.company || "",
            role: exp.role || "",
            description: Array.isArray(exp.description)
              ? exp.description.join("\n")
              : "",
          }))
        : [];

      const fetchedProjects = Array.isArray(data.sections?.projects)
        ? data.sections.projects.map((project) => ({
            name: project.name || "",
            description: Array.isArray(project.description)
              ? project.description.join("\n")
              : "",
          }))
        : [];

      setExperiences(
        fetchedExperiences.length > 0
          ? fetchedExperiences
          : [{ company: "", role: "", description: "" }]
      );

      setProjects(
        fetchedProjects.length > 0
          ? fetchedProjects
          : [{ name: "", description: "" }]
      );
    } catch (error) {
      console.error("Fetch resume error:", error);
      alert("Failed to load resume");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/generate-summary", {
        role: targetRole,
        skills,
      });

      setSummary(res.data?.text || "");
    } catch (error) {
      console.error("Generate summary error:", error);
      alert("Failed to generate summary");
    }
  };

  const handleGenerateBullets = async (index) => {
    try {
      const experience = experiences[index];

      const res = await axios.post("http://localhost:5000/api/generate-bullets", {
        role: experience.role,
        company: experience.company,
        description: experience.description,
      });

      const updated = [...experiences];
      updated[index].description = res.data?.text || "";
      setExperiences(updated);
    } catch (error) {
      console.error("Generate bullets error:", error);
      alert("Failed to generate bullets");
    }
  };

  const handleSaveResume = async () => {
    try {
      const updatedResume = {
        title,
        targetRole,
        sections: {
          contact: {
            fullName,
            email,
            phone,
            location,
            linkedin,
          },
          summary,
          skills: {
            technical: skills
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          },
          experience: experiences
            .map((exp) => ({
              company: exp.company,
              role: exp.role,
              description: exp.description
                .split("\n")
                .map((item) => item.replace(/^[-•*]\s*/, "").trim())
                .filter(Boolean),
            }))
            .filter(
              (exp) =>
                exp.company.trim() || exp.role.trim() || exp.description.length > 0
            ),
          education: education
            ? [
                {
                  school: education,
                },
              ]
            : [],
          projects: projects
            .map((project) => ({
              name: project.name,
              description: project.description
                .split("\n")
                .map((item) => item.replace(/^[-•*]\s*/, "").trim())
                .filter(Boolean),
            }))
            .filter(
              (project) =>
                project.name.trim() || project.description.length > 0
            ),
        },
      };

      await axios.put(`http://localhost:5000/api/resumes/${id}`, updatedResume);
      alert("Resume saved successfully");
    } catch (error) {
      console.error("Save resume error:", error);
      alert("Failed to save resume");
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) {
      alert("Resume preview not found");
      return;
    }

    try {
      setDownloading(true);

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const usableWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
      heightLeft -= pdfHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= pdfHeight - margin * 2;
      }

      const safeFileName = (title || fullName || "resume")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      pdf.save(`${safeFileName || "resume"}.pdf`);
    } catch (error) {
      console.error("Download PDF error:", error);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, { company: "", role: "", description: "" }]);
  };

  const handleRemoveExperience = (index) => {
    if (experiences.length === 1) {
      setExperiences([{ company: "", role: "", description: "" }]);
      return;
    }
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const handleAddProject = () => {
    setProjects([...projects, { name: "", description: "" }]);
  };

  const handleRemoveProject = (index) => {
    if (projects.length === 1) {
      setProjects([{ name: "", description: "" }]);
      return;
    }
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const renderBulletList = (text) =>
    text
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);

  if (loading) {
    return (
      <div style={loadingWrapperStyle}>
        <div style={loadingCardStyle}>Loading editor...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div>
          <h1 style={pageTitleStyle}>Resume Editor</h1>
          <p style={pageSubtitleStyle}>Edit, generate, save, and export your resume.</p>
        </div>

        <div style={actionRowStyle}>
          <button onClick={handleGenerateSummary} style={lightButtonStyle}>
            Generate Summary
          </button>
          <button onClick={handleSaveResume} style={primaryButtonStyle}>
            Save Resume
          </button>
          <button
            onClick={handleDownloadPDF}
            style={successButtonStyle}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
          <button onClick={() => navigate("/")} style={backButtonStyle}>
            Back
          </button>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={editorPanelStyle}>
          <SectionCard title="Basic Info">
            <Input label="Resume Title" value={title} onChange={setTitle} />
            <Input label="Target Role" value={targetRole} onChange={setTargetRole} />
          </SectionCard>

          <SectionCard title="Contact">
            <Input label="Full Name" value={fullName} onChange={setFullName} />
            <Input label="Email" value={email} onChange={setEmail} />
            <Input label="Phone" value={phone} onChange={setPhone} />
            <Input label="Location" value={location} onChange={setLocation} />
            <Input label="LinkedIn" value={linkedin} onChange={setLinkedin} />
          </SectionCard>

          <SectionCard title="Summary">
            <TextArea
              label="Professional Summary"
              value={summary}
              onChange={setSummary}
              rows={5}
            />
          </SectionCard>

          <SectionCard title="Skills">
            <Input
              label="Technical Skills (comma separated)"
              value={skills}
              onChange={setSkills}
            />
          </SectionCard>

          <SectionCard title="Experience">
            {experiences.map((exp, index) => (
              <div key={index} style={dynamicBlockStyle}>
                <div style={dynamicHeaderStyle}>
                  <h3 style={dynamicTitleStyle}>Experience {index + 1}</h3>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleGenerateBullets(index)}
                      style={lightButtonStyle}
                    >
                      Generate Bullets
                    </button>
                    <button
                      onClick={() => handleRemoveExperience(index)}
                      style={dangerButtonStyle}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <Input
                  label="Company"
                  value={exp.company}
                  onChange={(val) => handleExperienceChange(index, "company", val)}
                />
                <Input
                  label="Role"
                  value={exp.role}
                  onChange={(val) => handleExperienceChange(index, "role", val)}
                />
                <TextArea
                  label="Description / Bullets"
                  value={exp.description}
                  onChange={(val) => handleExperienceChange(index, "description", val)}
                  rows={5}
                />
              </div>
            ))}

            <button onClick={handleAddExperience} style={lightButtonStyle}>
              + Add Experience
            </button>
          </SectionCard>

          <SectionCard title="Education">
            <Input
              label="School / University"
              value={education}
              onChange={setEducation}
            />
          </SectionCard>

          <SectionCard title="Projects">
            {projects.map((project, index) => (
              <div key={index} style={dynamicBlockStyle}>
                <div style={dynamicHeaderStyle}>
                  <h3 style={dynamicTitleStyle}>Project {index + 1}</h3>
                  <button
                    onClick={() => handleRemoveProject(index)}
                    style={dangerButtonStyle}
                  >
                    Remove
                  </button>
                </div>

                <Input
                  label="Project Name"
                  value={project.name}
                  onChange={(val) => handleProjectChange(index, "name", val)}
                />
                <TextArea
                  label="Project Description / Bullets"
                  value={project.description}
                  onChange={(val) => handleProjectChange(index, "description", val)}
                  rows={5}
                />
              </div>
            ))}

            <button onClick={handleAddProject} style={lightButtonStyle}>
              + Add Project
            </button>
          </SectionCard>
        </div>

        <div style={previewPanelOuterStyle}>
          <div ref={previewRef} style={previewPaperStyle}>
            <div style={resumeHeaderStyle}>
              <h1 style={resumeNameStyle}>{fullName || "Your Name"}</h1>
              <p style={resumeRoleStyle}>{targetRole || "Target Role"}</p>
              <p style={contactLineStyle}>
                {[email, phone, location, linkedin].filter(Boolean).join(" | ") ||
                  "email@example.com | +1 234 567 8900 | City, State | LinkedIn"}
              </p>
            </div>

            {summary && (
              <>
                <SectionHeading title="Professional Summary" />
                <p style={resumeParagraphStyle}>{summary}</p>
              </>
            )}

            {skills.trim() && (
              <>
                <SectionHeading title="Skills" />
                <p style={resumeParagraphStyle}>
                  {skills
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </>
            )}

            {experiences.some(
              (exp) => exp.company.trim() || exp.role.trim() || exp.description.trim()
            ) && (
              <>
                <SectionHeading title="Experience" />
                {experiences.map((exp, index) => {
                  const bullets = renderBulletList(exp.description);
                  if (!exp.company.trim() && !exp.role.trim() && bullets.length === 0) {
                    return null;
                  }

                  return (
                    <div key={index} style={{ marginBottom: "14px" }}>
                      <div style={resumeItemTitleStyle}>
                        {[exp.role, exp.company].filter(Boolean).join(" - ")}
                      </div>
                      <ul style={resumeListStyle}>
                        {bullets.map((line, i) => (
                          <li key={i} style={resumeListItemStyle}>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </>
            )}

            {education && (
              <>
                <SectionHeading title="Education" />
                <div style={resumeItemTitleStyle}>{education}</div>
              </>
            )}

            {projects.some(
              (project) => project.name.trim() || project.description.trim()
            ) && (
              <>
                <SectionHeading title="Projects" />
                {projects.map((project, index) => {
                  const bullets = renderBulletList(project.description);
                  if (!project.name.trim() && bullets.length === 0) {
                    return null;
                  }

                  return (
                    <div key={index} style={{ marginBottom: "14px" }}>
                      <div style={resumeItemTitleStyle}>{project.name || "Project"}</div>
                      <ul style={resumeListStyle}>
                        {bullets.map((line, i) => (
                          <li key={i} style={resumeListItemStyle}>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={sectionCardStyle}>
      <h2 style={cardTitleStyle}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 5 }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={textareaStyle}
      />
    </div>
  );
}

function SectionHeading({ title }) {
  return <h2 style={resumeSectionHeadingStyle}>{title}</h2>;
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  padding: "24px",
  boxSizing: "border-box",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "24px",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "34px",
  color: "#1f2a44",
};

const pageSubtitleStyle = {
  margin: "6px 0 0 0",
  color: "#5f6b7a",
  fontSize: "15px",
};

const actionRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const contentStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "24px",
  alignItems: "start",
};

const editorPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const previewPanelOuterStyle = {
  position: "sticky",
  top: "20px",
};

const sectionCardStyle = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e8edf5",
};

const cardTitleStyle = {
  margin: "0 0 18px 0",
  fontSize: "20px",
  color: "#1f2a44",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#364152",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "15px",
  border: "1px solid #ccd5e1",
  borderRadius: "10px",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "15px",
  border: "1px solid #ccd5e1",
  borderRadius: "10px",
  boxSizing: "border-box",
  resize: "vertical",
  outline: "none",
  fontFamily: "inherit",
};

const primaryButtonStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "#1f2a44",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const successButtonStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "#0f9d58",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const lightButtonStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #d3dbe8",
  background: "#fff",
  color: "#1f2a44",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const dangerButtonStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "#dc2626",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const backButtonStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #d3dbe8",
  background: "#f8fafc",
  color: "#1f2a44",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const previewPaperStyle = {
  width: "100%",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "36px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e8edf5",
  boxSizing: "border-box",
};

const resumeHeaderStyle = {
  marginBottom: "18px",
};

const resumeNameStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#111827",
  fontWeight: "700",
};

const resumeRoleStyle = {
  margin: "6px 0",
  fontSize: "16px",
  color: "#374151",
};

const contactLineStyle = {
  margin: "8px 0 0 0",
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: 1.6,
};

const resumeSectionHeadingStyle = {
  marginTop: "20px",
  marginBottom: "10px",
  fontSize: "16px",
  color: "#1f2a44",
  borderBottom: "1px solid #dbe3ef",
  paddingBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const resumeParagraphStyle = {
  margin: 0,
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#1f2937",
  whiteSpace: "pre-line",
};

const resumeItemTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#111827",
  lineHeight: 1.6,
};

const resumeListStyle = {
  margin: "8px 0 0 0",
  paddingLeft: "18px",
};

const resumeListItemStyle = {
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#1f2937",
  marginBottom: "6px",
};

const dynamicBlockStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "18px",
  background: "#fafcff",
};

const dynamicHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const dynamicTitleStyle = {
  margin: 0,
  fontSize: "17px",
  color: "#1f2a44",
};

const loadingWrapperStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f4f7fb",
};

const loadingCardStyle = {
  background: "#fff",
  padding: "24px 32px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  fontSize: "18px",
  color: "#1f2a44",
};
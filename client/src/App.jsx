import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import ATSChecker from "./pages/ATSChecker";
import JobMatch from "./pages/JobMatch";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/ats/:id" element={<ATSChecker />} />
        <Route path="/job-match/:id" element={<JobMatch />} />
      </Routes>
    </BrowserRouter>
  );
}
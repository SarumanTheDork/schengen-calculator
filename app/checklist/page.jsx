'use client';

import { useState } from "react";

const CHECKLIST_BY_PROFILE = {
  salaried: [
    "Passport (valid for 6+ months)",
    "Recent photo (35mm x 45mm, white background)",
    "Last 3 months salary slips",
    "Last 6 months bank statements (stamped)",
    "Employment letter + leave approval",
    "ITR for last 2 years",
    "Flight and hotel reservations",
    "Travel insurance (min EUR 30,000 cover)",
  ],
  selfEmployed: [
    "Passport (valid for 6+ months)",
    "Recent photo (35mm x 45mm, white background)",
    "Business registration proof (GST/Udyam/Shop Act)",
    "Business bank statements (6 months)",
    "Personal bank statements (6 months)",
    "ITR + business financials for last 2 years",
    "Cover letter explaining trip purpose",
    "Flight and hotel reservations + travel insurance",
  ],
  student: [
    "Passport (valid for 6+ months)",
    "Recent photo (35mm x 45mm, white background)",
    "Current bonafide/student certificate",
    "No-objection certificate from institution",
    "Sponsor letter (if parent/guardian sponsoring)",
    "Sponsor bank statements + ITR",
    "Flight and hotel reservations",
    "Travel insurance (min EUR 30,000 cover)",
  ],
};

const PROFILE_LABEL = {
  salaried: "Salaried",
  selfEmployed: "Self-employed",
  student: "Student",
};

export default function ChecklistPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("salaried");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const downloadChecklist = () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setError("Please enter a valid email address.");
      return;
    }

    const today = new Date();
    const lines = CHECKLIST_BY_PROFILE[profile];
    const content = [
      "Schengen Document Checklist",
      `Profile: ${PROFILE_LABEL[profile]}`,
      `Requested by: ${email.trim()}`,
      `Generated on: ${today.toLocaleDateString("en-IN")}`,
      "",
      ...lines.map((item, i) => `${i + 1}. ${item}`),
      "",
      "Always confirm embassy-specific requirements before appointment.",
    ].join("\n");

    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    const fileUrl = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `schengen-checklist-${profile}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(fileUrl);

    setError("");
    setDone(true);
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#FAFBFD,#F1F5F9)", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="../" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>
          ← Back to calculator
        </a>

        <section style={{ marginTop: 12, background: "#fff", borderRadius: 18, padding: 22, border: "1px solid #E2E8F0", boxShadow: "0 8px 28px #00000012" }}>
          <h1 style={{ margin: 0, color: "#0F172A", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Free Schengen Checklist
          </h1>
          <p style={{ margin: "8px 0 18px", fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
            Get a profile-specific starter checklist instantly. Pick your profile, add your email, and download.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#475569", fontWeight: 600 }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#FAFBFD", fontSize: 14, color: "#1E293B", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#475569", fontWeight: 600 }}>Profile</label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#FAFBFD", fontSize: 14, color: "#1E293B", fontFamily: "inherit" }}
              >
                <option value="salaried">Salaried</option>
                <option value="selfEmployed">Self-employed</option>
                <option value="student">Student</option>
              </select>
            </div>

            {error && <p style={{ margin: 0, color: "#DC2626", fontSize: 12 }}>{error}</p>}
            {done && <p style={{ margin: 0, color: "#15803D", fontSize: 12 }}>Checklist downloaded. Safe travels.</p>}

            <button
              onClick={downloadChecklist}
              style={{ marginTop: 2, border: "none", borderRadius: 12, background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 700, padding: "12px 16px", cursor: "pointer", fontFamily: "inherit" }}
            >
              Download Free Checklist
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

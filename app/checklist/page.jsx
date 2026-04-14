'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { withToolBase } from "../lib/toolBase";

const COMMON_SECTIONS = [
  {
    title: "Core Visa File (Every Applicant)",
    items: [
      "Passport: issued within last 10 years, valid 3+ months after planned return, 2 blank pages",
      "All old passports (if available), especially those with Schengen/UK/US visas",
      "Visa application form + appointment confirmation + VFS checklist printout",
      "Cover letter with exact trip purpose, dates, route, and who is funding what",
      "Two recent photos (35 x 45 mm, white background, matte finish, neutral expression)",
      "Round-trip flight reservation with PNR and date consistency across all documents",
      "Hotel booking for every night OR invitation letter + host ID/proof of address",
      "Day-by-day itinerary (city, date, transport, stay, activity) matched to bookings",
      "Travel insurance: EUR 30,000 minimum, entire Schengen area, full travel period plus buffer",
    ],
  },
  {
    title: "Financial Proof Standards",
    items: [
      "Personal bank statements (last 6 months), stamped or digitally verifiable",
      "Healthy balance trend; avoid sudden cash spikes right before application",
      "Source explanations for large credits (salary, transfer, FD break, business payment)",
      "Latest ITR acknowledgment + computation (prefer 2-3 assessment years)",
      "PAN and Aadhaar copy (carry originals for appointment day)",
      "If sponsor-funded: sponsor ID, relationship proof, signed sponsorship letter, sponsor finances",
    ],
  },
  {
    title: "Trip Credibility Signals",
    items: [
      "Logical route and duration relative to your income, leave, and profile",
      "First entry should usually match issuing embassy jurisdiction and major stay",
      "Document dates must match exactly (itinerary, leave letter, flights, insurance)",
      "Keep emergency buffer days to avoid accidental overstay from delays",
    ],
  },
  {
    title: "Pre-Submission QA",
    items: [
      "Name spelling exactly as passport on every document and booking",
      "Passport number consistent everywhere (forms, insurance, bookings)",
      "Sign all required fields; no blank mandatory sections in form",
      "Carry originals + one clean photocopy set in order of checklist",
      "Save one PDF bundle copy for your own records",
    ],
  },
];

const PROFILE_SECTIONS = {
  salaried: [
    {
      title: "Employment Documents (Salaried)",
      items: [
        "Employment verification letter on company letterhead with role, DOJ, and salary",
        "Leave approval letter with exact approved dates matching itinerary",
        "Last 3 to 6 salary slips with company stamp/sign if available",
        "Form 16 and latest compensation structure (if available)",
        "HR contact details included for verification calls",
      ],
    },
  ],
  selfEmployed: [
    {
      title: "Business Documents (Self-employed)",
      items: [
        "Business registration: GST/Udyam/Shop Act/Partnership deed/COI as applicable",
        "Business bank statements (6 months) + personal statements (6 months)",
        "Company ITR + personal ITR + audited/CA-certified P&L and balance sheet",
        "Recent GST returns or invoices proving active business operations",
        "Business cover letter on letterhead explaining ongoing operations during travel",
      ],
    },
  ],
  student: [
    {
      title: "Academic + Sponsorship (Student)",
      items: [
        "Bonafide certificate (current semester) + valid ID card copy",
        "No-objection certificate from college/university with leave period",
        "If sponsored by parent/guardian: notarized sponsorship letter",
        "Sponsor relationship proof (birth certificate/passport names/family register)",
        "Sponsor bank statements, ITR, and employment/business proof",
      ],
    },
  ],
};

const EMBASSY_NOTES = [
  "France: strong itinerary quality and financial consistency usually matter more than over-documenting.",
  "Switzerland: clean file order + clear purpose statement improves processing confidence.",
  "Italy/Spain: booking consistency and realistic daily plan reduce query chances.",
  "Germany: documentation discipline is strict; avoid missing signatures/annexures.",
  "Always follow latest embassy/VFS checklist over any generic internet list.",
];

const RED_FLAGS = [
  "Fresh large cash deposits with no source trail",
  "Dummy/cancel-prone bookings that conflict with itinerary",
  "Applying through an embassy that is not your main destination",
  "Employment/college letters without contact details or clear dates",
  "Contradictions between cover letter, form, and financial profile",
];

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const src = params.get("src");
      if (src) {
        const existingFirst = localStorage.getItem("xnomadic_ref_source_first");
        if (!existingFirst) localStorage.setItem("xnomadic_ref_source_first", src);
        localStorage.setItem("xnomadic_ref_source_last", src);
      }
    } catch {}
  }, []);

  const downloadChecklist = async () => {
    const emailValue = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const source = params?.get("src") || "checklist_direct";
    const referralSource = params?.get("ref")
      || (typeof window !== "undefined" ? localStorage.getItem("xnomadic_ref_source_last") : null)
      || source;
    try {
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, profile, source, referralSource }),
      });
      if (!leadRes.ok) {
        setError("Could not save your request right now. Please try again.");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("Network error while saving your request. Please retry.");
      setSubmitting(false);
      return;
    }

    const today = new Date();
    const profileSections = PROFILE_SECTIONS[profile] || [];
    const allSections = [...COMMON_SECTIONS, ...profileSections];
    const sectionLines = allSections.flatMap((section) => [
      `## ${section.title}`,
      ...section.items.map((item, i) => `${i + 1}. ${item}`),
      "",
    ]);
    const content = [
      "# xnomadic Schengen Visa File Checklist",
      "",
      `**Profile:** ${PROFILE_LABEL[profile]}`,
      `**Requested by:** ${emailValue}`,
      `**Generated on:** ${today.toLocaleDateString("en-IN")}`,
      "",
      "Use this as your working prep sheet. Tick items only after you have verified date and name consistency across all pages.",
      "",
      ...sectionLines,
      "## Embassy-Specific Notes (Quick Guide)",
      ...EMBASSY_NOTES.map((item, i) => `${i + 1}. ${item}`),
      "",
      "## Refusal Risk Triggers to Avoid",
      ...RED_FLAGS.map((item, i) => `${i + 1}. ${item}`),
      "",
      "## Final Day-Before-Appointment Pack Order",
      "1. Passport + old passports",
      "2. Application form + appointment letter",
      "3. Cover letter + itinerary",
      "4. Flights + hotels + insurance",
      "5. Financials (bank + ITR + profile-specific docs)",
      "6. Employment/business/student support letters",
      "7. Photographs + photocopy set + backup soft copies",
      "",
      "Note: Embassy and VFS checklists can change. Always verify official requirements right before submission.",
    ].join("\n");

    const file = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const fileUrl = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `xnomadic-schengen-checklist-${profile}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(fileUrl);

    setError("");
    setDone(true);
    setSubmitting(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#FAFBFD,#F1F5F9)", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href={withToolBase("/")} style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>
          ← Back to calculator
        </Link>

        <section style={{ marginTop: 12, background: "#fff", borderRadius: 18, padding: 22, border: "1px solid #E2E8F0", boxShadow: "0 8px 28px #00000012" }}>
          <h1 style={{ margin: 0, color: "#0F172A", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Free Schengen Checklist
          </h1>
          <p style={{ margin: "8px 0 18px", fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
            Download a detailed, profile-specific Schengen file checklist built for Indian applicants.
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
              <p style={{ marginTop: 6, fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>
                Privacy: we store this email to send product updates and checklist improvements. We never sell your data.
              </p>
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
              disabled={submitting}
              style={{ marginTop: 2, border: "none", borderRadius: 12, background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 700, padding: "12px 16px", cursor: "pointer", fontFamily: "inherit" }}
            >
              {submitting ? "Saving request..." : "Download Comprehensive Checklist"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

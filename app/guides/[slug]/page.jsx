import Link from "next/link";

const GUIDE_CONTENT = {
  "best-schengen-calculator-for-indians": {
    title: "Best Schengen Calculator for Indians: What Actually Matters",
    summary: "Most calculators show a number. Serious planners need context, simulation, and execution support.",
    sections: [
      {
        heading: "Why basic calculators fail",
        points: [
          "They often skip behavioral guidance around rolling windows and edge cases.",
          "They do not help you evaluate future travel scenarios before booking.",
          "They rarely connect day tracking with visa-file preparation quality.",
        ],
      },
      {
        heading: "What a high-performance tool should include",
        points: [
          "Accurate 90/180 rolling logic with practical warnings.",
          "Future trip planning to stress-test stay length safely.",
          "India-specific guidance for profiles like salaried, self-employed, and student.",
        ],
      },
    ],
  },
  "france-schengen-checklist-india": {
    title: "France Schengen Checklist for Indian Applicants",
    summary: "A clean file wins faster than a bulky file. Focus on consistency, traceability, and realism.",
    sections: [
      {
        heading: "Core file quality rules",
        points: [
          "All dates must match exactly across itinerary, bookings, leave letters, and insurance.",
          "Financial profile should support trip intent naturally; avoid unexplained spikes.",
          "Cover letter should be concise, specific, and coherent with your documents.",
        ],
      },
      {
        heading: "Common failure points",
        points: [
          "Inconsistent destination logic between first entry and major stay.",
          "Weak purpose statement or vague itinerary.",
          "Missing support proof for sponsor-funded travel.",
        ],
      },
    ],
  },
  "salaried-indian-schengen-visa-checklist": {
    title: "Salaried Indian Schengen Visa Checklist",
    summary: "For salaried applicants, employment credibility and document consistency are the primary levers.",
    sections: [
      {
        heading: "Non-negotiable salaried documents",
        points: [
          "Employment verification letter with role, tenure, and salary.",
          "Leave approval matching travel dates exactly.",
          "Recent salary slips plus bank statements showing regular credits.",
        ],
      },
      {
        heading: "How to strengthen approval confidence",
        points: [
          "Show stable finances over 6 months, not last-minute injections.",
          "Ensure itinerary cost is proportional to income profile.",
          "Keep every ID field (name, passport number, DOB) identical everywhere.",
        ],
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(GUIDE_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const guide = GUIDE_CONTENT[params.slug];
  if (!guide) {
    return {
      title: "Schengen Guide — xnomadic",
      description: "Actionable Schengen planning guide for Indian travelers.",
    };
  }
  return {
    title: `${guide.title} — xnomadic`,
    description: guide.summary,
  };
}

export default function GuidePage({ params }) {
  const guide = GUIDE_CONTENT[params.slug];
  if (!guide) {
    return (
      <main style={{ minHeight: "100vh", padding: "24px 16px", background: "linear-gradient(180deg,#FAFBFD,#F1F5F9)" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20 }}>
          <h1 style={{ margin: "0 0 8px", color: "#0F172A", fontSize: 26 }}>Guide not found</h1>
          <p style={{ color: "#64748B", margin: "0 0 12px", lineHeight: 1.7 }}>This guide does not exist yet. Browse available guides from the calculator home page.</p>
          <Link href="/" style={{ color: "#2563EB", textDecoration: "none", fontWeight: 700 }}>← Back to calculator</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", background: "linear-gradient(180deg,#FAFBFD,#F1F5F9)" }}>
      <article style={{ maxWidth: 840, margin: "0 auto", background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 22 }}>
        <Link href="/" style={{ color: "#2563EB", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>← Back to calculator</Link>
        <h1 style={{ margin: "10px 0 8px", color: "#0F172A", fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{guide.title}</h1>
        <p style={{ margin: "0 0 16px", color: "#475569", fontSize: 14, lineHeight: 1.75 }}>{guide.summary}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {guide.sections.map((section) => (
            <section key={section.heading} style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", background: "#FAFBFF" }}>
              <h2 style={{ margin: "0 0 8px", color: "#1E293B", fontSize: 18 }}>{section.heading}</h2>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.8 }}>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

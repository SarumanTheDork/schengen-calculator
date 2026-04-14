import Link from "next/link";
import { GUIDE_CONTENT, GUIDE_SLUGS } from "../../lib/guides";

export async function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
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

        <section style={{ marginTop: 16, border: "1px solid #DBEAFE", borderRadius: 12, padding: "14px 16px", background: "#EFF6FF" }}>
          <h2 style={{ margin: "0 0 8px", color: "#1E40AF", fontSize: 16 }}>Need the full checklist pack?</h2>
          <p style={{ margin: "0 0 10px", color: "#1E3A8A", fontSize: 13, lineHeight: 1.7 }}>
            Download the profile-specific comprehensive checklist and use it as your final visa-file QA sheet.
          </p>
          <Link href={`/checklist?src=guide_${params.slug}`} style={{ display: "inline-block", textDecoration: "none", background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 14px", borderRadius: 10 }}>
            Get Comprehensive Checklist
          </Link>
        </section>
      </article>
    </main>
  );
}

import Link from "next/link";
import { GUIDE_CONTENT, GUIDE_SLUGS } from "../lib/guides";

export const metadata = {
  title: "Schengen Visa Guides for Indians — xnomadic",
  description: "Actionable Schengen planning guides for Indian travelers: checklists, refusal patterns, and 90/180 strategy.",
};

export default function GuidesIndexPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", background: "linear-gradient(180deg,#FAFBFD,#F1F5F9)" }}>
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#2563EB", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
          ← Back to calculator
        </Link>

        <h1 style={{ margin: "10px 0 8px", color: "#0F172A", fontSize: 32, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          Schengen Guides for Indian Travelers
        </h1>
        <p style={{ margin: "0 0 16px", color: "#475569", fontSize: 14, lineHeight: 1.8 }}>
          High-intent playbooks covering checklists, refusal-risk patterns, and practical 90/180 planning strategy.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 10 }}>
          {GUIDE_SLUGS.map((slug) => {
            const guide = GUIDE_CONTENT[slug];
            return (
              <Link
                key={slug}
                href={`/guides/${slug}`}
                style={{ textDecoration: "none", background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "14px 14px 12px", boxShadow: "0 1px 2px #0000000a" }}
              >
                <h2 style={{ margin: "0 0 6px", color: "#1E293B", fontSize: 16, lineHeight: 1.35 }}>{guide.title}</h2>
                <p style={{ margin: 0, color: "#64748B", fontSize: 12, lineHeight: 1.7 }}>{guide.summary}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

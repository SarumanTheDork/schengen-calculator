import Link from "next/link";
import { GUIDE_CONTENT, GUIDE_SLUGS } from "../../lib/guides";
const APP_BASE = "/tools/schengen-calculator";

const STOP_WORDS = new Set(["for", "and", "the", "india", "indians", "visa", "schengen", "to"]);

function slugTokens(slug) {
  return new Set(
    slug
      .split("-")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && !STOP_WORDS.has(s))
  );
}

function getRelatedGuideSlugs(currentSlug, limit = 4) {
  const base = slugTokens(currentSlug);
  return GUIDE_SLUGS
    .filter((slug) => slug !== currentSlug)
    .map((slug) => {
      const other = slugTokens(slug);
      let score = 0;
      for (const token of base) if (other.has(token)) score += 1;
      return { slug, score };
    })
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((x) => x.slug);
}

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
          <Link href={APP_BASE} style={{ color: "#2563EB", textDecoration: "none", fontWeight: 700 }}>← Back to calculator</Link>
        </div>
      </main>
    );
  }

  const faqItems = [
    {
      q: `Who should use this guide: ${guide.title}?`,
      a: `${guide.summary} Use it as a pre-submission checklist reference, not as a legal substitute for embassy instructions.`,
    },
    {
      q: "Is this guide alone enough to guarantee Schengen visa approval?",
      a: "No guide can guarantee approval. Decision quality depends on your document consistency, finances, travel intent clarity, and embassy-specific checks.",
    },
    {
      q: "How should I use this with the calculator?",
      a: "First validate your 90/180 day availability in the calculator, then use this guide to build a cleaner and more coherent visa file before appointment.",
    },
  ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
  const relatedSlugs = getRelatedGuideSlugs(params.slug, 4);

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", background: "linear-gradient(180deg,#FAFBFD,#F1F5F9)" }}>
      <article style={{ maxWidth: 840, margin: "0 auto", background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 22 }}>
        <Link href={APP_BASE} style={{ color: "#2563EB", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>← Back to calculator</Link>
        <section style={{ position: "sticky", top: 12, zIndex: 3, marginTop: 12, marginBottom: 12, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", borderRadius: 12, padding: "10px 12px", boxShadow: "0 8px 24px #1d4ed833" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ color: "#DBEAFE", fontSize: 12, lineHeight: 1.5 }}>
              Validate your real 90/180 status before you book.
            </div>
            <Link
              href={`${APP_BASE}/?src=guide_sticky_cta_${params.slug}`}
              style={{ textDecoration: "none", background: "#fff", color: "#1D4ED8", fontSize: 12, fontWeight: 800, padding: "8px 12px", borderRadius: 9, whiteSpace: "nowrap" }}
            >
              Check days now
            </Link>
          </div>
        </section>
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
          <Link href={`${APP_BASE}/checklist?src=guide_${params.slug}`} style={{ display: "inline-block", textDecoration: "none", background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 14px", borderRadius: 10 }}>
            Get Comprehensive Checklist
          </Link>
        </section>

        <section style={{ marginTop: 16, border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", background: "#fff" }}>
          <h2 style={{ margin: "0 0 8px", color: "#1E293B", fontSize: 16 }}>Related guides</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {relatedSlugs.map((slug) => (
              <Link key={slug} href={`${APP_BASE}/guides/${slug}`} style={{ textDecoration: "none", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", background: "#FAFBFF" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{GUIDE_CONTENT[slug].title}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, lineHeight: 1.6 }}>{GUIDE_CONTENT[slug].summary}</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 16, border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", background: "#FAFBFF" }}>
          <h2 style={{ margin: "0 0 8px", color: "#1E293B", fontSize: 16 }}>Quick FAQ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqItems.map((f) => (
              <div key={f.q} style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>{f.q}</div>
                <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}

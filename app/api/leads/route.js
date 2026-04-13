import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PROFILES = new Set(["salaried", "selfEmployed", "student"]);

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const profile = String(body?.profile || "");
    const source = String(body?.source || "unknown");

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (!VALID_PROFILES.has(profile)) {
      return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
    }

    const lead = {
      email,
      profile,
      source,
      createdAt: new Date().toISOString(),
    };

    // Always log server-side so there is at least capture visibility.
    console.log("[lead_capture]", lead);

    const webhook = process.env.LEADS_WEBHOOK_URL;
    if (webhook) {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!r.ok) {
        return NextResponse.json({ error: "Lead destination rejected payload." }, { status: 502 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to capture lead." }, { status: 500 });
  }
}

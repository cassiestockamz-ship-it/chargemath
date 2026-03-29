import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://yoypsojuedwyzymbsubu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveXBzb2p1ZWR3eXp5bWJzdWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjE3MjQsImV4cCI6MjA4NzAzNzcyNH0.tnAlDR4MHllLjrbv49xWbOEf_QNMjAFtk1vjXIa91fs";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const res = await fetch(`${SUPABASE_URL}/rest/v1/email_subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email: cleanEmail,
        site_id: "chargemath",
        source: source || null,
      }),
    });

    if (res.status === 409 || res.status === 23505) {
      // Duplicate — treat as success
      return NextResponse.json({ ok: true, message: "Already subscribed" });
    }

    if (!res.ok) {
      const text = await res.text();
      // Check for unique violation in response body
      if (text.includes("duplicate") || text.includes("unique")) {
        return NextResponse.json({ ok: true, message: "Already subscribed" });
      }
      console.error("Supabase error:", res.status, text);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

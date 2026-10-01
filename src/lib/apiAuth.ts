import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// Returns a 401 response unless ANALYTICS_API_KEY is set and the x-api-key header matches it.
export function requireAnalyticsKey(request: NextRequest): NextResponse | null {
  const expected = process.env.ANALYTICS_API_KEY;
  const given = request.headers.get("x-api-key") || "";
  if (expected && given.length === expected.length) {
    if (timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return null;
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

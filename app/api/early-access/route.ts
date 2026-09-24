import { NextResponse } from "next/server";

// Backs the book-a-call form (name / email / phone / designation).
// TODO: wire this to a real destination (email / Slack webhook / Google Sheet /
// CRM). Right now it only validates shape and logs server-side, so the form is
// genuinely functional end to end but submissions are not delivered anywhere yet.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const designation = String(body.designation ?? "").trim();
  if (!name || !phone || !designation || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  // eslint-disable-next-line no-console
  console.log("[HuntFloor book-a-call]", {
    ...body,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

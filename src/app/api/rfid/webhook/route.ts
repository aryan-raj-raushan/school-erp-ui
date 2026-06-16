import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook target for the RFID reader's "Set Service Url" config
 * (paste this route's full URL into http://<reader-ip>/admin_action_page).
 * We don't know the reader's exact payload shape yet, so this accepts
 * GET query params, JSON body, or form-encoded body and logs whatever
 * comes in. In-memory ring buffer — fine for a single dev/server instance,
 * swap for DB storage once the real payload shape is confirmed.
 */
type RfidTapEvent = {
  receivedAt: string;
  method: "GET" | "POST";
  query: Record<string, string>;
  body: unknown;
};

const MAX_EVENTS = 100;
const recentEvents: RfidTapEvent[] = [];

function pushEvent(event: RfidTapEvent) {
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_EVENTS) recentEvents.length = MAX_EVENTS;
}

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());

  // List mode for the admin UI: GET /api/rfid/webhook?list=1
  if ("list" in query) {
    return NextResponse.json({ events: recentEvents });
  }

  pushEvent({
    receivedAt: new Date().toISOString(),
    method: "GET",
    query,
    body: null,
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const contentType = request.headers.get("content-type") ?? "";

  let body: unknown = null;
  try {
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
    } else {
      const text = await request.text();
      body = text || null;
    }
  } catch {
    body = null;
  }

  pushEvent({
    receivedAt: new Date().toISOString(),
    method: "POST",
    query,
    body,
  });

  return NextResponse.json({ ok: true });
}

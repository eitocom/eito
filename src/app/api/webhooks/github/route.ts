import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-hub-signature-256");
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing x-hub-signature-256 header" }, { status: 401 });
    }

    const payloadText = await request.text();
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payloadText).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = request.headers.get("x-github-event");
    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

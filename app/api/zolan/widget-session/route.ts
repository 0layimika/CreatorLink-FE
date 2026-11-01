import { NextRequest, NextResponse } from "next/server";

const apiBase = (process.env.ZOLAN_API_URL ?? "http://localhost:3002/api/v1").replace(/\/$/, "");

export async function POST(request: NextRequest) {
  const secret = process.env.ZOLAN_MERCHANT_API_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Set ZOLAN_MERCHANT_API_SECRET on the Creator Link server after creating a merchant integration key." },
      { status: 503 },
    );
  }

  let selection: unknown;
  try {
    const body = await request.json();
    selection = body?.selection;
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  try {
    const response = await fetch(`${apiBase}/merchant/integration/widget-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin,
        variant: "STANDARD",
        selection,
        integrationSource: "creatorlink-local-demo",
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Unable to reach the local Zolan API." }, { status: 503 });
  }
}

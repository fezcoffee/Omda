import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/xero";

export async function GET() {
  try {
    const url = await getAuthorizationUrl();
    return NextResponse.redirect(url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Xero not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

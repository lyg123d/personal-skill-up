import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    connected: Boolean(request.cookies.get("youtube_access_token")?.value)
  });
}

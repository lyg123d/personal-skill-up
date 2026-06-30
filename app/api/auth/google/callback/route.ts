import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL("/?youtube=oauth_failed", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/?youtube=oauth_not_configured", request.url));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/?youtube=oauth_token_failed", request.url));
  }

  const token = (await tokenResponse.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const response = NextResponse.redirect(new URL("/?youtube=connected", request.url));
  response.cookies.delete("google_oauth_state");
  if (token.access_token) {
    response.cookies.set("youtube_access_token", token.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: token.expires_in || 3600
    });
  }
  if (token.refresh_token) {
    response.cookies.set("youtube_refresh_token", token.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }
  return response;
}

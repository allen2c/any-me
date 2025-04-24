import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ANY_LOGIN_PROXY_URL =
  process.env.ANY_LOGIN_PROXY_URL || "http://localhost:3000"; // URL of any-login

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Forward the request to any-login's userinfo proxy endpoint
    const response = await fetch(
      `${ANY_LOGIN_PROXY_URL}/api/auth/oauth2/userinfo`,
      {
        headers: {
          // Forward the access token to the proxy endpoint
          Authorization: `Bearer ${accessToken}`,
          // If the proxy relies on cookies, you may need to forward them carefully
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error from userinfo endpoint:", response.status, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user info from proxy:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}

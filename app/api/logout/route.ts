import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ANY_LOGIN_PROXY_URL =
  process.env.ANY_LOGIN_PROXY_URL || "http://localhost:3000"; // URL of any-login

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    // Call any-login's logout endpoint
    if (accessToken) {
      const logoutResponse = await fetch(
        `${ANY_LOGIN_PROXY_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            // Forward cookies if any-login's logout needs them
            Cookie: req.headers.get("cookie") || "",
          },
        }
      );

      if (!logoutResponse.ok) {
        console.warn(
          "Call to any-login logout endpoint failed:",
          logoutResponse.statusText
        );
        // Still proceed to clear local cookies
      }
    }
  } catch (error) {
    console.error("Error calling any-login logout endpoint:", error);
    // Still proceed to clear local cookies
  }

  // Prepare response to clear cookies on the any-me domain
  const response = NextResponse.json({ message: "Logout successful" });

  // Instruct the browser to delete the cookies
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  // Attempt to clear cookies set by any-login if they share a common parent domain
  const domain = process.env.COOKIE_DOMAIN; // e.g., ".example.com"
  if (domain) {
    response.cookies.set({
      name: "accessToken",
      value: "",
      path: "/",
      maxAge: -1,
      domain: domain,
    });
    response.cookies.set({
      name: "refreshToken",
      value: "",
      path: "/",
      maxAge: -1,
      domain: domain,
    });
  }

  return response;
}

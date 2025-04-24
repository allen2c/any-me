import { NextRequest, NextResponse } from "next/server";

const ANY_LOGIN_PROXY_URL =
  process.env.ANY_LOGIN_PROXY_URL || "http://localhost:3000"; // URL of any-login

export async function POST(req: NextRequest) {
  // Get token from header if needed for server-side revocation
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.split(" ")[1];

  try {
    // Call any-login's logout endpoint (which might call revoke)
    if (accessToken) {
      console.log("Forwarding logout request to any-login proxy");
      const logoutResponse = await fetch(
        `${ANY_LOGIN_PROXY_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            // Forward token if needed by any-login's logout
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!logoutResponse.ok) {
        console.warn(
          "Call to any-login logout endpoint failed:",
          logoutResponse.statusText
        );
      } else {
        console.log("any-login logout endpoint call successful.");
      }
    } else {
      console.warn("No access token provided for server-side logout.");
    }
  } catch (error) {
    console.error("Error calling any-login logout endpoint:", error);
  }

  // Prepare response - primarily for confirming client-side action
  const response = NextResponse.json({ message: "Logout processed" });

  // No need to delete cookies here as we are not using them for auth in any-me

  return response;
}

// Token management and authentication utilities
import { UserInfo } from "../types/auth";

const ANY_LOGIN_BASE_URL = "http://localhost:3000"; // Base URL for any-login

export async function fetchUserInfo(): Promise<UserInfo> {
  // Get token from localStorage
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Not authenticated. Please log in.");
  }

  // Call the local API route, sending the token in the header
  const response = await fetch("/api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be invalid or expired on the server
      localStorage.removeItem("accessToken");
      throw new Error("Not authenticated. Please log in.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch user info: ${response.statusText}`
    );
  }
  return response.json();
}

export function redirectToLogin(): void {
  const loginUrl = new URL(`${ANY_LOGIN_BASE_URL}/login`);
  // Tell any-login where to redirect back to after successful login
  loginUrl.searchParams.set(
    "redirect_uri",
    `${window.location.origin}/callback`
  );
  // You could add other OAuth parameters here if needed (e.g., state)
  window.location.href = loginUrl.toString();
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem("accessToken");
  localStorage.removeItem("accessToken"); // Clear token immediately

  // Call the local logout API route (which will call any-login's revoke/logout)
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        // Send the token if your logout endpoint needs it for server-side revocation
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      console.warn("Logout API call failed:", response.statusText);
      // Don't necessarily throw error, local token is cleared anyway
    }
  } catch (err) {
    console.error("Error calling logout API:", err);
    // Don't necessarily throw error
  }
}

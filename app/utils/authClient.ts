// Token management and authentication utilities
import { UserInfo } from "../types/auth";

const ANY_LOGIN_BASE_URL = "http://localhost:3000"; // Base URL for any-login

export async function fetchUserInfo(): Promise<UserInfo> {
  // Call the new local API route in any-me
  const response = await fetch("/api/me");

  if (!response.ok) {
    if (response.status === 401) {
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
  // Call the new local logout API route
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
    });
    if (!response.ok) {
      console.warn("Logout API call failed:", response.statusText);
      throw new Error("Logout failed");
    }
  } catch (err) {
    console.error("Error calling logout API:", err);
    throw err;
  }
}

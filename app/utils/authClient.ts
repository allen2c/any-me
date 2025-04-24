// Token management and authentication utilities
import { UserInfo } from "../types/auth";

const TOKEN_STORAGE_KEY = "anyMeAuthToken";
const ANY_LOGIN_BASE_URL = "http://localhost:3000"; // Base URL for any-login

export function storeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing token:", error);
  }
}

export async function fetchUserInfo(token: string): Promise<UserInfo> {
  const response = await fetch(
    `${ANY_LOGIN_BASE_URL}/api/auth/oauth2/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearToken(); // Token likely invalid or expired
      throw new Error("Session expired or invalid. Please log in again.");
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
  const token = getToken();
  if (token) {
    // Optional: Attempt to revoke token on the server via any-login's proxy
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("token_type_hint", "access_token");

      await fetch(`${ANY_LOGIN_BASE_URL}/api/auth/oauth2/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
    } catch (err) {
      console.warn(
        "Failed to revoke token on server (might already be invalid):",
        err
      );
    }
  }
  clearToken(); // Always clear local token
}

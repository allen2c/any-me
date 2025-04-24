"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserInfo } from "./types/auth";
import { fetchUserInfo, redirectToLogin, logout } from "./utils/authClient";

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Checking auth status by fetching user info...");
        const data = await fetchUserInfo();
        setUserInfo(data);
      } catch (err) {
        console.error("Auth check failed:", err);
        if (
          !(err instanceof Error && err.message.includes("Not authenticated"))
        ) {
          setError(
            err instanceof Error ? err.message : "Could not load user data."
          );
        }
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
      setUserInfo(null);
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    redirectToLogin();
  };

  // --- Rendering Logic ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {error && (
          <div className="text-red-500 p-4 border border-red-300 rounded-md mb-4">
            {error}
          </div>
        )}

        {userInfo ? (
          // --- Logged In View ---
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            {userInfo.picture && (
              <Image
                src={userInfo.picture}
                alt="User profile"
                width={64}
                height={64}
                className="rounded-full mx-auto mb-3"
              />
            )}
            <p className="mb-1">
              <strong>Username:</strong>{" "}
              {userInfo.preferred_username || userInfo.name || "N/A"}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {userInfo.email || "N/A"}
            </p>
            <p className="mb-4">
              <strong>User ID:</strong> {userInfo.sub || "N/A"}
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Logout
            </button>
          </div>
        ) : (
          // --- Logged Out View ---
          <div className="flex flex-col items-center gap-4">
            <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
              <li className="mb-2 tracking-[-.01em]">You are not logged in.</li>
              <li className="tracking-[-.01em]">
                Click the login button to authenticate.
              </li>
            </ol>

            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <button
                onClick={handleLogin}
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              >
                Login via Any-Login SSO
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-sm text-gray-500">
          Any-Me - Cross-domain testing app
        </span>
      </footer>
    </div>
  );
}

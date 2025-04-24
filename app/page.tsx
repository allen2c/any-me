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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-light">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <header className="w-full pt-6 pb-2 px-6 flex justify-center">
        <div className="max-w-screen-lg w-full flex justify-between items-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-900 dark:text-white"
          >
            <rect
              width="48"
              height="48"
              rx="8"
              fill="#3B82F6"
              fillOpacity="0.1"
            />
            <title>M Logo</title>
            <path
              d="M 4.8 43.2 L 4.8 4.8 L 14.4 4.8 L 24 24 L 33.6 4.8 L 43.2 4.8 L 43.2 43.2 L 36 43.2 L 24 33.6 L 12 43.2 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
          {userInfo && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-screen-sm w-full">
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {userInfo ? (
            // --- Logged In View ---
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {userInfo.picture && (
                  <div className="shrink-0">
                    <Image
                      src={userInfo.picture}
                      alt="User profile"
                      width={80}
                      height={80}
                      className="rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                    />
                  </div>
                )}

                <div className="flex-grow space-y-4 text-center sm:text-left">
                  <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
                    Welcome,{" "}
                    {userInfo.preferred_username || userInfo.name || "User"}
                  </h1>

                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
                        Email
                      </span>
                      <span className="font-mono text-sm">
                        {userInfo.email || "N/A"}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
                        User ID
                      </span>
                      <span className="font-mono text-sm truncate max-w-xs">
                        {userInfo.sub || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // --- Logged Out View ---
            <div className="flex flex-col items-center text-center space-y-10">
              <div className="space-y-4">
                <h1 className="text-4xl font-medium text-gray-900 dark:text-white">
                  Any-Me
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
                  Cross-domain testing application
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 w-full max-w-md">
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                  Welcome
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Sign in to access your account and manage your cross-domain
                  testing.
                </p>

                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Sign in with Any-Login SSO
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full py-6 px-6 flex justify-center">
        <div className="max-w-screen-lg w-full text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Any-Me — Cross-domain testing app
          </p>
        </div>
      </footer>
    </div>
  );
}

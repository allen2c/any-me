"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth Error on callback:", error, errorDescription);
      // Redirect to home page with error
      router.replace(
        `/?error=${encodeURIComponent(
          errorDescription || error || "Login failed"
        )}`
      );
    } else if (token) {
      console.log("Callback successful, storing token...");
      localStorage.setItem("accessToken", token);
      // Redirect to the home page. The home page's useEffect will fetch user info.
      router.replace("/");
    } else {
      console.warn("Callback received without token or error.");
      router.replace("/?error=Callback%20issue");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing login...</p>
    </div>
  );
}

export default function CallbackPage() {
  // Wrap with Suspense because useSearchParams needs it
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

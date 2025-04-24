"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storeToken } from "../utils/authClient";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth Error:", error, errorDescription);
      // Redirect to login page with error
      router.replace(
        `/?error=${encodeURIComponent(error)}&desc=${encodeURIComponent(
          errorDescription || "Unknown error"
        )}`
      );
    } else if (token) {
      console.log("Received token via callback.");
      storeToken(token);
      // Redirect to the home page after storing the token
      router.replace("/");
    } else {
      console.error("Callback received without token or error.");
      // Redirect to home page with a generic error
      router.replace("/?error=callback_failed");
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

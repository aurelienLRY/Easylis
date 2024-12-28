"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Hook to check if the user is authenticated.
 * Redirects to the login page if the user is not authenticated.
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login page
    }
  }, [status, router]);

  return { session, status };
};

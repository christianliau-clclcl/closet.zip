"use client"; // Error pages must run in the browser (Next.js rule)

import { useEffect } from "react";
import StatusPage from "@/components/StatusPage";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void; // Next.js 16: tries to load the page again
};

// Shown when a page fails unexpectedly, e.g. Supabase can't be reached.
// The visitor never sees technical details; the browser console gets them.
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage title="Something went wrong" message="Couldn't load this page. Check your connection and try again.">
      <button type="button" onClick={() => retry()} className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell">
        Try again
      </button>
    </StatusPage>
  );
}

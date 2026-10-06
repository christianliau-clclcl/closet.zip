import type { Metadata } from "next";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = { title: "Nothing here", robots: { index: false, follow: false } };

// A private profile and a username that doesn't exist look the same, on
// purpose (decided 2026-10-05): nobody can tell who has an account.
export default function PublicClosetNotFound() {
  return <StatusPage title="Nothing here" message="This closet is private or doesn’t exist." />;
}

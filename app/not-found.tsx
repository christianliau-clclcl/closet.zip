import type { Metadata } from "next";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = { title: "Not found" };

// Shown for addresses that don't exist, and for pieces that aren't yours
// (Row Level Security makes other people's items look like they don't exist).
export default function NotFound() {
  return (
    <StatusPage
      title="Nothing here"
      message="This page doesn't exist, or the piece isn't in your closet."
    />
  );
}

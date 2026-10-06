import Link from "next/link";
import ZoomSlider from "@/components/ZoomSlider";
import type { Zoom } from "@/lib/zoom";

type PublicTopBarProps = {
  closetName?: string;
  username: string;
  zoom?: { value: Zoom; onChange: (zoom: Zoom) => void }; // desktop; none for an empty closet
};

// The top bar of someone's public closet (Milestone 15d, decided
// 2026-10-05): the closet's name with @username beside it in stone (just
// @username when unnamed), and on the right zoom (desktop) and a quiet
// CLOSET.ZIP link home, where a visitor can log in or start their own.
export default function PublicTopBar({ closetName, username, zoom }: PublicTopBarProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-rule px-4 py-3 md:px-8">
      <p className="flex min-w-0 items-baseline gap-2 text-label uppercase">
        {closetName && <span className="truncate">{closetName}</span>}
        <span className={`shrink-0 normal-case ${closetName ? "text-stone" : ""}`}>@{username}</span>
      </p>
      <div className="flex shrink-0 items-center gap-6">
        {zoom && (
          <div className="hidden md:block">
            <ZoomSlider value={zoom.value} onChange={zoom.onChange} />
          </div>
        )}
        <Link href="/" className="text-label text-stone uppercase underline-offset-4 hover:underline">
          Closet.zip
        </Link>
      </div>
    </header>
  );
}

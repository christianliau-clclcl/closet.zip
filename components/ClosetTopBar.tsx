"use client";

import Link from "next/link";
import { useState } from "react";
import { chipClass } from "@/components/Chip";
import ClosetNameModal from "@/components/ClosetNameModal";
import LogOutButton from "@/components/LogOutButton";
import PublicProfileModal from "@/components/PublicProfileModal";
import TopBar from "@/components/TopBar";
import TopMenu from "@/components/TopMenu";
import ZoomSlider from "@/components/ZoomSlider";
import type { PublicProfile } from "@/lib/profile";
import type { Zoom } from "@/lib/zoom";

type ClosetTopBarProps = {
  closetName?: string; // shown instead of CLOSET.ZIP
  publicProfile: PublicProfile;
  zoom?: { value: Zoom; onChange: (zoom: Zoom) => void }; // none for an empty closet
};

// The closet's top bar: the closet's name on the left. Desktop: zoom, ADD and
// MENU. Phones: MENU only; zoom and ADD live in the bottom bar there
// (DESIGN.md "Phones"). MENU holds naming the closet, CLOSET SETUP (the
// onboarding steps again), the public profile (username and PUBLIC) and
// LOG OUT.
export default function ClosetTopBar({ closetName, publicProfile, zoom }: ClosetTopBarProps) {
  const [naming, setNaming] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menu = (
    <TopMenu>
      <button type="button" onClick={() => setNaming(true)} className="cursor-pointer text-label uppercase">
        {closetName ? "Rename closet" : "Name your closet"}
      </button>
      {/* Onboarding again, with your earlier answers (15¼b). */}
      <Link href="/welcome?from=menu" className="text-label uppercase">
        Closet setup
      </Link>
      <button type="button" onClick={() => setProfileOpen(true)} className="cursor-pointer text-label uppercase">
        Public profile{publicProfile.isPublic ? " · On" : ""}
      </button>
      <LogOutButton />
    </TopMenu>
  );

  return (
    <>
      <TopBar title={closetName}>
        <div className="hidden items-center gap-6 md:flex">
          {zoom && <ZoomSlider value={zoom.value} onChange={zoom.onChange} />}
          {/* A filled chip, so the main action stands out. */}
          <Link href="/add" className={chipClass(true)}>
            + Add
          </Link>
          {menu}
        </div>
        <div className="flex items-center gap-6 md:hidden">{menu}</div>
      </TopBar>
      {naming && <ClosetNameModal current={closetName} onClose={() => setNaming(false)} />}
      {profileOpen && <PublicProfileModal current={publicProfile} onClose={() => setProfileOpen(false)} />}
    </>
  );
}

import Link from "next/link";
import LogOutButton from "@/components/LogOutButton";
import PhoneMenu from "@/components/PhoneMenu";
import TopBar from "@/components/TopBar";
import ZoomSlider from "@/components/ZoomSlider";
import type { Zoom } from "@/lib/zoom";

type ClosetTopBarProps = {
  zoom?: { value: Zoom; onChange: (zoom: Zoom) => void }; // none for an empty closet
};

// The closet's top bar. Desktop: zoom, ADD and LOG OUT in a row. Phones: MENU
// (log out, with room for more later); zoom and ADD live in the bottom bar
// there (DESIGN.md "Phones").
export default function ClosetTopBar({ zoom }: ClosetTopBarProps) {
  return (
    <TopBar>
      <div className="hidden items-center gap-6 md:flex">
        {zoom && <ZoomSlider value={zoom.value} onChange={zoom.onChange} />}
        <Link href="/add" className="text-label uppercase">
          Add
        </Link>
        <LogOutButton />
      </div>
      <div className="flex items-center gap-6 md:hidden">
        <PhoneMenu>
          <LogOutButton />
        </PhoneMenu>
      </div>
    </TopBar>
  );
}

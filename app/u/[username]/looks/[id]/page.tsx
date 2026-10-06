import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LookView from "@/components/LookView";
import PublicTopBar from "@/components/PublicTopBar";
import { getMyUnit } from "@/lib/profile";
import { getPublicCloset } from "@/lib/public-closet";
import { createClient } from "@/lib/supabase/server";

// Not listed or searchable, like the rest of a public closet (PRODUCT.md 15).
const unlisted = { index: false, follow: false };

export async function generateMetadata(props: PageProps<"/u/[username]/looks/[id]">): Promise<Metadata> {
  const { username, id } = await props.params;
  const closet = await getPublicCloset(username);
  const look = closet?.looks.find((l) => l.id === id);
  return { title: look && closet ? `${look.name} (@${closet.username})` : "Nothing here", robots: unlisted };
}

// A look in someone's public closet, at /@username/looks/<id> (Milestone
// 17e): read-only, only the pieces visitors can see. A hidden look, a
// private closet or an unknown address all show the not-found page.
export default async function PublicLookPage(props: PageProps<"/u/[username]/looks/[id]">) {
  const { username, id } = await props.params;
  const closet = await getPublicCloset(username);
  const look = closet?.looks.find((l) => l.id === id);
  if (!closet || !look) notFound();

  // Measurements in a logged-in visitor's own unit, else inches.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const unit = data?.claims ? await getMyUnit() : "in";

  return (
    <>
      <PublicTopBar closetName={closet.closetName} username={closet.username} />
      <LookView
        look={look}
        items={closet.items}
        folders={closet.folders}
        looks={closet.looks}
        initialUnit={unit}
        visitor={{ closetHref: `/@${closet.username}`, username: closet.username, saleContact: closet.saleContact }}
      />
    </>
  );
}

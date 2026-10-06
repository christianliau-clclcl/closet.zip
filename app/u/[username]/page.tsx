import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClosetView from "@/components/ClosetView";
import { getMyPublicProfile, getMyUnit } from "@/lib/profile";
import { getPublicCloset } from "@/lib/public-closet";
import { createClient } from "@/lib/supabase/server";

// Public closets aren't listed or searchable (PRODUCT.md 15): people find
// one only from its link.
const unlisted = { index: false, follow: false };

export async function generateMetadata(props: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await props.params;
  const closet = await getPublicCloset(username);
  if (!closet) return { title: "Nothing here", robots: unlisted };
  return {
    title: closet.closetName ? `${closet.closetName} (@${closet.username})` : `@${closet.username}`,
    robots: unlisted,
  };
}

// Someone's public closet at /@username (Milestone 15d): the closet screen
// in visitor mode, read-only. A private profile and an unknown username both
// show the not-found page. Measurements in a logged-in visitor's own unit,
// else inches.
export default async function PublicClosetPage(props: PageProps<"/u/[username]">) {
  const { username } = await props.params;
  const closet = await getPublicCloset(username);
  if (!closet) notFound();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);
  const [unit, mine] = loggedIn ? await Promise.all([getMyUnit(), getMyPublicProfile()]) : ["in" as const, undefined];

  return (
    <ClosetView
      items={closet.items}
      folders={closet.folders}
      initialUnit={unit}
      closetName={closet.closetName}
      visitor={{ username: closet.username, ownPage: mine?.username === closet.username }}
    />
  );
}

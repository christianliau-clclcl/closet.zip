import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LookView from "@/components/LookView";
import TopBar from "@/components/TopBar";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyFolders } from "@/lib/folders";
import { getMyItems } from "@/lib/items";
import { getMyLooks } from "@/lib/looks";
import { getMyUnit } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Look" };

// One of your looks (Milestone 17b). Logged-in only; someone else's look
// (or a made-up address) shows "not found", since Row Level Security hides it.
export default async function LookPage(props: PageProps<"/looks/[id]">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { id } = await props.params;
  const [looks, items, folders, unit] = await Promise.all([getMyLooks(), getMyItems(), getMyFolders(), getMyUnit()]);
  const look = looks.find((l) => l.id === id);
  if (!look) notFound();

  return (
    <>
      <TopBar title={closetNameFrom(data.claims)} />
      <LookView look={look} items={items} folders={folders} looks={looks} initialUnit={unit} />
    </>
  );
}

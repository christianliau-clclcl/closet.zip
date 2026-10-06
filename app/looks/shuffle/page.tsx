import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ShuffleView from "@/components/ShuffleView";
import TopBar from "@/components/TopBar";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyItems } from "@/lib/items";
import { shuffle } from "@/lib/shuffle";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Shuffle" };

// SHUFFLE (Milestone 17d). Logged-in only. The first pick is made here, on
// the server, so the page and the browser show the same outfit (picking in
// the browser too would draw two different ones).
export default async function ShufflePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const items = await getMyItems();

  return (
    <>
      <TopBar title={closetNameFrom(data.claims)} />
      <ShuffleView items={items} first={shuffle(items)} />
    </>
  );
}

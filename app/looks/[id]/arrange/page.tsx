import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LookEditor from "@/components/LookEditor";
import TopBar from "@/components/TopBar";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyItems } from "@/lib/items";
import { getMyLooks } from "@/lib/looks";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Arrange look" };

// ARRANGE a look's board (Milestone 17c). Logged-in only; someone else's
// look (or a made-up address) shows "not found".
export default async function ArrangeLookPage(props: PageProps<"/looks/[id]/arrange">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { id } = await props.params;
  const [looks, items] = await Promise.all([getMyLooks(), getMyItems()]);
  const look = looks.find((l) => l.id === id);
  if (!look) notFound();

  return (
    <>
      <TopBar title={closetNameFrom(data.claims)} />
      <LookEditor look={look} items={items} />
    </>
  );
}

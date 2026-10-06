import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import NewLookForm from "@/components/NewLookForm";
import TopBar from "@/components/TopBar";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyItems } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New look" };

// + NEW LOOK (Milestone 17b). Logged-in only. Every piece can go in a look,
// archived ones too (a look is a record); they're listed after the rest.
export default async function NewLookPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const items = await getMyItems();

  return (
    <>
      <TopBar title={closetNameFrom(data.claims)}>
        <Link href="/?view=looks" className="text-label uppercase">
          Cancel
        </Link>
      </TopBar>
      <NewLookForm items={items} />
    </>
  );
}

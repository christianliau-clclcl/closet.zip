import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddItemForm from "@/components/AddItemForm";
import TopBar from "@/components/TopBar";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyHistory } from "@/lib/items";
import { getMyUnit } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Add a piece" };

// Add a piece to your closet. Logged-in only.
export default async function AddPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const [history, unit] = await Promise.all([getMyHistory(), getMyUnit()]);

  return (
    <>
      <TopBar title={closetNameFrom(data.claims)}>
        <Link href="/" className="text-label uppercase">
          Cancel
        </Link>
      </TopBar>
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20">
        <h1 className="font-serif text-title">Add a piece</h1>
        <div className="mt-8">
          <AddItemForm history={history} initialUnit={unit} />
        </div>
      </main>
    </>
  );
}

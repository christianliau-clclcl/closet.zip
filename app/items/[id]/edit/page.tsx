import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditItemForm from "@/components/EditItemForm";
import PhotoManager from "@/components/PhotoManager";
import TopBar from "@/components/TopBar";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyBrands, getMyItem } from "@/lib/items";
import { getMyUnit } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit piece" };

// Edit one of your items: its photos (saved straight away) and its details.
// Logged-in only; someone else's item (or a made-up
// address) shows "not found", since Row Level Security hides it.
export default async function EditItemPage(props: PageProps<"/items/[id]/edit">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { id } = await props.params;
  const [item, brands, unit] = await Promise.all([getMyItem(id), getMyBrands(), getMyUnit()]);
  if (!item) notFound();

  return (
    <>
      <TopBar title={closetNameFrom(data.claims)}>
        <Link href={`/?item=${item.id}`} className="text-label uppercase">
          Cancel
        </Link>
      </TopBar>
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20">
        <h1 className="font-serif text-title">Edit piece</h1>
        <div className="mt-8">
          {/* The key changes whenever the saved photos or their order change,
              so the manager starts fresh from what's actually saved. */}
          <PhotoManager
            key={(item.photos ?? []).map((p) => p.id).join()}
            itemId={item.id}
            photos={item.photos ?? [item.hero]}
          />
        </div>
        <div className="mt-12">
          <EditItemForm item={item} brandSuggestions={brands} initialUnit={unit} />
        </div>
      </main>
    </>
  );
}

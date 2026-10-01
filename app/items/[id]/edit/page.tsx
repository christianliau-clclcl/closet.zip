import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditItemForm from "@/components/EditItemForm";
import PhotoManager from "@/components/PhotoManager";
import TopBar from "@/components/TopBar";
import { getMyBrands, getMyItem } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";

// Edit one of your items: its photos (saved straight away) and its details.
// Logged-in only; someone else's item (or a made-up
// address) shows "not found", since Row Level Security hides it.
export default async function EditItemPage(props: PageProps<"/items/[id]/edit">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { id } = await props.params;
  const [item, brands] = await Promise.all([getMyItem(id), getMyBrands()]);
  if (!item) notFound();

  return (
    <>
      <TopBar>
        <Link href={`/?item=${item.id}`} className="text-label uppercase">
          Cancel
        </Link>
      </TopBar>
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20">
        <h1 className="font-serif text-title">Edit piece</h1>
        <div className="mt-8">
          <PhotoManager itemId={item.id} photos={item.photos ?? [item.hero]} />
        </div>
        <div className="mt-12">
          <EditItemForm item={item} brandSuggestions={brands} />
        </div>
      </main>
    </>
  );
}

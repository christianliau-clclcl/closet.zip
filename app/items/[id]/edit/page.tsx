import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditItemForm from "@/components/EditItemForm";
import TopBar from "@/components/TopBar";
import { itemTitle } from "@/lib/format";
import { getMyBrands, getMyItem } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";

// Edit one of your items. Logged-in only; someone else's item (or a made-up
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
        <h1 className="font-serif text-title">Edit details</h1>
        {/* Which piece this is. Changing the photo comes in Milestone 7. */}
        <div className="relative mt-8 aspect-square w-32">
          <Image
            src={item.hero.thumbSrc ?? item.hero.src}
            alt={itemTitle(item)}
            fill
            sizes="128px"
            unoptimized={item.hero.unoptimized}
            className="object-contain"
          />
        </div>
        <div className="mt-8">
          <EditItemForm item={item} brandSuggestions={brands} />
        </div>
      </main>
    </>
  );
}

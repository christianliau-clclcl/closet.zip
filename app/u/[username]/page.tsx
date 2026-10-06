import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCloset } from "@/lib/public-closet";

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

// Someone's public closet at /@username (Milestone 15d), read-only. A
// private profile and an unknown username both show the not-found page.
// Step 1: a plain grid to check the data; the full closet view follows.
export default async function PublicClosetPage(props: PageProps<"/u/[username]">) {
  const { username } = await props.params;
  const closet = await getPublicCloset(username);
  if (!closet) notFound();

  return (
    <main className="p-4 md:p-8">
      <h1 className="font-serif text-title">{closet.closetName ?? `@${closet.username}`}</h1>
      <p className="mt-2 text-stone">
        @{closet.username} · {closet.items.length} pieces · {closet.folders.length} folders
      </p>
      <ul className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6">
        {closet.items.map((item) => (
          <li key={item.id} className="aspect-square p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- temporary, replaced in step 2 */}
            <img src={item.hero.thumbSrc ?? item.hero.src} alt={item.name ?? "Piece"} className="h-full w-full object-contain" />
          </li>
        ))}
      </ul>
    </main>
  );
}

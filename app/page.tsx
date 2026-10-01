import ClosetView from "@/components/ClosetView";
import { getMyFolders } from "@/lib/folders";
import { getMyItems } from "@/lib/items";
import { getMyUnit } from "@/lib/profile";
import { sampleItems } from "@/lib/sample-items";
import { createClient } from "@/lib/supabase/server";

// Homepage: the closet. Logged in, it's your own items from the database;
// logged out, it's the sample closet as a demo.
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  const [items, folders, unit] = loggedIn
    ? await Promise.all([getMyItems(), getMyFolders(), getMyUnit()])
    : [sampleItems, [], "in" as const];

  return <ClosetView items={items} folders={folders} loggedIn={loggedIn} initialUnit={unit} />;
}

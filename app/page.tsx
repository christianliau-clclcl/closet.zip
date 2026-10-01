import ClosetView from "@/components/ClosetView";
import { getMyItems } from "@/lib/items";
import { sampleItems } from "@/lib/sample-items";
import { createClient } from "@/lib/supabase/server";

// Homepage: the closet. Logged in, it's your own items from the database;
// logged out, it's the sample closet as a demo.
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  const items = loggedIn ? await getMyItems() : sampleItems;

  return <ClosetView items={items} loggedIn={loggedIn} />;
}

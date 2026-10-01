import ClosetView from "@/components/ClosetView";
import { sampleItems } from "@/lib/sample-items";
import { createClient } from "@/lib/supabase/server";

// Homepage: the closet. Logged-out visitors see the sample closet as a demo.
// Everyone sees sample data until Milestone 5 adds real items.
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return <ClosetView items={sampleItems} loggedIn={Boolean(data?.claims)} />;
}

import AuthForm from "@/components/AuthForm";
import ClosetView from "@/components/ClosetView";
import TopBar from "@/components/TopBar";
import { getMyFolders } from "@/lib/folders";
import { getMyItems } from "@/lib/items";
import { getMyUnit } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

// Homepage. Logged in: your closet. Logged out: one quiet line about what
// Closet.zip is, and the log in / sign up form in the middle of the page
// (decided 2026-10-02; there's no demo closet).
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <>
        <TopBar />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <p className="mb-12 text-center text-stone">A private archive of the clothes you own, and have owned.</p>
            <AuthForm />
          </div>
        </main>
      </>
    );
  }

  const [items, folders, unit] = await Promise.all([getMyItems(), getMyFolders(), getMyUnit()]);
  return <ClosetView items={items} folders={folders} initialUnit={unit} />;
}

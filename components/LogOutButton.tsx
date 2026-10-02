"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Ends the session, then re-renders the page as logged out (the log in form).
export default function LogOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logOut() {
    setBusy(true);
    await createClient().auth.signOut();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logOut}
      disabled={busy}
      className="cursor-pointer text-label uppercase disabled:cursor-wait"
    >
      {busy ? "Logging out…" : "Log out"}
    </button>
  );
}

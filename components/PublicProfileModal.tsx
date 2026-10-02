"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Chip from "@/components/Chip";
import FormField from "@/components/FormField";
import type { PublicProfile } from "@/lib/profile";
import { saveMyPublicProfile, usernameAvailable } from "@/lib/profile-client";
import { normaliseUsername, usernameProblem } from "@/lib/usernames";

type PublicProfileModalProps = {
  current: PublicProfile;
  onClose: () => void;
};

type Availability = "idle" | "checking" | "available" | "taken";

// MENU → Public profile (Milestone 15a): your username and PUBLIC · OFF / ON.
// Same shape as the closet name modal. As you type, it checks (after a short
// pause) whether the username is free. The public page itself arrives in 15d.
export default function PublicProfileModal({ current, onClose }: PublicProfileModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState(current.username ?? "");
  const [isPublic, setIsPublic] = useState(current.isPublic);
  const [availability, setAvailability] = useState<Availability>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = normaliseUsername(typed);
  const problem = usernameProblem(username);
  const unchanged = username === (current.username ?? "");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    // Opening moves focus to the first button (✕); start in the field instead.
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
  }, []);

  // Is the name free? Asked 0.4s after typing stops, not on every key.
  useEffect(() => {
    if (!username || problem || unchanged) return;
    let latest = true;
    const timer = setTimeout(() => {
      setAvailability("checking");
      usernameAvailable(username)
        .then((free) => latest && setAvailability(free ? "available" : "taken"))
        .catch(() => latest && setAvailability("idle"));
    }, 400);
    return () => {
      latest = false;
      clearTimeout(timer);
    };
  }, [username, problem, unchanged]);

  const hint = !username
    ? "Your address: closet-zip.vercel.app/@username"
    : (problem ??
      (unchanged || availability === "available"
        ? `closet-zip.vercel.app/@${username}${unchanged ? "" : " is available."}`
        : availability === "taken"
          ? "That username is taken."
          : availability === "checking"
            ? "Checking…"
            : `closet-zip.vercel.app/@${username}`));

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (problem) return setError(problem);
    if (isPublic && !username) return setError("Choose a username to go public.");
    if (availability === "taken" && !unchanged) return setError("That username is taken.");
    setBusy(true);
    setError(null);
    try {
      await saveMyPublicProfile(username || null, isPublic && Boolean(username));
      onClose();
      router.refresh();
    } catch (cause) {
      // The database has the final say: 23505 means someone has that name.
      const code = (cause as { code?: string }).code;
      setError(code === "23505" ? "That username is taken." : "Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Public profile"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none flex-col bg-cell p-0 outline-none open:flex backdrop:bg-transparent md:m-auto md:h-auto md:max-w-sm md:backdrop:bg-scrim md:backdrop:backdrop-blur-md"
    >
      <form onSubmit={save} className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
          <h2 className="text-label uppercase">Public profile</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-8 px-4 py-6 md:px-8">
          <FormField
            label="Username"
            placeholder="e.g. sam.closet"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={21}
            hint={hint}
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
              setAvailability("idle");
            }}
          />
          <fieldset>
            <legend className="text-label uppercase">Public</legend>
            <div className="mt-2 flex gap-2">
              <Chip chosen={!isPublic} onClick={() => setIsPublic(false)}>
                Off
              </Chip>
              <Chip chosen={isPublic} onClick={() => setIsPublic(true)}>
                On
              </Chip>
            </div>
            <p className="mt-4 text-stone">
              When on, anyone with your link can see your closet: photos, name, brand, category, colour, material,
              size, measurements and date acquired. Never prices, where things came from or your notes. You’ll be able
              to hide pieces and folders.
            </p>
            <p className="mt-2 text-stone">Your public page is coming soon; you can choose your username now.</p>
          </fieldset>
        </div>
        <div className="border-t border-rule px-4 py-4 md:px-8">
          {error && (
            <p role="alert" className="mb-4">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

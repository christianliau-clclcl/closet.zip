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
// pause) whether the username is free. Once public: VIEW PAGE and COPY LINK.
export default function PublicProfileModal({ current, onClose }: PublicProfileModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState(current.username ?? "");
  const [isPublic, setIsPublic] = useState(current.isPublic);
  // PUBLIC · FOR SALE ONLY (16): your page shows only your listings.
  const [forSaleOnly, setForSaleOnly] = useState(current.isPublic && current.forSaleOnly);
  const [contact, setContact] = useState(current.saleContact ?? "");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      await saveMyPublicProfile(username || null, isPublic && Boolean(username), forSaleOnly, contact);
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
              <Chip
                chosen={!isPublic}
                onClick={() => {
                  setIsPublic(false);
                  setForSaleOnly(false);
                }}
              >
                Off
              </Chip>
              <Chip
                chosen={isPublic && forSaleOnly}
                onClick={() => {
                  setIsPublic(true);
                  setForSaleOnly(true);
                }}
              >
                For sale only
              </Chip>
              <Chip
                chosen={isPublic && !forSaleOnly}
                onClick={() => {
                  setIsPublic(true);
                  setForSaleOnly(false);
                }}
              >
                On
              </Chip>
            </div>
            <p className="mt-4 text-stone">
              {isPublic && forSaleOnly
                ? "Anyone with your link sees only the pieces you’ve listed for sale, with their price, condition and note. The rest of your closet stays private."
                : "When on, anyone with your link can see your closet: photos, name, brand, category, colour, material, size, measurements and date acquired, your looks, and the asking price of pieces for sale. Never what you paid, where things came from or your notes. Hide pieces, folders and looks from their details, or many pieces at once with SELECT."}
            </p>
          </fieldset>
          <div>
            <FormField
              label="For sale contact"
              placeholder="e.g. DM @sam.closet on Instagram, e-transfer only"
              maxLength={200}
              hint="Shown with your listings, so buyers know how to reach you. Nothing about buyers is saved."
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
            {/* Your saved public page (15d): open it, or copy its address to send. */}
            {current.isPublic && current.username && (
              <div className="mt-4 flex gap-6">
                <a href={`/@${current.username}`} className="text-label uppercase underline underline-offset-4">
                  View page
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`${window.location.origin}/@${current.username}`);
                      setCopied(true);
                    } catch {
                      setError("Couldn't copy. The address is closet-zip.vercel.app/@" + current.username);
                    }
                  }}
                  className="cursor-pointer text-label uppercase underline underline-offset-4"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            )}
          </div>
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

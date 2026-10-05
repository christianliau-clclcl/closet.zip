"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/Chip";
import FormField from "@/components/FormField";
import { MAX_CLOSET_NAME, checkClosetName } from "@/lib/closet-name";
import type { Unit } from "@/lib/measurements";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { saveMyUnit, saveOnboardingStep } from "@/lib/profile-client";
import { createClient } from "@/lib/supabase/client";

type WelcomeFlowProps = {
  closetName?: string; // named at sign-up, if so
  initialUnit: Unit;
};

// Onboarding (PRODUCT.md 15½; mockups on the "Onboarding explorations"
// canvas): shown once at first login. Step 1: closet name and units. SKIP
// leaves without saving; either way it isn't shown again. Everything here
// can be changed later (MENU for the name, IN · CM in a piece's details).
export default function WelcomeFlow({ closetName, initialUnit }: WelcomeFlowProps) {
  const router = useRouter();
  const [name, setName] = useState(closetName ?? "");
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Done or skipped: remember it, then on to the closet (replacing this page,
  // so Back doesn't return here).
  async function finish(save?: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await save?.();
      await saveOnboardingStep(ONBOARDING_STEPS);
      router.replace("/");
      router.refresh();
    } catch (problem) {
      setError(
        problem instanceof Error && problem.message.startsWith("Keep it")
          ? problem.message
          : "Couldn't save. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  async function saveStep() {
    const checked = checkClosetName(name); // throws "Keep it to 30 characters."
    if (checked !== (closetName ?? null)) {
      const supabase = createClient();
      const { error: saveError } = await supabase.auth.updateUser({ data: { closet_name: checked } });
      if (saveError) throw saveError;
      // The name travels in the login itself: get a fresh one.
      await supabase.auth.refreshSession();
    }
    if (unit !== initialUnit) await saveMyUnit(unit);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        finish(saveStep);
      }}
      className="flex flex-1 flex-col"
    >
      <div className="mx-auto flex w-full max-w-sm items-center justify-end px-4 py-4">
        <button
          type="button"
          onClick={() => finish()}
          disabled={busy}
          className="cursor-pointer text-label uppercase disabled:cursor-wait"
        >
          Skip
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-4 pt-6 pb-8 md:pt-12">
        <div>
          <h1 className="font-serif text-title">Welcome to your closet.</h1>
          <p className="mt-2 text-stone">
            A couple of quick questions so adding pieces takes fewer taps. You can change these later.
          </p>
        </div>
        <FormField
          label="Closet name"
          placeholder="e.g. Sam’s Closet"
          maxLength={MAX_CLOSET_NAME + 10}
          hint="Shown at the top instead of CLOSET.ZIP."
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <fieldset>
          <legend className="text-label uppercase">Measurements in</legend>
          <div className="mt-2 flex gap-2">
            <Chip chosen={unit === "in"} onClick={() => setUnit("in")}>
              In
            </Chip>
            <Chip chosen={unit === "cm"} onClick={() => setUnit("cm")}>
              Cm
            </Chip>
          </div>
          <p className="mt-2 text-stone">For pit to pit, inseam and the rest.</p>
        </fieldset>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto w-full max-w-sm px-4 py-4">
          {error && (
            <p role="alert" className="mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
          >
            {busy ? "Saving…" : "Done"}
          </button>
        </div>
      </div>
    </form>
  );
}

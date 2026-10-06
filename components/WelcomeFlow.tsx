"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/Chip";
import FormField from "@/components/FormField";
import WelcomeCategories from "@/components/WelcomeCategories";
import WelcomeSizes from "@/components/WelcomeSizes";
import { categoryInfo, sizeKinds, type Category, type UsualSizes } from "@/lib/categories";
import { MAX_CLOSET_NAME, checkClosetName } from "@/lib/closet-name";
import type { Unit } from "@/lib/measurements";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import type { ClosetSetup } from "@/lib/profile";
import { saveMyUnit, saveOnboardingStep } from "@/lib/profile-client";
import { createClient } from "@/lib/supabase/client";

type WelcomeFlowProps = {
  closetName?: string; // named at sign-up, if so
  initialUnit: Unit;
  setup: ClosetSetup; // earlier answers, when coming back from MENU
  startAt: number; // the first step to show (0-based): where you left off
  reached: number; // steps done or skipped so far
};

const titles = ["Welcome to your closet.", "What’s in your closet?", "Your sizes"];

// Onboarding (PRODUCT.md 15½, 15¼b; mockups on the "Onboarding
// explorations" canvas). Shown once at first login, and again from MENU →
// Closet setup. Three steps: (1) closet name and units, (2) the categories
// you own, (3) your sizes for the kinds of size those need. NEXT saves the
// step; SKIP moves on without saving; ← goes back. Either way each step
// counts as seen, so it isn't shown again.
export default function WelcomeFlow({ closetName, initialUnit, setup, startAt, reached }: WelcomeFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(startAt);
  const [seen, setSeen] = useState(reached);
  const [name, setName] = useState(closetName ?? "");
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [mine, setMine] = useState<Category[]>(setup.categories ?? []);
  const [sizes, setSizes] = useState<UsualSizes>(setup.sizes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const last = step === ONBOARDING_STEPS - 1;
  // Step 3 asks only for the kinds of size your categories need; all of
  // them if you skipped step 2 or ticked none.
  const needed = sizeKinds.filter((kind) => mine.some((category) => categoryInfo[category].size === kind));
  const kinds = mine.length > 0 ? needed : sizeKinds;

  // Saves (when not skipping), records the step as seen, then moves on; after
  // the last step, on to the closet (replacing this page, so Back doesn't
  // return here).
  async function advance(skip: boolean) {
    setBusy(true);
    setError(null);
    try {
      const counted = Math.max(seen, step + 1);
      if (!skip && step === 0) await saveName();
      await saveOnboardingStep(
        counted,
        skip
          ? {}
          : step === 1
            ? { closetCategories: mine }
            : step === 2
              ? { usualSizes: trimmed(sizes) }
              : {},
      );
      setSeen(counted);
      if (last) {
        router.replace("/");
        router.refresh();
        return;
      }
      setStep(step + 1);
      setBusy(false);
      window.scrollTo(0, 0);
    } catch (problem) {
      setError(
        problem instanceof Error && problem.message.startsWith("Keep it")
          ? problem.message
          : "Couldn't save. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  async function saveName() {
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

  const label = `Step ${step + 1} of ${ONBOARDING_STEPS}`;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        advance(false);
      }}
      className="flex flex-1 flex-col"
    >
      <div className="mx-auto w-full max-w-sm px-4 pt-4">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={busy}
              aria-label={`Back to step ${step}`}
              className="cursor-pointer text-label text-stone uppercase"
            >
              ← {label}
            </button>
          ) : (
            <p className="text-label text-stone uppercase">{label}</p>
          )}
          <button
            type="button"
            onClick={() => advance(true)}
            disabled={busy}
            className="cursor-pointer text-label uppercase disabled:cursor-wait"
          >
            Skip
          </button>
        </div>
        <div aria-hidden className="mt-4 flex gap-1">
          {Array.from({ length: ONBOARDING_STEPS }, (_, index) => (
            <span key={index} className={`h-0.5 flex-1 ${index <= step ? "bg-ink" : "bg-rule"}`} />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-4 pt-8 pb-8 md:pt-12">
        <div>
          <h1 className="font-serif text-title">{titles[step]}</h1>
          <p className="mt-2 text-stone">
            {step === 0
              ? "Three quick questions so adding pieces takes fewer taps. Skip any of them; you can change them later from MENU."
              : step === 1
                ? "Tick all that apply. They come first when you add a piece; the rest are a tap away."
                : "The size you usually buy. It fills in when you add a piece; you can always change it."}
          </p>
        </div>

        {step === 0 && (
          <>
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
          </>
        )}
        {step === 1 && <WelcomeCategories value={mine} onChange={setMine} />}
        {step === 2 && (
          <>
            {kinds.length > 0 ? (
              <>
                <WelcomeSizes kinds={kinds} value={sizes} onChange={setSizes} />
                <p className="text-stone">Bags, sunglasses and accessories don’t need one.</p>
              </>
            ) : (
              <p className="text-stone">None of your categories need a size. You’re all set.</p>
            )}
          </>
        )}
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
            {busy ? "Saving…" : last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
}

// Sizes as saved: trimmed, empty ones left out.
function trimmed(sizes: UsualSizes): UsualSizes {
  const result: UsualSizes = {};
  for (const kind of sizeKinds) {
    const size = sizes[kind]?.trim();
    if (size) result[kind] = size;
  }
  return result;
}

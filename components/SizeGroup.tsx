"use client";

import { useState } from "react";
import Chip from "@/components/Chip";
import FormField from "@/components/FormField";
import { categoriesWithSize, sizeKindInfo, sizeSystemOf, type SizeKind } from "@/lib/categories";
import { formatCategory } from "@/lib/format";

type SizeGroupProps = {
  kind: SizeKind;
  size: string | undefined;
  onChange: (size: string | undefined) => void;
};

// One kind of size in onboarding's "Your sizes" (15¼b). Tops and shoes have
// a sizing system switch (LETTER · EU · NUMBERED, US · UK · EU) beside the
// label, styled like IN · CM; the chips follow it, and the size is saved with
// its system in front ("EU 43"). OTHER… opens a field to type anything else
// ("32 × 30", "IT 48").
export default function SizeGroup({ kind, size, onChange }: SizeGroupProps) {
  const info = sizeKindInfo[kind];
  const start = sizeSystemOf(kind, size);
  const [systemKey, setSystemKey] = useState(start.system.key);
  const [typing, setTyping] = useState(Boolean(size && !start.chip));
  const system = info.systems.find((s) => s.key === systemKey) ?? info.systems[0];
  const chip = size && size.startsWith(system.prefix) ? size.slice(system.prefix.length) : undefined;

  // "Tops, t-shirts, shirts…": which categories this size fills in for.
  const covers = categoriesWithSize(kind)
    .map((category, index) => (index === 0 ? formatCategory(category) : formatCategory(category).toLowerCase()))
    .join(", ");

  return (
    <fieldset>
      <div className="flex items-baseline justify-between gap-4">
        <legend className="text-label uppercase">{info.label}</legend>
        {info.systems.length > 1 && (
          <div role="group" aria-label={`${info.label} system`} className="flex gap-3">
            {info.systems.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={s.key === system.key}
                onClick={() => {
                  if (s.key === system.key) return;
                  setSystemKey(s.key);
                  if (!typing) onChange(undefined); // a chip from the other system no longer fits
                }}
                className={`cursor-pointer text-label uppercase underline-offset-4 ${
                  s.key === system.key ? "text-ink underline" : "text-stone"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-1 text-stone">{covers}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {system.options.map((option) => (
          <Chip
            key={option}
            chosen={!typing && chip === option}
            onClick={() => {
              setTyping(false);
              onChange(!typing && chip === option ? undefined : system.prefix + option);
            }}
          >
            {option}
          </Chip>
        ))}
        <Chip
          chosen={typing}
          onClick={() => {
            setTyping(!typing);
            onChange(undefined);
          }}
        >
          Other…
        </Chip>
      </div>
      {typing && (
        <div className="mt-4">
          <FormField
            label={`Your ${info.label.toLowerCase()}`}
            placeholder={kind === "waist" ? "e.g. 32 × 30" : kind === "shoe" ? "e.g. JP 27" : "e.g. IT 48"}
            maxLength={20}
            value={size ?? ""}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )}
    </fieldset>
  );
}

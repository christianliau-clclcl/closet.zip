"use client";

import SizeGroup from "@/components/SizeGroup";
import type { SizeKind, UsualSizes } from "@/lib/categories";

type WelcomeSizesProps = {
  kinds: readonly SizeKind[]; // the kinds your categories need
  value: UsualSizes;
  onChange: React.Dispatch<React.SetStateAction<UsualSizes>>; // from the latest sizes
};

// Onboarding step 3 (15¼b): "Your sizes", one group (SizeGroup) per kind
// of size your categories need.
export default function WelcomeSizes({ kinds, value, onChange }: WelcomeSizesProps) {
  return (
    <div className="flex flex-col gap-8">
      {kinds.map((kind) => (
        <SizeGroup
          key={kind}
          kind={kind}
          size={value[kind]}
          onChange={(size) =>
            onChange((current) => {
              const next = { ...current };
              if (size?.trim()) next[kind] = size; // trimmed when saved
              else delete next[kind];
              return next;
            })
          }
        />
      ))}
    </div>
  );
}

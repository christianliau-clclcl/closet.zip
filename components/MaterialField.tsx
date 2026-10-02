"use client";

import { useState } from "react";
import Chip from "@/components/Chip";
import FormField from "@/components/FormField";

// The materials offered as chips (decided 2026-10-03).
const MATERIALS = ["Cotton", "Leather", "Twill", "Nylon", "Polyester", "Wool", "Linen"];

type MaterialFieldProps = {
  value: string; // saved as one line: "Cotton, Wool, Cashmere"
  onChange: (material: string) => void;
};

// Splits a saved material line into the chips it matches and anything else.
function parse(value: string): { chosen: string[]; other: string } {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  const chip = (part: string) => MATERIALS.find((m) => m.toLowerCase() === part.toLowerCase());
  return {
    chosen: MATERIALS.filter((m) => parts.some((part) => chip(part) === m)),
    other: parts.filter((part) => !chip(part)).join(", "),
  };
}

// Material as chips, several allowed (faster logging, 2026-10-03): tap every
// material that applies; OTHER… opens a field for anything else. Saved as
// one line in the list's order with the others last ("Cotton, Wool,
// Cashmere"), so the database needs no change and details read naturally.
export default function MaterialField({ value, onChange }: MaterialFieldProps) {
  const { chosen, other } = parse(value);
  const [typing, setTyping] = useState(Boolean(other));
  // What's in the OTHER… field exactly as typed (a trailing ", " included,
  // so a second material can follow); the saved line is tidied.
  const [otherText, setOtherText] = useState(other);

  const save = (nextChosen: string[], nextOther: string) => {
    const others = nextOther.split(",").map((part) => part.trim()).filter(Boolean);
    onChange([...MATERIALS.filter((m) => nextChosen.includes(m)), ...others].join(", "));
  };

  return (
    <fieldset>
      <legend className="text-label uppercase">Material</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {MATERIALS.map((material) => {
          const on = chosen.includes(material);
          return (
            <Chip
              key={material}
              chosen={on}
              onClick={() => save(on ? chosen.filter((m) => m !== material) : [...chosen, material], otherText)}
            >
              {material}
            </Chip>
          );
        })}
        <Chip
          chosen={typing}
          onClick={() => {
            // Closing OTHER… also clears what was typed there.
            if (typing) {
              save(chosen, "");
              setOtherText("");
            }
            setTyping(!typing);
          }}
        >
          Other…
        </Chip>
      </div>
      {typing && (
        <div className="mt-4">
          <FormField
            label="Other materials"
            placeholder="e.g. Cashmere, Corduroy"
            autoFocus={!otherText}
            value={otherText}
            onChange={(event) => {
              setOtherText(event.target.value);
              save(chosen, event.target.value);
            }}
          />
        </div>
      )}
    </fieldset>
  );
}

// Size order for the filter's SIZE list (Milestone 18b): letter sizes from
// small to large first (XXS … XXXL; "M-L" sorts with M, "Small" with S),
// then numbered sizes in number order, grouped by their system ("US 9",
// "EU 43"; plain numbers like waists first; "32 × 30" counts as 32), then
// anything else A–Z ("One size").

const letters = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
// Spelled out, as some labels and people write them.
const words: Record<string, string> = {
  "EXTRA SMALL": "XS",
  "X-SMALL": "XS",
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
  "X-LARGE": "XL",
  "EXTRA LARGE": "XL",
  "XX-LARGE": "XXL",
};

type Key = { group: number; system: string; value: number; text: string };

function keyOf(size: string): Key {
  const text = size.trim().toUpperCase();
  const word = Object.keys(words).find((w) => text === w || text.startsWith(`${w} `));
  const letter = letters.indexOf(word ? words[word] : text.split(/[-/\s]/)[0]);
  if (letter >= 0) return { group: 0, system: "", value: letter, text };
  const numbered = text.match(/^([A-Z]{1,3}\s+)?(\d+(?:[.,]\d+)?)/);
  if (numbered) {
    return { group: 1, system: (numbered[1] ?? "").trim(), value: parseFloat(numbered[2].replace(",", ".")), text };
  }
  return { group: 2, system: "", value: 0, text };
}

export function compareSizes(a: string, b: string): number {
  const x = keyOf(a);
  const y = keyOf(b);
  return (
    x.group - y.group ||
    x.system.localeCompare(y.system) ||
    x.value - y.value ||
    x.text.localeCompare(y.text, "en", { numeric: true })
  );
}

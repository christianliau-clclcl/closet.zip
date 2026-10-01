type SwatchProps = {
  hex?: string; // "#rrggbb", or nothing for an empty outline
  className?: string; // size: size-3 beside text, size-4 in the form
};

// A small flat square of a garment's colour (DESIGN.md "Colour swatch").
// The only colour in the interface, and it always comes from the clothes.
// Decorative: the colour's name is always written next to it.
export default function Swatch({ hex, className = "size-3" }: SwatchProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${hex ? "" : "border border-rule"} ${className}`}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  );
}

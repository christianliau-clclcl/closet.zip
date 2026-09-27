import { zoomLevels, type Zoom } from "@/lib/zoom";

type ZoomSliderProps = {
  value: Zoom;
  onChange: (zoom: Zoom) => void;
};

// A minimal three-stop slider: a 1px ink line with a square ink handle.
// It's a native range input, so keyboard, touch and screen readers work.
export default function ZoomSlider({ value, onChange }: ZoomSliderProps) {
  return (
    <label className="flex items-center gap-3 text-label uppercase">
      Zoom
      <input
        type="range"
        min={0}
        max={zoomLevels.length - 1}
        step={1}
        value={zoomLevels.indexOf(value)}
        onChange={(event) => onChange(zoomLevels[Number(event.target.value)])}
        aria-valuetext={value}
        className="h-6 w-20 cursor-pointer appearance-none bg-transparent focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-moz-range-track]:h-px [&::-moz-range-track]:bg-ink [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-ink [&::-webkit-slider-thumb]:-mt-[5.5px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-ink"
      />
    </label>
  );
}

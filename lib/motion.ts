import type { Transition } from "motion/react";

// The app's one motion style (DESIGN.md "Motion"): quick to start, gentle to
// settle. Used for the grid's zoom; reuse it for future animations so
// everything moves the same way.
export const layoutTransition: Transition = {
  duration: 0.4,
  ease: [0.2, 0, 0, 1],
};

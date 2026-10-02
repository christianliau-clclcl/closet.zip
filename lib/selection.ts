"use client";

import { createContext, useContext } from "react";

// SELECT mode (Milestone 12d): which pieces are chosen. Shared through React
// context so every cell (grid, rows, folders) can read it without each view
// passing it along.
export type Selection = {
  active: boolean; // SELECT mode is on: tapping a piece selects it
  selected: ReadonlySet<string>; // piece IDs
  toggle: (id: string) => void;
};

export const SelectionContext = createContext<Selection>({
  active: false,
  selected: new Set(),
  toggle: () => {},
});

export function useSelection(): Selection {
  return useContext(SelectionContext);
}

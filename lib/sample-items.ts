import type { Item } from "@/lib/types";

// A hard-coded sample closet for designing the grid and overlay before
// the database exists (Milestones 2–3). Replaced by real data in Milestone 5.
// PLACEHOLDER: colour, material, acquired, acquiredFrom, price and notes are made up
// for layout testing. Replace them with the real details.
// Some fields are left out on purpose, to test that empty fields are hidden.
export const sampleItems: Item[] = [
  {
    id: "1",
    hero: { src: "/sample/denim-jacket.webp" },
    name: "Denim jacket",
    category: "outerwear",
    brand: "Levi's",
    colour: "Indigo",
    material: "Cotton denim",
    acquired: { month: 3, year: 2021 },
    acquiredFrom: "Vintage shop",
    price: 120,
    notes:
      "Placeholder note. The first piece I bought that I actually wanted to keep for a long time. It has faded exactly where I lean on things, and the cuffs are starting to fray in a way I like.",
    status: "in_closet",
  },
  {
    id: "2",
    hero: { src: "/sample/green-sneakers.png" },
    name: "Jack Purcell leather sneakers",
    category: "shoes",
    brand: "Converse",
    colour: "Green",
    material: "Leather",
    acquired: { month: 6, year: 2023 },
    acquiredFrom: "Online",
    price: 89.5,
    notes: "Placeholder note. Wore these every day one summer.",
    status: "in_closet",
  },
  {
    id: "3",
    hero: { src: "/sample/grey-trousers.png" },
    name: "Pleated trousers",
    category: "bottoms",
    colour: "Charcoal",
    material: "Wool blend",
    acquired: { month: 10, year: 2022 },
    price: 210,
    status: "in_closet",
  },
  {
    id: "4",
    hero: { src: "/sample/beige-jacket.webp" },
    name: "Padded jacket",
    category: "outerwear",
    brand: "Stone Island",
    colour: "Stone",
    material: "Nylon",
    acquired: { month: 11, year: 2024 },
    acquiredFrom: "Gift",
    notes:
      "Placeholder note. A birthday present. Warmer than it looks, and the badge comes off when I want it quieter.",
    status: "in_closet",
  },
  {
    id: "5",
    hero: { src: "/sample/khaki-jeans.webp" },
    name: "Wide jeans",
    category: "bottoms",
    colour: "Khaki",
    acquired: { month: 4, year: 2020 },
    status: "in_closet",
  },
  {
    id: "6",
    hero: { src: "/sample/black-bag.png" },
    name: "Leather shoulder bag",
    category: "accessories",
    colour: "Black",
    material: "Leather",
    acquiredFrom: "Flea market",
    price: 45,
    notes: "Placeholder note. Carries everything, including this laptop.",
    status: "in_closet",
  },
];

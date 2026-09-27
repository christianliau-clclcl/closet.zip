# Closet.zip — Design System

> A quiet archive: garments catalogued like objects in a collection.

Adapted from the Cosmos style reference and `moodboard.png` (with
`notes.md`). Values marked **(proposal)** are starting points for the
designer to confirm or refine in Figma.

## Principles

1. **The clothes are the only colour.** The interface is black, white, cream and
   grey. Any colour on screen comes from garments, including in
   visualizations, which use each item's actual colour.
2. **Catalog, not store.** Items read like entries in an archive: an index
   number, a name, small precise type. No marketing voice.
3. **Two voices:** monospace for catalog data (codes, dates, brands, labels),
   serif for the personal (the user's notes and page titles). Data is
   precise; memories are warm.
4. **Flat and square.** No shadows, no rounded corners. Structure comes from
   thin rules, grid dots and white space.
5. **Uniform cells.** Every item sits in an identical square cell, centred.
   Cells have no surface of their own: background-removed garments float
   directly on the canvas, and grid dots give the structure.

## Colours

| Token            | Value      | Use                                              |
|------------------|------------|--------------------------------------------------|
| `canvas`         | `#f7f5f3`  | Page background (never pure white at page level) |
| `cell`           | `#ffffff`  | Overlay, inputs, drawer (not item cells)         |
| `ink`            | `#0d0d0d`  | Primary text, icons, grid dots (never `#000`)    |
| `stone`          | `#6e6a69`  | Secondary text, metadata values                  |
| `pebble`         | `#9a9796`  | Placeholders, disabled, archived-item labels     |
| `rule`           | `#0d0d0d` at 12% opacity | Dividers, input borders, row lines |
| `scrim`          | `#0d0d0d` at 50% opacity + 12px blur | Behind the detail overlay. 50% keeps both light and dark garments readable on it; the blur turns the grid into soft shapes |

No accent colour. Selected and active states use `ink` (fill or underline).
Archived items are shown with `pebble` labels and reduced image opacity (0.5).

## Typography (proposal)

| Role          | Font                  | Size  | Weight | Case      | Tracking |
|---------------|-----------------------|-------|--------|-----------|----------|
| Label / code  | Geist Mono            | 11px  | 400    | UPPERCASE | 0.04em   |
| Meta / body   | Geist Mono            | 13px  | 400    | Sentence  | 0        |
| UI text       | Geist Mono            | 13px  | 500    | Sentence  | 0        |
| Notes (story) | Fraunces              | 18px  | 350    | Sentence  | -0.01em  |
| Page title    | Fraunces              | 40px  | 350    | Sentence  | -0.03em  |
| Display       | Fraunces              | 64px  | 350    | Sentence  | -0.04em  |

- Both fonts are free on Google Fonts and load through Next.js `next/font`.
- Fraunces stands in for Cosmos's cosmosOracle: a soft serif used at light
  weight. Never bold display type above 400.
- Line height: 1.5 for mono and notes, 1.05 for titles and display.
- Minimum text size is 11px, and only for uppercase labels.

## Spacing & layout

- Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 80.
- Page margins: 16px mobile, 32px desktop. The grid runs full width (no max
  width), like a catalog sheet.
- Gap between grid cells: 8px of canvas. (Decided 2026-09-26 after testing
  1px `rule` lines against dots on real garments: dots won.)
- Border radius: 0 everywhere.
- Elevation: none. Layering is shown by `cell` on `canvas`, plus the scrim.

## Grid & zoom levels (proposal)

| Level  | Desktop columns | Mobile columns | Cell padding | Labels shown          |
|--------|-----------------|----------------|--------------|-----------------------|
| Small  | 10              | 4              | 8px          | None (hover: code)    |
| Medium | 6               | 3              | 16px         | Index code            |
| Large  | 3               | 1              | 48px         | Index code + name     |

- Cells are square. Images use `object-fit: contain` so nothing is cropped.
- Grid dots: a 3px `ink` dot at the top-left corner of each cell.

## Index codes (proposal)

Each item gets a catalog code from its category and order of entry, shown in
mono under the image:

`TP-012` tops · `BT-004` bottoms · `OW-007` outerwear · `SH-003` shoes ·
`AC-015` accessories · `XX-001` uncategorized

Codes are assigned automatically and never reused, even if an item is archived.

## Components

**Top bar.** A single thin row: `CLOSET.ZIP` wordmark left (mono, 11px,
uppercase); view switcher centre (Grid · Rows · Colour · Time · Archive); zoom
toggle, filter and add on the right. Text only, no pill, no background. A
`rule` line underneath.

**Item cell.** Square and transparent (no surface; the garment sits on the
canvas), a grid dot at the top-left, image centred with contained fit, index
code below the image inside the cell in mono 11px. Hover (desktop): name and brand appear under the code
in `stone`. Tap (touch): opens the overlay.

**Zoom toggle.** Three small square icons (dense, medium, large grid) or a
minimal slider. The active state is `ink`; inactive states are `pebble`.

**Category row.** Section heading in mono 11px uppercase with a count
(`OUTERWEAR — 07`), a `rule` line, then one horizontal scrolling row of cells.
Scroll snaps to cells.

**Filter drawer.** Slides in from the right over the grid on `cell`. Sections
(Sort, Category, Colour, Brand) with mono headings. Options are checkbox rows
separated by `rule` lines. Colour options show a small filled dot of that
colour next to the name. A full-width `ink` button at the bottom: "Show 24
items".

**Detail overlay.** A layer over the closet, not a separate page: the grid
stays visible behind, darkened and blurred by the scrim. Desktop: the garment
floats large on the left directly on the scrim (no panel behind it; detail
photo dots below it once detail photos exist), and a `canvas` panel on the
right holds the index code, the name in Fraunces, then a Details section and a
Notes section. Mobile: no scrim; a full-screen `canvas` page with the garment
on top and the details below, scrolling together.
Details are a two-column list of mono label / value pairs separated by `rule`
lines; empty fields and empty sections are hidden. The user's notes sit
underneath in Fraunces, set apart from the data. Close with ✕, Esc, Back, or
clicking the scrim or the space around the garment.

**Buttons.** Primary: `ink` fill, `cell` text, mono 13px 500, 12px × 20px
padding, square. Secondary: transparent with a 1px `ink` border. Tertiary:
text only with an underline on hover.

**Inputs.** `cell` fill, 1px `rule` border, square, mono 13px. The label
sits above in mono 11px uppercase. Focus: border becomes `ink`.

**Empty state.** Centred on the canvas: a Fraunces title ("Your archive is
empty"), one line of mono text, and a primary "Add your first piece" button.

## Visualizations

- Monochrome axes, labels and gridlines in `ink`, `stone` and `rule`.
- Data marks use each item's own colour, or its image.
- **Style over time** (first visualization): a horizontal timeline by
  month and year acquired. Items stack as small cells above their month,
  so the chart is made of the clothes themselves.

## Do's and don'ts

**Do**
- Keep all interface colour within the token list.
- Give every item cell identical size and padding.
- Use mono for anything that is data, serif for anything personal.
- Leave generous white space around objects, especially at the large zoom level.

**Don't**
- Add shadows, gradients or rounded corners.
- Add accent colours to buttons, links or states.
- Crop garment images. Always contain them within the cell.
- Show models, scenes or lifestyle imagery in the interface.

## Tailwind v4 theme

```css
@theme {
  --color-canvas: #f7f5f3;
  --color-cell: #ffffff;
  --color-ink: #0d0d0d;
  --color-stone: #6e6a69;
  --color-pebble: #9a9796;
  --color-rule: rgb(13 13 13 / 0.12);
  --color-scrim: rgb(13 13 13 / 0.5);

  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
  --font-serif: var(--font-fraunces), Georgia, serif;

  --text-label: 11px;
  --text-meta: 13px;
  --text-notes: 18px;
  --text-title: 40px;
  --text-display: 64px;

  --radius-none: 0px;
}
```

# Closet.zip — Design System

> A quiet archive: garments catalogued like objects in a collection.

Adapted from the Cosmos style reference and `moodboard.png` (with
`notes.md`). Values marked **(proposal)** are starting points for the
designer to confirm or refine in Figma.

## Principles

1. **The clothes are the only colour.** The interface is black, white, cream and
   grey. Any colour on screen comes from garments, including in
   visualizations, which use each item's actual colour.
2. **Catalog, not store.** Items read like entries in an archive: a name,
   small precise type, details on request. No marketing voice.
3. **Two voices:** monospace for catalog data (dates, brands, labels),
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
| `pebble`         | `#9a9796`  | Disabled only (too faint for text people need to read: 2.9:1 on `cell`) |
| `rule`           | `#0d0d0d` at 12% opacity | Dividers, input borders, row lines |
| `scrim`          | `#0d0d0d` at 50% opacity + 12px blur | Behind the detail overlay. 50% keeps both light and dark garments readable on it; the blur turns the grid into soft shapes |

No accent colour. Selected and active states use `ink` (fill or underline);
inactive options (tabs, toggles) use `stone`, because `pebble` on `canvas` is
too faint to read. Keyboard focus is a 1px `ink` outline on every interactive
element (never the browser's default colour). Error messages are `ink` mono text placed just above the
action they relate to, with no colour of their own.
Archived items live in their own ARCHIVE view, shown normally (no fading);
their hover label adds how and when they left.

## Typography (proposal)

| Role          | Font                  | Size  | Weight | Case      | Tracking |
|---------------|-----------------------|-------|--------|-----------|----------|
| Label         | Geist Mono            | 11px  | 400    | UPPERCASE | 0.04em   |
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

## Grid & zoom levels

| Level  | Desktop columns | Mobile columns | Cell padding | Under the garment |
|--------|-----------------|----------------|--------------|-------------------|
| Small  | 10              | 4              | 8px          | Nothing           |
| Medium | 6               | 3              | 16px         | Nothing           |
| Large  | 3               | 1              | 48px         | Name              |

- Cells are square. Images use `object-fit: contain` so nothing is cropped.
- Grid dots: a 3px `ink` dot at the top-left corner of each cell.

## Item labels

Decided 2026-09-30: items have no index codes or numbers. The grid shows only
the garments (plus the name at Large), so every row is evenly spaced. Details
appear in a small **hover label** beside the pointer (see Components):
"Levi's | 2021", from the item's own brand and year, or its name when it has
neither. (Decided 2026-10-01; it replaced a caption fixed at the bottom-left
of the screen.) On touch screens there's no label; tapping opens the overlay.
Screen readers get the full line "Denim jacket · Levi's · 2021" as each
cell's label. When an item needs a title (alt
text, screen readers), use its name, else its category, else "Untitled piece".

## Motion

- One motion style for the whole app, in `lib/motion.ts`: 0.4s, easing
  `cubic-bezier(0.2, 0, 0, 1)` (quick to start, gentle to settle).
- Movement explains a change of layout; it's never decoration. First use:
  changing the zoom level glides each garment to its new place and size.
  Second: in the overlay, photos slide in from the side you're moving
  towards (swipe, ← →, or dots), like a strip of film.
  Third: photos fade in once loaded (opacity only), in the grid and the
  overlay, instead of popping in.
- Respect "Reduce motion": anyone with it switched on gets instant changes.

## Components

**Top bar.** A single thin row: `CLOSET.ZIP` wordmark left (mono, 11px,
uppercase); view switcher centre (Grid · Rows · Colour · Time · Archive); zoom
toggle, filter and add on the right. Text only, no pill, no background. A
`rule` line underneath.

**View bar.** A second thin row under the top bar, same type as the top bar
(mono 11px uppercase): the tabs **ALL · FOLDERS** on the left (FOR SALE joins
with Milestone 16), active in `ink` with an underline, others in `stone`.
Desktop, on the right: search · **SORT BY** · SELECT · ARRANGE. A `rule`
line underneath. An empty view shows one `stone` line, centred.

**SORT BY** (friend feedback, 2026-10-02). One panel for how you look at the
closet: the arrangements, each also choosing a layout: My order, Newest
added, Price and Colour gradient are a grid; Timeline is the timeline (with
ORDER · NEWEST / OLDEST); Type (was ROWS), Colour and Brand are shelves:
per category, per colour family (gradient order, each heading led by the
family's swatch averaged from your pieces: "■ BLACK — 04") and per brand
(A–Z, "levi's" and "Levi's" as one); pieces without one come last. Then FILTER → (the drawer), ARCHIVED · OFF / ON (archived pieces are
hidden everywhere unless on, folders included), and on phones ZOOM. The
button names a non-default choice ("SORT BY · BRAND" on desktop, just
"BRAND" on phones) plus "· N" for filters and archived pieces shown.
Desktop: a 256px dropdown under the button; phones: opens upwards.
Timeline hides SELECT and ARRANGE.

**Phones: top bar, menu and bottom bar** (2026-10-02). Below 768px the top
bar holds the closet's name and **MENU**. The view bar holds only the tabs.
A **bottom bar** is fixed to the bottom of the screen: `canvas`, a `rule`
line on top, the same 11px labels, 16px apart: **SORT BY · SEARCH · SELECT
· ARRANGE** on the left, **+ ADD** on the right. In SELECT mode the bar
becomes the action bar. Pages leave 80px at the bottom so the bar never
covers the last row, plus the iPhone home-indicator area.

**SELECT mode** (Milestone 12d, 2026-10-02; your own closet only). SELECT
sits after SORT · FILTER (after VIEW on phones). While on, tapping a piece selects it instead of
opening it, and every piece shows a 12px square at its top-right: a 1px
`ink` outline, filled `ink` when selected. The bar (view bar on desktop,
bottom bar on phones) becomes "3 SELECTED · ADD TO FOLDER · REMOVE · DONE";
REMOVE only inside a folder. ADD TO FOLDER opens a list of folders (indented
by depth, + NEW FOLDER at the end; 256px wide, scrolls past 320px). After an
action the mode ends and the bar says what happened for 4 seconds
("3 PIECES ADDED TO GRAILS").

**ARRANGE mode** (Milestone 12g, 2026-10-02). ARRANGE sits after SELECT (in
ALL and inside folders, when there are 2+ pieces). The grid shows every
piece of the view in My order, with a `stone` line of instructions above
and ← → under each piece; the bar reads "ARRANGE · CANCEL · DONE". Pieces
glide into place with the app's motion style (instant with Reduce motion).
After DONE the bar says "ORDER SAVED".

**Search** (2026-10-02). A quiet field with no box: a `rule` line under it
that turns `ink` while typing, placeholder "Search" in `stone`. Desktop: in
the view bar before SORT, 192px wide. Phones: SEARCH in the bottom bar opens
the field across the bar with DONE; while a search is on, the button shows
the query in quotes ("DENIM", cut with … past 80px). Filters live as you
type; Esc clears. No matches: "Nothing matches "denim"." with CLEAR SEARCH.
The phone bottom bar's items are 16px apart (was 24px) to fit.

**Item cell.** Square and transparent (no surface; the garment sits on the
canvas), a grid dot at the top-left, image centred with contained fit, and
the name under the image at Large zoom only. Hover or keyboard focus shows the
item in the hover label. Tap (touch): opens the overlay.

**Hover label.** One square label, mono 13px `canvas` on `ink` (flipped
2026-10-01 so it stands out over garments and the canvas), 8px × 4px
padding, no border, 320px wide at most (cut off with …). It sits 16px below
and right of the pointer, flipping to the other side near the screen's edges.
With keyboard focus it hangs under the focused cell's bottom-left corner
instead. Only on devices that can hover.

**Zoom toggle.** A minimal three-stop slider labelled "ZOOM": a 1px `ink`
line with a 12px square `ink` handle.

**Category row.** Section heading in mono 11px uppercase with a count
(`OUTERWEAR — 07`), a `rule` line, then one horizontal scrolling row of cells.
Scroll snaps to cells.

**Filter drawer.** Slides in from the right over the grid on `cell`. Sections
(Sort, Category, Colour, Brand) with mono headings. Options are checkbox rows
separated by `rule` lines. Colour options are families (see Colour swatch).
A full-width `ink` button at the bottom: "Show 24
items". Built (Milestone 9a): sections
Category · Brand · Size · Colour, options taken from the person's own pieces
with a count each; "or" within a section, "and" across; CLEAR ALL above the
button; slides in with the app's motion style; scrim behind. On phones it's a
full-screen `cell` page with no scrim (decided 2026-10-01). **Sort** is a small list under SORT in the
view bar (Newest added · Date acquired · Brand A–Z · Price), not in the drawer;
the bar reads "SORT · BRAND" / "FILTER · 2" while they're in use.

**Detail overlay.** A layer over the closet, not a separate page: the grid
stays visible behind, darkened and blurred by the scrim. Desktop: the garment
floats large on the left directly on the scrim (no panel behind it), with
small dots below it showing which photo is on screen and, with several
photos, ← → buttons either side of it: 32px square `canvas` buttons with an
`ink` arrow, like the ✕ (decided 2026-10-01; phones keep dots and swipe), and a `canvas` panel on the
right holds the name in Fraunces, then a Details section and a
Notes section. Mobile: no scrim; a full-screen `canvas` page with the garment
on top and the details below, scrolling together.
Details are a two-column list of mono label / value pairs separated by `rule`
lines; empty fields and empty sections are hidden. The user's notes sit
underneath in Fraunces, set apart from the data. Close with ✕, Esc, Back, or
clicking the scrim or the space around the garment.

**Folders view.** A path row above the grid in label style:
"FOLDERS / SEASONS / SUMMER", earlier parts `stone` (click to go up), the
current one `ink`; + NEW FOLDER and (inside a folder) EDIT on the right as
text actions. Both open the **folder modal**: a header bar ("NEW FOLDER" /
"EDIT FOLDER", ✕), NAME, INSIDE (a dropdown styled like the month field:
"Folders (top level)" then the folders, indented), COVER (BOX · IMAGE · PIECE as text options, a
128px preview square underneath, "Choose image" or a 4-column grid of the
folder's pieces), DELETE FOLDER (`stone`, with the usual confirm) when
editing, and a full-width primary button. Phones: a full-screen `cell` page
like the filter drawer; desktop: a 384px panel centred over the scrim.
**Folder cell:** the same square as an item cell, the cover inside the zoom
level's padding, and the label "GRAILS — 07" always underneath across the
cell's full width; a long name is cut with … but the count always shows.
**Box icon:** the default cover, a lidded storage box in 1px `ink` lines
(`BoxIcon`, a placeholder for the designer's own drawing).

**Colour swatch.** A small flat square of a garment's own colour (decided
2026-10-01: square, not a dot), always next to the colour's name: 12px
beside text (overlay details, filter drawer), 16px inside the Colour field
on Add/Edit, where an empty swatch is a `rule` outline. The filter drawer's
Colour section lists families (Red … Pink, Beige & brown, White, Grey,
Black, in gradient order); each family's swatch is the average of the
person's own pieces in it, so no colour is invented. In the overlay, a
piece with a colour but no name shows its family's name.

**Buttons.** Primary: `ink` fill, `cell` text, mono 13px 500, 12px × 20px
padding, square. Secondary: transparent with a 1px `ink` border. Tertiary:
text only with an underline on hover.

**Inputs.** `cell` fill, 1px `rule` border, square, mono 13px. The label
sits above in mono 11px uppercase. Focus: border becomes `ink`.

**Getting photos in** (2026-10-02). Wherever a photo is chosen (the Add
page square, the Edit page's Add photo tile, a folder's IMAGE cover): tap to
choose, drop a file on it (desktop), paste with ⌘V, or tap **PASTE** (a
text action, shown only where the browser can read clipboard images; on
iPhone the system asks first). Pairs well with iPhone's Copy Subject, which
copies a background-removed PNG. Desktop shows a quiet `stone` hint: "or
drop it here, or paste (⌘V)".

**Closet name** (2026-10-02). Logged in, the top bar's left shows the
closet's name instead of `CLOSET.ZIP` (same label style, cut with … if
long), on the closet, Add and Edit. MENU (now on desktop too: zoom · ADD ·
MENU) holds "Name your closet" / "Rename closet" and LOG OUT; naming opens a
small modal like the folder one, with "12 of 30" under the field. Sign-up
has an optional CLOSET NAME field first ("e.g. Sam’s Closet"; "Optional.
You can name it later from the menu.").

**Logged-out home** (2026-10-02). The top bar with only `CLOSET.ZIP`, then,
centred on the page, one `stone` line ("A private archive of the clothes
you own, and have owned.") 48px above the log in / sign up form below. No
demo closet.

**Log in / sign up.** One page, a single centred column (full width on phones,
384px on desktop). A "LOG IN · SIGN UP" text switch (active `ink` with an
underline, inactive `stone`), a Fraunces title ("Welcome back" / "Start your
archive"), email and password inputs (password has a SHOW / HIDE text toggle
at the label's right), and a full-width primary button. Sign-up success
replaces the form with "Check your email".

**Empty state.** Centred on the canvas: a Fraunces title ("Your archive is
empty"), one line of mono text, and a primary "Add your first piece" button.

## Visualizations

- Monochrome axes, labels and gridlines in `ink`, `stone` and `rule`.
- Data marks use each item's own colour, or its image.
- **Style over time** (first visualization): a horizontal timeline by
  month and year acquired. Items stack as small cells above their month,
  so the chart is made of the clothes themselves. Built (13a, 2026-10-02):
  SORT BY · Timeline (was the TIME view); one slot per month in real time (empty months too), each
  as wide as a piece (32/48/192px by zoom; Large is big on purpose so the
  timeline clearly runs off the edge, 2026-10-02), pieces stacked upwards with 4px
  between and 4px above the axis (24px at Large); a continuous 1px `ink` axis, a 4px `rule` tick per month and an
  8px `ink` tick plus the year (label style) where each year starts, both
  at the slot's left edge; a year-only slot before January when needed;
  "N.D." after a 48px gap at the end. Scrolls sideways, opening at the most
  recent end. FILTER and search work; SELECT and ARRANGE are hidden.
  Phones (13b): the axis is a vertical 1px `ink` line down the left side,
  newest at the top. Each month is a row: a 8px `rule` tick (12px `ink`
  where a year starts, with the year in a 48px column left of the line),
  then for months with pieces the short month name in `stone` ("JUN") and
  the pieces in a row that wraps, evenly stepped by zoom (2026-10-02):
  Small 48px, Medium half the width beside the line (two per row), Large
  the full width (one per row). Empty months are 12px rows. "N.D." at
  the bottom after a 48px gap.
  Long gaps (13d): more than 6 empty months become one break: on desktop
  the axis pauses at `//` (`ink`, label size) with the length underneath
  in `stone` ("4 YRS 11 MOS"), just as wide as that label plus 8px each
  side; on phones a 24px row where the line pauses, with `//` on the line
  and the length beside it. The month after a break always shows its year.
  Order: newest first by default on both (most recent at the left on
  desktop, at the top on phones); the year is labelled on the first month
  of each year in reading order. ORDER · NEWEST / OLDEST reverses it
  (in the SORT BY panel when Timeline is chosen). The
  timeline always opens at the most recent end.
  ARCHIVED · ON / OFF (13c) is now part of SORT BY and works everywhere
  (off by default).

**OVERVIEW** (Milestone 14, 2026-10-02): a tab of summaries for what you
own now, one section each, made of the garments in plain grids. No tools in
the bar. **By colour** (14a): one group per colour name typed for the
pieces, most pieces first: a heading like a shelf ("■ BLACK — 02", the
swatch averaged from the group's detected colours), then the pieces in the
usual grid (same cells and zoom). Pieces without a colour name last.

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

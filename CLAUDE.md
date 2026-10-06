@AGENTS.md

# Closet.zip — Instructions for Claude

A web app for archiving your clothing: a photo of each piece plus optional
details and personal notes, shown in a minimal, gallery-like grid. The full
product brief, user flows, and roadmap live in `PRODUCT.md`. Read it before
planning any new feature.

## How to work with me

I'm a product designer learning to code. This is a portfolio project and a
learning project, so understanding matters as much as shipping.

- Explain what you're about to do and why, in plain language, before doing it.
- Before running any terminal command, tell me what it does in one sentence.
- Work in small steps. One feature or change at a time, then stop so I can test.
- When a step works, remind me to commit and suggest a short commit message.
- If a request is ambiguous or conflicts with PRODUCT.md, ask me before guessing.
- Don't add new libraries or services without asking and explaining the tradeoff.
- When something breaks, explain the cause, not just the fix.
- Point out when you're making a design decision (layout, wording, interaction)
  so I can weigh in. Design choices are mine to make.

## Tech stack

- Next.js (App Router) with TypeScript
- Tailwind CSS for styling
- Supabase: Postgres database, Auth, and Storage (for item photos)
- GitHub for version control, Vercel for hosting (auto-deploys from `main`)

## Rules

### Data & security
- Secrets live in `.env.local` only. Never hardcode keys or commit that file.
  If a new env variable is needed, remind me to also add it in Vercel.
- Every closet is private unless its owner turns PUBLIC on. Every Supabase
  table and storage bucket keeps owner-only Row Level Security, so users can
  only read and write their own data. Visitors read a public closet only
  through security-definer functions that return non-hidden pieces and
  folders and catalogue fields (never price, where from or notes), plus a
  storage rule for those pieces' photos (Milestone 15c). Explain any policy
  you write.
- Database changes go through migration files so they're tracked in git.
- Photos live in their own table (item, storage path, order, is-hero), so an
  item can have many photos. Only the hero photo is required.
- All other item fields are optional. The UI must handle missing values
  gracefully (no "undefined", no broken layouts, empty fields hidden).
  One exception (decided 2026-10-05): listing a piece for sale requires its
  size label and every measurement row for its category, plus an asking
  price and condition (`missingForListing` in `lib/listing.ts`).
- Dates acquired and archived are stored as month and year, not full dates.
- Archiving an item changes its status; it never deletes the item.

### Images
- Resize and compress images in the browser before uploading.
- Preserve transparency: users upload background-removed PNGs, so never
  convert to a format that drops the transparent background.
- Grid cards are uniform in size and shape regardless of the photo inside.

### Interface
- Design mobile-first; most photos will be added from a phone.
- Anything shown on hover must have a touch equivalent. On touch screens,
  tapping an item opens its detail overlay.
- Accessibility basics: labelled form inputs, alt text on images, keyboard
  navigation (including opening and closing the overlay), readable contrast.
- Never invent new colours or spacing values. Use existing design tokens or
  ask me.

### Code organization
- Keep components small and in `/components`, one per file, named in
  PascalCase.

## Design sources

- Design system: `DESIGN.md`. Read it before building or styling any UI.
- Inspiration: `moodboard.png` in the project root (local only, kept out of
  git because it contains other brands' screenshots). Read `notes.md` for what
  to take from each image, and never copy a reference's whole layout.
- Design tokens live in the Tailwind theme, set up from `DESIGN.md`. The
  Tailwind theme is the source of truth once it exists.
- Figma (via MCP): early explorations and tokens. I'll paste frame links.
- Paper (via MCP): refining screens. Treat canvas comments as change requests.

## Commands

- `npm run dev`: run locally at http://localhost:3000
- `npm run build`: check the app builds before pushing
- `npm run lint`: check for code issues

## Current status

Update this section at the end of each working session.

- Current milestone: 15 — public profiles (15a, 15b done 2026-10-03; 15c
  the public door done 2026-10-05: `public_profile`, `public_items`,
  `public_folders`, `is_public_photo` + storage rule; helpers
  `public_owner`, `visible_folder_ids` not callable from the app. Next 15d,
  the /@username page, via a /u/[username] rewrite since @ folders clash
  with parallel routes; noindex). 15¼ new categories (`lib/categories.ts`)
  and 15½ onboarding (/welcome, 3 steps, MENU → Closet setup) done
  2026-10-05; research in `research/competitor-scan.md`. Paused for
  the day while the user gathers more feedback. Also queued: 15¼ new
  category list (13 flat categories replacing the five; ask where existing
  pieces move) and 15½ onboarding (mockups on the "Onboarding
  explorations" design canvas; step 3 depends on 15¼). Still to try on a
  real phone: arranging by touch (12g), PASTE with Copy Subject, the
  sign-up closet name field, saving a username.
- 2026-10-03: 15a usernames + PUBLIC (`profiles.username`,
  `profiles.is_public`, `username_available` function, `lib/usernames.ts`,
  `PublicProfileModal` from MENU). 15b hiding (`items.is_hidden`,
  `folders.is_hidden`; `ItemPublic` SHOWN · HIDDEN in details, the same
  chips in `FolderModal`, HIDE/SHOW in `SelectActions`, `HiddenIcon` on
  cells; `lib/hiding-client.ts`). + ADD is a filled chip (`chipClass`).
  OVERVIEW tab removed (bar is ALL · FOLDERS; ?view=overview → Colour
  shelves). Second friend-feedback round shipped faster logging (chips for
  category, material, acquired; usual size fills in).
  Accessibility check: `scripts/a11y-audit.js` (paste into the browser on
  any page or open panel; 18a found no problems across 17 views, keyboard
  and Reduce motion checked by hand). Run it after building new screens.
  Gotcha: don't run Prettier on whole files; the code isn't
  Prettier-formatted, so it rewrites far more than the edit.
- Milestone 14 done (2026-10-02): OVERVIEW tab (ALL · FOLDERS · OVERVIEW;
  `Overview`, `lib/overview.ts`): By colour (grouped by the colour names
  typed, wrapping grids) and Brands (most-owned first). A colour-strip
  palette was tried and dropped. Spending (14b) is parked, unmerged, on the
  local branch `shelved/spending` until the user asks for it; price stays
  everywhere else.
- Friend feedback round done (2026-10-02, PRODUCT.md "13½"): logged-out
  home is one line + the log in form (demo closet removed); search
  (`lib/search.ts`, `SearchField`, ?q=); closet name (user metadata
  `closet_name`, `lib/closet-name.ts`, `ClosetNameModal`, shown by `TopBar`,
  MENU on desktop too via `TopMenu`); SORT BY (`SortByMenu`) replacing the
  view tabs ROWS/TIME/ARCHIVE: sorts pick layouts (`layoutOf`: grid,
  timeline, shelves via `Shelves` + `lib/shelves.ts`), ARCHIVED · ON/OFF
  everywhere (?archived=show), old links upgraded (`upgradeOldAddress`).
  Also: drag/drop + paste photos (`lib/clipboard.ts`, `PasteButton`). Roadmap changed 2026-10-01: sharing,
  selling, styling/outfits, more visualizations and folders inside folders
  come before friend testing (now 19). See PRODUCT.md roadmap.
- Milestone 9a done (2026-10-01, live, tested on phone): view bar
  (`ViewBar`, `lib/views.ts`) with ALL · ROWS · ARCHIVE; archived pieces only
  in ARCHIVE; ROWS = category shelves (`CategoryRows`); SORT list
  (`SortMenu`) and FILTER drawer (`FilterDrawer`), logic in
  `lib/sort-filter.ts`. View, sort and filters live in the address
  (`withParams`), so Back, reload and links keep them.
- Milestone 8 done (2026-10-01, live, tested on phone): size label and
  garment measurements per piece (`items.size_label`, `items.measurements`
  jsonb in cm; rows by category in `lib/measurements.ts`). Unit per person in
  the new `profiles` table (default inches; owner-only RLS, tested), CM · IN
  switch on Add/Edit and in the overlay, fractions in inches. Untouched values
  keep their stored cm (no rounding drift).
- Milestone 7 done (2026-10-01, live): detail photos. Edit page "Photos"
  (`PhotoManager`): add (up to 8), remove (with confirm), reorder by drag
  (`motion` Reorder; kept on for touch too) or ← →, "Make cover"; the first
  photo is the cover. Order saved in one transaction via the
  `reorder_item_photos` database function (tested). Overlay: bare dots,
  swipe on phones, ← → keys (`PhotoViewer`). Smooth zoom: grid cells use
  motion `layout` (timing in `lib/motion.ts`, DESIGN.md "Motion").
- Milestone 6 done (2026-10-01, live, tested on phone and Mac): overlay
  actions for your own items (`ItemActions`): EDIT → `/items/<id>/edit`
  (same fields as Add); ARCHIVE in-panel form (left month/year + optional
  how: `left_via`), UN-ARCHIVE; DELETE with in-panel confirm, removes photo
  files too. Archived items are faded and sorted last until Milestone 8.
  Bug fixed: `md:flex` on the closed `<dialog>` made it an invisible
  full-screen cover on desktop (use `md:open:flex`). When testing clicks,
  check `document.elementFromPoint` at the click point, not just
  `element.click()`.
  If the browser pane is hidden it doesn't draw frames, so React effects
  (e.g. opening the overlay) wait until a screenshot forces one.
- Milestone 5 done (2026-10-01, live, tested on phone): `/add` page with
  photo picker (resized in the browser to 1600px + 600px thumbnail, WebP or
  PNG, transparency kept) and all optional details (`ItemDetailsFields`,
  reusable for editing; validation in `lib/item-draft.ts`; brand
  suggestions). Grid reads real items for logged-in users (`lib/items.ts`,
  signed photo links, thumbnails in the grid), empty state when there are
  none. Item labels: no index codes;
  hover caption "name · brand · year" (DESIGN.md "Item labels").
- Milestone 4 done (2026-09-30, live): email + password auth with
  `@supabase/ssr`. One `/login` page (log in / sign up switch), email
  confirmation via `/auth/confirm`, log out in the top bar, password reset
  (`/forgot-password` → email → `/reset-password`). `proxy.ts` refreshes the
  session. Logged out, the home page shows one line and the log in / sign
  up form (2026-10-02; the demo closet was removed).
- Milestone 3 done (2026-09-27): detail overlay (view only). Opens via
  `?item=<id>` so Back closes it and links work. Desktop: grid behind with
  scrim (ink 50% + 12px blur), garment floating left, canvas panel right with
  Details and Notes. Phone: full-screen canvas page, no scrim. Price in $.
- Milestone 2 done: grid of floating garments with dots (no cell surface),
  three-stop zoom slider (`lib/zoom.ts`), hover/focus reveals name and brand
  (space reserved only on hover-capable devices).
- Milestone 1 done (2026-09-26): Next.js 16 app with DESIGN.md tokens in
  `app/globals.css` (Tailwind's default colours, radii and shadows switched
  off), GitHub repo (christianliau-clclcl/closet.zip), Supabase project
  connected (URL and publishable key in `.env.local` and Vercel). Live at
  https://closet-zip.vercel.app
- Known issues: `README.md` is still the create-next-app boilerplate; favicon
  is a placeholder (`app/icon.svg`, no `apple-icon` yet); ESLint 9
  deprecation warning comes from the Next.js template.
  Input borders (`rule`, 1.3:1) are below WCAG's 3:1 for field boundaries:
  a deliberate exception, the user's call (2026-10-06, after comparing it
  with `stone`); labels above, the white fill and the ink focus border mark
  each field. Don't "fix" it without asking. Auth emails use Supabase's default templates
  and built-in sender (editing them needs custom SMTP: an email service plus
  an owned domain). Consequences: generic wording, a low hourly email limit,
  and links must be opened in the same browser that requested them. Revisit
  with a custom domain (Polish milestone or earlier). Supabase's advisors
  warn "leaked password protection disabled"; it's a paid-plan feature, left
  off for now.
- Database: migrations in `supabase/migrations/`, applied with
  `npx supabase db push` (CLI linked to project athpbuqlqkvqreuinpvq).
  Tables `items` and `item_photos` with owner-only RLS; private storage
  bucket `item-photos` (WebP/PNG, 5MB max), files at
  `<user id>/<item id>/<photo id>.<ext>`, owner-folder-only RLS. Both tested
  with rolled-back SQL as two users and a logged-out visitor.
  Testing a migration before applying it (no Docker here): one `do` block
  that `execute`s the migration, creates test users in `auth.users`,
  switches with `set_config('request.jwt.claims', …)` + `set local role
  authenticated|anon`, records results, and ends with `raise exception`
  so everything rolls back; run with `npx supabase db query --linked -f
  file.sql` and read the results from the error message.
- Folders (12a, 2026-10-01): tables `folders` (parent_id, cover_item_id,
  cover_path, position) and `folder_items` (position), `items.sort_position`;
  "same owner" enforced by (id, user_id) foreign keys; loop check trigger
  `prevent_folder_loops`. 20 rolled-back checks passed before applying.
- Supabase Auth settings (2026-09-30): Confirm email on, minimum password 8,
  Site URL https://closet-zip.vercel.app, redirect URLs
  http://localhost:3000/** and https://closet-zip.vercel.app/**.
- Milestone 13 done (2026-10-02, style over time): TIME view
  (`lib/timeline.ts` slots in real time, year-only slot before January,
  "N.D." at the end; `TimeView`: horizontal on desktop opening at the
  recent end, vertical down the left on phones, newest first). ARCHIVED ·
  ON/OFF (?archived=hide). No SORT/SELECT/ARRANGE in TIME; FILTER works.
- Milestone 12 done (2026-10-02, folders & Arrange; details in PRODUCT.md
  roadmap 12a–12g). Folders view (`FolderView`, `FolderCell`, `FolderModal`
  with name, INSIDE, cover BOX · IMAGE · PIECE, delete), folders from a
  piece's details (`ItemFolders`, `FolderChecklist`), SELECT mode
  (`lib/selection.ts`, `SelectActions`, `FolderPicker`), ARRANGE
  (`ArrangeGrid`, `arrange_items`/`arrange_folder`), My order sort. Phone
  layout: MENU (log out) on top, bottom bar VIEW (`ViewMenu`: sort, filter,
  zoom) · SELECT · ARRANGE · + ADD. Shared `usePopover` for small panels.
  Gotcha: sibling components with the same React `key` (e.g. two using
  item.id) duplicate on every refresh; give each its own key.
- Milestone 11 done (2026-10-01, colour; details in PRODUCT.md roadmap):
  `items.colour_hex` ("#rrggbb", checked by the database) beside the typed
  colour name. `lib/colour.ts`: detection (most common colour among
  non-transparent pixels, preferring a real colour when ≥15% of the garment
  has one), eyedropper sampling, families (`colourFamily`, gradient order
  in `families`), `averageColour`. `ColourField` (swatch + name, PICK FROM
  PHOTO / DETECT AGAIN / CLEAR), `Swatch` (12px by text, 16px in the form),
  filter drawer by family, SORT · Colour, background backfill
  (`lib/colour-backfill.ts`). Photos with a background detect badly; the
  eyedropper fixes it. Supabase signed photo links allow reading pixels
  (crossOrigin "anonymous"). TypeScript scratch tests run with
  `JITI_ALIAS='{"@/":"<repo>/"}' npx jiti file.ts` (jiti comes with
  Tailwind; no test framework installed).
  Hover label flipped to `canvas` on `ink` (user's request).
- Milestone 10 done (2026-10-01, polish pass): on-brand `app/not-found.tsx`
  and `app/error.tsx` (shared `StatusPage`; Next 16 error prop is `retry`,
  not `reset`); page titles via the layout template "%s · Closet.zip";
  placeholder favicon `app/icon.svg` (the user will design the real one);
  filter drawer full screen on phones; `HoverLabel` beside the pointer
  ("brand | year", square, max 320px; under the cell for keyboard focus)
  replaced the bottom-left caption; overlay photos slide in the direction
  you move (`PhotoViewer`); desktop ← → buttons beside the garment, dots
  kept; clicking the empty margin around the garment closes the overlay
  (`onPhotoMargin`); demo notes without placeholder labels; photos fade in
  once loaded (`FadeImage`, CSS opacity, Reduce motion respected).
  Accessibility check by hand (2026-10-01): keyboard order, labels, alt
  text and Reduce motion all fine; placeholders and phone photo dots moved
  from `pebble` to `stone` for contrast (`pebble` is now for disabled states
  only); photo reordering now respects Reduce motion. Testing tip: the
  browser pane's clicks land wrong when an emulated size is scaled to fit;
  use a size that fits the pane, or check with `elementFromPoint`.
  Moved to Milestone 18: a few lines around the log in form on the
  logged-out home page (was an intro above the demo closet). The user's points:
  everything at a glance (capsule wardrobe, styling project), sort your way
  (brand, colour, year, category, folders), private (share only if you
  want), sell from your closet (e-transfer + contact, no money through the
  app). Only describe what's built when it ships.
  Moved to Milestone 19: friend testing and the Google Form feedback link
  (build hidden until the user sends the form's address). Workshop the
  tester note with the user (draft written in chat: getting started,
  background removal tips, archive vs delete, IN/CM, emails are slow).
- Later: previous/next item arrows in the overlay; clothing-size order in
  filters (XS, S, M…).

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
- Every closet is private. Every Supabase table and storage bucket uses Row
  Level Security so users can only read and write their own data. Explain any
  policy you write.
- Database changes go through migration files so they're tracked in git.
- Photos live in their own table (item, storage path, order, is-hero), so an
  item can have many photos. Only the hero photo is required.
- All other item fields are optional. The UI must handle missing values
  gracefully (no "undefined", no broken layouts, empty fields hidden).
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

- Current milestone: 7 — detail photos (add, reorder, remove, change hero).
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
  none; demo closet for logged-out visitors. Item labels: no index codes;
  hover caption "name · brand · year" (DESIGN.md "Item labels").
- Milestone 4 done (2026-09-30, live): email + password auth with
  `@supabase/ssr`. One `/login` page (log in / sign up switch), email
  confirmation via `/auth/confirm`, log out in the top bar, password reset
  (`/forgot-password` → email → `/reset-password`). `proxy.ts` refreshes the
  session. Logged-out visitors see the sample closet as a demo.
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
  is the Next.js default; ESLint 9 deprecation warning comes from the Next.js
  template. Sample item details in `lib/sample-items.ts` are placeholders
  (photos in `public/sample/`). Auth emails use Supabase's default templates
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
- Supabase Auth settings (2026-09-30): Confirm email on, minimum password 8,
  Site URL https://closet-zip.vercel.app, redirect URLs
  http://localhost:3000/** and https://closet-zip.vercel.app/**.
- Next up: Milestone 7. Later: previous/next item arrows in the overlay.

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

- Current milestone: 1 — project setup and first deploy
- Last completed:
- Known issues:
- Next up:

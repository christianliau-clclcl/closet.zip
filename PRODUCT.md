# Closet.zip — Product Brief

> A beautiful, minimal way to archive your clothing digitally.
> Sections marked **TODO** are decisions still to make.

## Concept

Closet.zip is a personal archive of the clothes you own and have owned. Each
piece gets a photo and whatever details matter to you — where it came from,
what it's made of, and the story behind it. The collection is presented as a
calm, gallery-like grid, with views that show your style over time.

## Who it's for

People who care about their clothes as more than utility: who remember where
they found a grail piece, what time of life a jacket reminds them of, and want
a record of it. First testers: the designer's friends.

## Goals (v1)

- Sign up and keep a private archive of your own clothing
- Add an item from a phone: hero photo first, every detail optional
- Browse the archive in a minimal grid with a zoom toggle
- Open any item in an overlay with an enlarged image and all its details
- Sort and group by category, colour, and date acquired
- Move pieces you no longer own into an archive section instead of deleting them
- See your style over time, based on when pieces were acquired

## Non-goals (not in v1)

- Sharing closets or viewing other users' closets
- Stylist tools / digital outfit building (v2 idea)
- Automatic background removal (users remove backgrounds themselves for now)
- User-created custom fields or categories (the fixed category list stays;
  personal **folders** are the one exception, see Views)
- Shopping links, price tracking, or store integrations
- Native mobile app (responsive web only)

## Core user flows

1. **Sign up / log in** with email
2. **Add an item:** choose a hero photo → optionally fill in details → save
3. **Browse:** scroll the grid; zoom between small and large views
4. **Open an item:** tap (mobile) or click (desktop) → overlay with enlarged
   image, details, and detail photos
5. **Edit an item** from the overlay, including changing its colour
6. **Archive an item** you no longer own; view it later in the archive section
7. **Explore:** switch to category rows, colour view, or style over time

## Item data

| Field            | Required | Notes                                                  |
|------------------|----------|--------------------------------------------------------|
| Hero photo       | Yes      | Shown on grid cards                                    |
| Detail photos    | No       | Additional photos shown in the overlay (Milestone 6)   |
| Name             | No       |                                                        |
| Category         | No       | Fixed list: tops, bottoms, outerwear, shoes, accessories |
| Brand            | No       | Suggest previously used brands as the user types       |
| Colour           | No       | Auto-detected from hero photo; user can adjust         |
| Material         | No       |                                                        |
| Date acquired    | No       | Month and year                                         |
| Acquired from    | No       | Store, person, website, thrift, etc.                   |
| Price            | No       |                                                        |
| Size             | No       | The label size as written: "M", "32 × 30", "EU 42"     |
| Measurements     | No       | The garment's own measurements, rows by category (tops: chest, length, shoulder, sleeve; bottoms: waist, rise, inseam, leg opening, length; accessories: width, height, depth). Stored in cm; shown and entered in each person's chosen unit (cm or in), switchable in the overlay |
| Notes            | No       | Long-form: what you love about it, how you found it, what it reminds you of |
| Status           | —        | "In closet" (default) or "Archived"                    |
| Date archived    | No       | Month and year the item left the closet                |

## Views & interactions

- **Grid (default):** hero images on uniform cards so the grid stays even,
  whether or not the photo has a background. Structure comes from thin lines
  or grid dots, not heavy borders. Minimal or no text on cards.
- **Zoom toggle:** small view is just larger than a thumbnail; large view shows
  each piece big with plenty of white space.
- **Hover (desktop):** reveals the item's name and minimal details.
- **Tap (mobile):** there's no hover on touch screens, so a tap opens the
  overlay directly.
- **Detail overlay:** enlarged image alongside all filled-in details; empty
  fields hidden. Detail photos appear here once built.
- **Category rows:** one row per category, each scrolling sideways, like
  shelves in a closet.
- **Colour view:** items ordered by hue so the collection reads as a gradient.
- **Sort:** date acquired, brand, price, and **My order**: a hand-made order
  set in an **Arrange** mode (drag pieces in the grid, or use ← →; Done to
  finish). Tapping opens pieces only outside Arrange mode.
- **Folders** (decided 2026-10-01): personal collections on top of the fixed
  categories ("Grails", "Summer 2024", "To sell"). A piece can be in several
  folders; one level only (no folders inside folders). Each folder's cover is
  one of its garments by default, or a custom image the person uploads.
  "All" (the whole closet) stays the default view.
- **Filters:** narrow the grid by details (category, colour, brand, size…),
  in the filter drawer from DESIGN.md.
- **Smooth zoom:** changing the zoom level animates each piece to its new
  place and size instead of jumping.
- **Archive section:** items no longer in the closet, kept with their details.
- **Style over time:** the first visualization; items laid out by month and
  year acquired.
- **Empty state:** a friendly first-run screen prompting the first upload.

## Design direction

A quiet archive: garments catalogued like objects in a collection. Cut-out
clothing in uniform square cells on a warm off-white canvas, with small
monospace labels and index codes, serif type for personal notes, no rounded
corners, and no colour except the clothes themselves. Full system in
`DESIGN.md`; references in `moodboard.png` and notes in `notes.md`.

## Definition of done (v1)

Friends can sign up, upload their own images and details, and view their
archive on their own phones and computers. The app is deployed on a public URL.

## Roadmap

1. **Setup:** Next.js project, GitHub repo, Supabase project, blank page
   deployed to Vercel
2. **Grid (sample data):** uniform cards, zoom toggle, hover/tap behaviour,
   using a hard-coded sample closet so the design can be settled first
3. **Overlay (view only):** detail view with enlarged image and details,
   still on sample data
4. **Auth:** sign up, log in, log out
5. **Add item:** database with Row Level Security (private per-user data),
   hero photo upload and all optional fields (database already supports
   multiple photos per item); grid and overlay switch from sample data to
   real data; empty state
6. **Edit & archive:** edit, delete, archive/unarchive from the overlay
7. **Detail photos:** add, reorder, remove, and change the hero photo
   (the first photo is the cover)
   - *Polish (added 2026-10-01):* smooth zoom animation in the grid
8. **Size & measurements** (added 2026-10-01): size label and garment
   measurements per piece; each person chooses cm or in, with instant
   conversion in the overlay
9. **Views** (split 2026-10-01). A view bar under the top bar:
   ALL · FOLDERS · ROWS · ARCHIVE, with SORT · FILTER · ARRANGE on the right;
   choices live in the address (`?view=…&sort=…`).
   - **9a:** view bar, archive section (archived pieces leave ALL), category
     rows, sort (Newest added, Date acquired, Brand, Price), filter drawer
     (category, brand, size, colour)
   - **9b:** folders (cover grid, + New folder, Add to folder from the
     overlay, multi-select Move to folder) and Arrange mode / My order, with
     its own order per folder
10. **Colour:** auto-detect on upload, manual adjustment, colour view
11. **Style over time:** first visualization
12. **Polish & test:** friend testing, accessibility pass, mobile refinements,
    README and screenshots for the portfolio

## Later (v2+)

- **Sell to friends** (idea, 2026-10-01): low-key, local, among friends and
  friends of friends. A "For sale" toggle and list price per piece; a private,
  unguessable share link per listing that can be forwarded. The shared page
  shows the contact the owner chooses (e.g. "e-transfer to … / message me
  at …"), plus an optional "I'm interested" button that gives the owner an
  in-app notification. Email alerts later: email services have free tiers,
  but need a custom domain (the same one parked for login emails).
  No payments or pickup in the product: those happen outside it (e.g.
  e-transfer). Selling a piece could end with archiving it as "Sold". Needs:
  a deliberate exception to "every closet is private" (only shared listings,
  only via the link), spam protection, and a policy for buyers' contact data.

- Stylist tools: putting outfits together digitally
- Shareable closets
- Automatic background removal
- More visualizations: colour palettes, most expensive pieces, and others
- Custom fields, and custom replacements for the fixed category list
- Folders inside folders

## Open questions

- In style over time, where do items without a date acquired go?
- ~~For archived items, should we record how it left (sold, donated, gifted, lost)?~~
  Decided 2026-10-01: yes, optional: sold, donated, gifted, lost or other.
  Archived pieces live in the ARCHIVE view (Milestone 9a), not in ALL.
- Should there be a limit on photos per item, or per account, to manage storage?
- ~~Login method: email and password, or a magic link sent by email?~~
  Decided 2026-09-26: email and password.

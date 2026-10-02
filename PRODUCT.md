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

Sharing, selling and styling were non-goals for v1; decided 2026-10-01 to
build them before friend testing (see Roadmap 15–17).

- Browsing or discovering other users' closets (sharing is only ever by a
  link the owner chooses to give out)
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
- **Colour order:** "Colour" in the SORT list (decided 2026-10-01, instead
  of a separate view) orders pieces by hue so the collection reads as a
  gradient: red → orange → yellow → green → blue → purple → pink, then the
  neutrals (beige, white, grey, black); pieces without a colour last.
- **Sort:** date acquired, brand, price, and **My order**: a hand-made order
  set in an **Arrange** mode (drag pieces in the grid, or use ← →; Done to
  finish). Tapping opens pieces only outside Arrange mode.
- **Folders** (decided 2026-10-01): personal collections on top of the fixed
  categories ("Grails", "Summer 2024", "To sell"). A piece can be in several
  folders, and folders can hold folders. Each folder's cover is
  one of its garments by default, or a custom image the person uploads.
  "All" (the whole closet) stays the default view. (Folders inside folders
  decided 2026-10-01; it was one level only.)
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
   - **9b:** moved to Milestone 12 (2026-10-01)
10. **Polish** (2026-10-01; v1's definition of done is already met): error
    pages, favicon, overlay and filter refinements, demo text, photo
    fade-in, a quick accessibility check. Friend testing moved to 19
    (decided 2026-10-01: build the features below first, so friends see
    the full product).
11. **Colour** (planned 2026-10-01). Each piece keeps its colour *name*
    (free text, the person's own word) and gains the colour itself
    (`items.colour_hex`). A **family** (black, grey, white, beige/brown,
    red, orange, yellow, green, blue, purple, pink) is worked out from the
    hex, never stored. No new libraries.
    - **11a:** `colour_hex` column (migration), types, demo colours
    - **11b (done 2026-10-01):** detection in the browser (`lib/colour.ts`):
      the most common colour among non-transparent pixels, preferring a
      real colour when at least 15% of the garment has one (so white soles
      don't win over green leather). Runs when a photo is chosen on Add,
      and on Edit for pieces without a colour. `ColourField`: square
      swatch beside the name; PICK FROM PHOTO opens the cover photo under
      the field, tap the garment to pick (eyedropper); DETECT AGAIN (e.g.
      after changing the cover); CLEAR. The name is never filled in
      automatically.
    - **11c (done 2026-10-01):** square swatch beside the colour in the
      overlay (family name when no name was typed); the filter drawer's
      Colour section lists families, each swatch the average of the
      person's own pieces in that family (`colourFamily` in
      `lib/colour.ts`: hue, saturation and brightness; olive counts as
      green, burgundy as red)
    - **11d (done 2026-10-01):** SORT · Colour (see "Colour order"):
      by family, then by hue within colourful families; neutrals by
      brightness so the end fades chocolate → beige → white → grey → black
    - **11e (done 2026-10-01):** pieces without a colour get one in the
      background when their owner opens the closet (`useColourBackfill`):
      detected from the grid thumbnail and saved one at a time, only into
      empty colours; then the closet refreshes. The Edit page also detects
      for pieces without one.
12. **Folders & Arrange** (was 9b; planned 2026-10-01). Data: `folders`
    (owner, name, parent folder, cover piece or uploaded cover image, place
    among its neighbours), `folder_items` (piece ↔ folder links, each with
    its place in that folder's My order), `items.sort_position` (My order
    for ALL). Owner-only RLS; the database also refuses links to someone
    else's pieces or folders, and a folder inside itself. Uploaded covers
    live in the existing private photo storage under the owner's folder.
    Decisions (2026-10-01):
    - Opening a folder shows the folders inside it first, then only the
      pieces added to it directly.
    - Deleting a folder deletes the folders inside it too, after a confirm
      that says how many; pieces are never deleted.
    - Folder cells: the same square cell with the cover garment, and the
      name and count always underneath ("GRAILS — 07", label style).
    - SELECT mode: ADD TO FOLDER (pieces stay in their other folders) and,
      inside a folder, REMOVE FROM FOLDER. No "move".
    - My order: new pieces go first (an empty place sorts first, newest
      first). Once ALL or a folder has been arranged, it opens in My order
      by default. Arranging: drag (also on phones, like the photo manager)
      and ← → under each piece; DONE to finish.
    Steps:
    - **12a:** tables, privacy rules and checks; tested as two users and a
      logged-out visitor
    - **12b (done 2026-10-01):** FOLDERS view (logged in only; the demo has
      no folders): path row "FOLDERS / SEASONS / SUMMER" (earlier parts go
      up; Back too), + NEW FOLDER (inside the open folder), RENAME, DELETE;
      one grid with the folders inside first, then the folder's own pieces
      (archived ones included); SORT and FILTER only inside a folder
    - **12c (done 2026-10-01):** a Folders section at the end of the
      detail panel (own pieces only): the folders the piece is in as path
      links ("Seasons / Summer"; tap to open), EDIT → checklist of every
      folder (indented by depth), saved on each tick; + NEW FOLDER creates
      a top-level folder with the piece in it
    - **12d:** SELECT mode in the grid (add to folder, remove from folder);
      built 2026-10-02, see DESIGN.md "SELECT mode"
    - **12e (built 2026-10-02):** covers. Default is a box icon (decided
      2026-10-02, replacing "first piece"); or an uploaded image (resized in
      the browser, stored at <user id>/folders/<folder id>.<ext>; replaced
      or removed images are deleted, also when a folder is deleted); or one
      of the folder's pieces. + NEW FOLDER and EDIT open a folder modal
      (name, cover BOX · IMAGE · PIECE, DELETE when editing); the quick
      inline + NEW FOLDER stays in the piece checklist and SELECT list
    - **12f (built 2026-10-02):** INSIDE in the folder modal: a dropdown of
      "Folders (top level)" and every folder (indented), leaving out the
      folder itself and the folders inside it; saving moves the folder with
      everything in it. Also sets where a new folder goes
    - **12g:** ARRANGE and My order, for ALL and each folder
13. **Style over time:** first visualization
14. **More visualizations** (from v2, 2026-10-01): colour palettes, most
    expensive pieces, and others
15. **Sharing** (from v2, 2026-10-01): a private, unguessable, view-only
    link to your closet or a folder, which you can switch off. The first
    deliberate exception to "every closet is private"; nothing is ever
    listed or searchable.
16. **Sell to friends** (from v2, 2026-10-01): see "Sell to friends" below;
    listing links reuse the sharing from 15.
17. **Styling / outfits** (from v2, 2026-10-01): put pieces together into
    outfits or a styling project. Details to design.
18. **Final polish:** accessibility pass, mobile refinements, README and
    screenshots for the portfolio, and a short intro above the demo closet
    for logged-out visitors (what you can do, in the archive's own voice)
19. **Friend testing:** invite a few friends at a time, with a feedback
    link (Google Form). Consider a custom domain and email service first:
    Supabase's built-in sender allows only a few emails per hour.

## Sell to friends (Milestone 16)

- Idea, 2026-10-01: low-key, local, among friends and
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

## Later (v2+)

- Automatic background removal
- Custom fields, and custom replacements for the fixed category list

## Open questions

- In style over time, where do items without a date acquired go?
- ~~For archived items, should we record how it left (sold, donated, gifted, lost)?~~
  Decided 2026-10-01: yes, optional: sold, donated, gifted, lost or other.
  Archived pieces live in the ARCHIVE view (Milestone 9a), not in ALL.
- Should there be a limit on photos per item, or per account, to manage storage?
- ~~Login method: email and password, or a magic link sent by email?~~
  Decided 2026-09-26: email and password.

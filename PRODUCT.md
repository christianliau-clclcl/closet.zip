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

Decided 2026-10-05 (after a competitor scan, `research/competitor-scan.md`):
the audience is **higher-end collectors tracking their collection**, closer
to Grailed's collectors than to wardrobe apps' outfit planners (Whering,
Indyx, Stylebook). They care about brands, provenance, measurements and
what they've owned, and less about cost. So: the look stays quiet and
collector-like, not bold and bright; an outfit maker or randomizer
(styling, 17) is a secondary feature, not a headline one. The clearest
difference from competitors is "a record of what you've owned and its
story"; the biggest gap is how fast pieces can be added.

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

1. **Sign up / log in** with email. The logged-out home page is one line
   ("Keep track of what you own: your grails, where you found them, and how your closet changes over time.") above the
   log in / sign up form; there's no demo closet (decided 2026-10-02)
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
| Category         | No       | Fixed list (15¼, `lib/categories.ts`): Tops, T-Shirts, Shirts, Knitwear, Sweatshirts, Jackets, Dresses, Trousers, Skirts, Shoes, Sneakers, Bags, Sunglasses, Accessories |
| Brand            | No       | Suggest previously used brands as the user types       |
| Colour           | No       | Auto-detected from hero photo; user can adjust         |
| Material         | No       |                                                        |
| Date acquired    | No       | Month and year                                         |
| Acquired from    | No       | Store, person, website, thrift, etc.                   |
| Price            | No       |                                                        |
| Size             | No       | The label size as written: "M", "32 × 30", "EU 42"     |
| Measurements     | No       | The garment's own measurements, rows by category (top rows: chest, length, shoulder, sleeve, for Tops through Dresses; bottom rows: waist, rise, inseam, leg opening, length, for Trousers and Skirts; width, height, depth for Bags, Sunglasses, Accessories; none for Shoes and Sneakers). Stored in cm; shown and entered in each person's chosen unit (cm or in), switchable in the overlay |
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
    - **12g (built 2026-10-02):** ARRANGE (beside SELECT; in ALL and inside
      folders): every piece of the view in My order, filters and sort set
      aside meanwhile; drag (mouse: straight away; touch: press and hold
      300ms so swipes still scroll) or ← → under each piece; CANCEL · DONE,
      saved in one go by `arrange_items` / `arrange_folder`. "My order" is
      in the SORT list and becomes the default once arranged. Folders'
      own order isn't arrangeable yet
13. **Style over time:** first visualization (planned 2026-10-02). A TIME
    view (ALL · FOLDERS · ROWS · TIME · ARCHIVE). Desktop: a horizontal
    timeline in real time (every month has a slot, so gaps show), pieces
    stacked above their month, years labelled under the axis, scrolling
    sideways. Phones: time runs down the page, a row per month, years as
    headings. Pieces with a year but no month: a slot labelled with the
    year, before that January. No date: "N.D." at the end. Archived pieces
    included, with an ARCHIVED on/off switch. SORT hidden (time is the
    order); FILTER works. Monochrome axis (ink, stone, rule).
    - **13a (built 2026-10-02):** TIME view and the horizontal timeline
      (`lib/timeline.ts` slots, `TimeView`); also on phones until 13b
    - **13b (built 2026-10-02):** phone layout: the axis runs down the left
      side, newest at the top; a row per month (empty months 12px, so gaps
      show), years beside the line, month names for months with pieces
    - **13d (built 2026-10-02):** long gaps shortened: a run of more than 6
      empty months becomes one break, drawn as // and labelled with its
      length ("4 YRS 11 MOS"); the first month after a break shows its year.
      Shorter gaps stay as real empty months. (From the user's density-based
      scaling idea, simplified: no density mode, no setting for now.)
    - **Order (2026-10-02):** newest first by default on desktop too (most
      recent on the left), with ORDER · NEWEST / OLDEST to reverse it on
      both (?order=oldest; desktop: in the view bar; phones: in VIEW)
    - **13c (built 2026-10-02):** ARCHIVED · ON / OFF (on by default; in the
      address as ?archived=hide; desktop: after FILTER; phones: in VIEW,
      counted in "VIEW · N"). FILTER works in TIME
13½. **Friend feedback round** (decided 2026-10-02, before 14):
    - **Search (built 2026-10-02):** a search field (desktop: in the view bar; phones: SEARCH
      in the bottom bar opens a field) filtering live across name, brand,
      colour, material, size, where from, category, notes; in the address
      as ?q=
    - **Closet name (built 2026-10-02):** an optional "Closet name" field at the top of the
      sign-up form (any characters, 1–30; "you can name it later from the
      menu"); stored in the account's user metadata; replaces CLOSET.ZIP in
      the top left when logged in; set or renamed later from MENU
    - **Navigation restructure (built 2026-10-02: tabs, SORT BY, ARCHIVED
      everywhere, old links upgraded, Colour and Brand shelves):** top tabs ALL · FOLDERS (FOR SALE joins
      with Milestone 16). SORT BY (replacing VIEW / SORT; reads "SORT BY ·
      TIMELINE") lists My order · Newest added · Timeline · Type (shelves per
      category, was ROWS) · Colour (shelves per colour family) · Colour
      gradient (one grid) · Brand (shelves per brand) · Price (high to low);
      then FILTER, ARCHIVED · ON/OFF (off by default everywhere, replacing
      the ARCHIVE tab), ZOOM. Old ?view= links redirect
14. **More visualizations** (planned 2026-10-02; the OVERVIEW tab was
    removed 2026-10-03 at the user's request: SORT BY's shelves are the
    views now, and old ?view=overview links open Colour shelves; the code
    is in git history, commits 0ffb69f and 2e3892b): an OVERVIEW tab (ALL ·
    FOLDERS · OVERVIEW), one scrolling page of simple sections in rows and
    grids, for what you own now (archived pieces left out; search and
    filters don't apply).
    - **14a (built 2026-10-02):** By colour: pieces grouped by the colour
      name typed for them ("Black", "Charcoal"…; case doesn't matter), most
      pieces first, each group a heading ("BLACK — 02") and a wrapping grid;
      no colour name last. (A colour-strip palette was tried and dropped.)
    - **14b (shelved 2026-10-02, until the user says so):** Spending, built
      and parked on the local branch `shelved/spending` (archived pieces
      included; total, by year, by category, most expensive with prices)
    - **14c (built 2026-10-02):** Brands: most-owned brands first ("levi's"
      and "Levi's" as one), each a heading and a wrapping grid; no brand
      last
14½. **Second feedback round** (decided 2026-10-03, from a handful of
    friends: they liked the details, but couldn't tell what it was for, and
    filling in details was the biggest pain point):
    - **Say what it is:** a few lines on the logged-out home page (pulled
      forward from Milestone 18), in friends' own words: keeping track of
      what you own and where it came from, grails, a personal record that
      changes over the years
    - **Faster logging** (explored on a design canvas, built 2026-10-03):
      compact boxed chips for Category, Material and Acquired; the rest
      typed. Acquired starts on This month (THIS MONTH · LAST MONTH ·
      EARLIER… · DON'T KNOW). Material: several allowed from Cotton ·
      Leather · Twill · Nylon · Polyester · Wool · Linen, plus OTHER… to
      type; saved as one line ("Cotton, Wool, Cashmere"). Size fills in with
      your usual size for the category (the one you've used most), silently,
      never over a size you typed
    - Not doing: return reminders (too few people would use them)
15. **Public profiles** (planned 2026-10-03; replaces the earlier
    "private share links" plan). A closet is private by default; its owner
    can make it public at **/@username**. The first deliberate exception to
    "every closet is private". Decisions:
    - Public profile only: no secret links. Going public shows every piece
      by default; any piece, and any folder, can be hidden from the public.
    - Visitors see photos and catalogue details: name, brand, category,
      colour, material, size, measurements, date acquired. Never: price,
      where from, notes. Archived pieces too, behind the ARCHIVED switch.
    - Visitors browse read-only: ALL · FOLDERS (hidden folders and pieces
      left out), SORT BY, search, filter, piece details.
    - Controls: MENU → Public profile (username, PUBLIC · ON/OFF); "Hide
      from public" in a piece's details and in the folder modal; HIDE /
      SHOW in SELECT mode for many pieces.
    - Usernames: 3–20 characters (letters, numbers, . and _), not
      case-sensitive, unique, changeable (the old /@name then stops
      working), a few reserved (admin, login…).
    - Not listed or searchable: no directory, and pages ask search engines
      not to index them; people find a profile only from its link.
    Steps:
    - **15a (built 2026-10-03):** usernames and PUBLIC · ON/OFF in MENU →
      Public profile (`profiles.username`, `profiles.is_public`; rules in
      the database and `lib/usernames.ts`; live availability check)
    - **15b (built 2026-10-03):** hiding pieces and folders
      (`items.is_hidden`, `folders.is_hidden`): PUBLIC PAGE · SHOWN / HIDDEN
      in a piece's details and in the folder modal, HIDE / SHOW in SELECT
      mode, a small crossed-out eye on hidden cells. Hiding a folder hides
      only the folder; its pieces still show unless hidden themselves
    - **15c (built 2026-10-05; 23 rolled-back checks passed):** the public door. Tables keep their
      owner-only rules; visitors (logged out or in, the owner too, to
      preview) read through three security-definer functions that only
      answer for a PUBLIC profile: `public_profile` (username and closet
      name), `public_items` (visible pieces: name, brand, category, colour,
      material, size, measurements, date acquired, archived or not, order,
      photo paths; never price, where from, notes or how it left) and
      `public_folders` (visible folders, their cover and visible pieces).
      A private profile and a username that doesn't exist look the same.
      A storage rule lets anyone open only the photos of visible pieces in
      a public closet, and visible folders' uploaded covers; turning PUBLIC
      off or hiding a piece closes it at once (links already handed out
      expire within the hour). Decided 2026-10-05: the page shows the
      closet name + @username; archived pieces show only that they're
      archived (no date, no how); hiding a folder hides the folders inside
      it too; a folder whose cover piece is hidden shows the box. Tested
      rolled back as owner, visitor and another user before applying, and
      CLAUDE.md's privacy rule reworded (with the user's OK) when applied.
    - **15d (built 2026-10-05):** the visitor's page at /@username
      (a rewrite to /u/[username], since @ folders mean parallel routes in
      Next.js). The closet screen in a visitor mode, so the views can't
      drift apart: ALL · FOLDERS, SORT BY (no Price), search, filter, zoom,
      piece details; no SELECT, ARRANGE, + ADD, PASTE, EDIT, ARCHIVE,
      DELETE, Folders or PUBLIC PAGE sections, + NEW FOLDER or folder EDIT.
      Data from the 15c functions (`lib/public-closet.ts`), photos by
      signed links. Pages ask search engines not to index them. Decided
      2026-10-05: top bar shows the closet name with @username in `stone`
      and a quiet CLOSET.ZIP link home on the right; your own public page
      has one `stone` line above the grid ("This is how others see your
      closet. Back to your closet →"); a private or unknown address shows
      "This closet is private or doesn't exist." on the status page.
      Measurements in a logged-in visitor's own unit, else IN with the
      switch working for the visit. The Public profile modal gets VIEW
      PAGE and COPY LINK instead of "coming soon".
15¼. **New category list** (planned 2026-10-05). The five categories become
    14, still a fixed list, in head-to-toe order: Tops, T-Shirts, Shirts,
    Knitwear, Sweatshirts, Jackets, Dresses, Trousers, Skirts, Shoes,
    Sneakers, Bags, Sunglasses, Accessories (caps, belts, jewellery,
    watches…). Decisions:
    - Existing pieces move to the closest match: Tops → Tops, Bottoms →
      Trousers, Outerwear → Jackets, Shoes → Shoes, Accessories →
      Accessories. Owners can re-pick. (12 pieces in all, 2026-10-05.)
    - Measurement rows: top rows (chest, length, shoulder, sleeve) for
      Tops, T-Shirts, Shirts, Knitwear, Sweatshirts, Jackets and Dresses;
      bottom rows (waist, rise, inseam, leg opening, length) for Trousers
      and Skirts; none for Shoes and Sneakers (the size label covers them);
      width, height, depth for Bags, Sunglasses and Accessories.
    - One category list in the code (label, measurement rows, kind of size)
      replaces the four copies of the old five.
    - Old links keep working: ?category=bottoms → trousers, outerwear →
      jackets.
    Steps:
    - **15¼a:** the list in code and the database together (a migration
      that moves pieces and swaps the allowed values, tested rolled back
      first); Add/Edit chips, measurements, usual size, Type shelves,
      filter, labels, old links. Applied right before pushing, since the
      live app and the database must agree on the values.
    - **15¼b (built 2026-10-05):** onboarding steps 2–3 on the new list,
      categories first so sizes only ask what you need: (2) tick the
      categories you own (`profiles.closet_categories`); Add/Edit show
      those first, MORE… for the rest; (3) your sizes by kind
      (`profiles.usual_sizes`: letter, waist, shoe), filling in on Add
      until your own pieces show a usual size. Sizing systems (decided
      2026-10-05): shoes US · UK · EU, tops LETTER · EU · NUMBERED, saved
      with the system in front ("EU 43", "US 9.5"); waist and women's
      sizes typed via OTHER… for now. MENU → CLOSET SETUP reopens the
      steps with your answers.
15½. **Onboarding** (planned 2026-10-03): an optional first-run flow that
    makes logging faster. Shown once at first login, SKIP on every step,
    everything editable later from MENU. Steps: (1) closet name (if skipped
    at sign-up) and units (IN · CM); (2) your sizes, one row of chips per
    category; (3) what's in your closet: a fixed list of types under each of
    the five categories (e.g. Tops → T-shirts, Shirts, Knitwear…), tick all
    that apply. Types are a fixed list only (decided: the "no custom
    categories" non-goal stays). On Add, choosing a category then offers
    your ticked types as chips; your sizes become the starting size.
    Mockups on a design canvas first.
    - **Step 1 (built 2026-10-05):** /welcome with CLOSET NAME and
      MEASUREMENTS IN · CM, SKIP and DONE. `profiles.onboarding_step`
      records how far you've got; the closet sends you to /welcome while
      it's below the number of steps (`ONBOARDING_STEPS`), so steps added
      later show once to everyone. Existing accounts see it once too.
    - **Steps 2–3:** built with the new category list (15¼b).
16. **Sell to friends** (from v2, 2026-10-01; planned 2026-10-05 with public
    profiles, replacing the private listing links in "Sell to friends"
    below). Your collection is your shop, as on Grailed or Discogs.
    Decisions (2026-10-05):
    - Pieces for sale appear in a FOR SALE tab on your public page (ALL ·
      FOLDERS · FOR SALE), and in your own closet too. PUBLIC gets a third
      setting: OFF · FOR SALE ONLY · ON; FOR SALE ONLY shows just the FOR
      SALE tab, none of the rest of your closet.
    - Buyers get in touch through a contact line you write once (e.g. "DM
      @christian on Instagram, e-transfer only, pickup downtown"), shown on
      the FOR SALE tab and each listing. No buyer data stored, no in-app
      messages or payments.
    - A listing adds: asking price (separate from what you paid, which
      stays private), condition (New with tags · Like new · Good · Worn)
      and an optional sale note.
    - To list a piece, its measurements are required (the user's call: a
      deliberate exception to "every field is optional", for listings
      only): the size label plus every measurement row for its category
      (shoes and sneakers: the size label only), asking price and
      condition. The SELL section says what's missing, with a link to EDIT.
    - A listed piece is always shown publicly: listing a hidden piece shows
      it; hiding a listed piece takes it off sale.
    - MARK SOLD takes it off sale and archives it as Sold this month
      (editable), keeping your record of it.
    Steps:
    - **16a (built 2026-10-05; 21 rolled-back checks passed):** the database: listing fields on items (for sale, asking
      price, condition, sale note), PUBLIC's three settings and the
      contact line on profiles, and the public door updated (listings,
      FOR SALE ONLY); tested rolled back before applying.
    - **16b (built 2026-10-05):** your side: SELL in a piece's details (FOR SALE · OFF / ON,
      price, condition, note, what's missing, MARK SOLD), the FOR SALE tab
      in your closet, PUBLIC's three settings and the contact line in the
      Public profile modal.
    - **16c (built 2026-10-06):** the visitor's side: the FOR SALE tab on /@username with
      price, condition, note and your contact line; FOR SALE ONLY pages.
17. **Looks** (styling, from v2; planned 2026-10-06, mockups on the "Looks
    explorations" canvas). A secondary feature (audience decision,
    2026-10-05): a record of how you put pieces together, not a daily
    outfit planner. Decisions (2026-10-06):
    - A look is a name, a note and some of your pieces, composed on a
      freeform board (option B on the canvas): drag, resize, rotate and
      layer pieces like a moodboard. A new look starts from an automatic
      head-to-toe flat-lay (option A), so the board is never empty.
    - The board is a fixed 3:4; positions are saved relative to it, so a
      look is the same on a phone, a laptop and a public page.
    - Editing: phones drag to move and use two fingers to resize and
      rotate; desktop drags, resizes from corner handles and rotates with
      ↺ ↻; both have FORWARD · BACK (layering), REMOVE and a strip of
      your pieces to add; arrow keys move the selected piece. No new
      library: `motion` (already used) for dragging, the browser's touch
      events for pinching.
    - Looks live in a LOOKS tab (ALL · FOLDERS · LOOKS · FOR SALE): your
      gallery of looks, each a small copy of its board with "NAME — 06".
      A piece's details list the looks it's in.
    - SHUFFLE (a random top, bottom and shoes) was built in 17d and removed
      the same day at the user's request (code in git history, commit
      1bb54ab).
    - Deleting a piece removes it from its looks; archiving keeps it there
      (a look is a record).
    - Public pages show looks like folders, each hideable.
    Steps:
    - **17a (built 2026-10-06; 17 rolled-back checks passed):** the database: `looks` (name, note, order, hidden) and
      `look_items` (piece, position, size, rotation, layer), owner-only
      rules, tested rolled back before applying.
    - **17b (built 2026-10-06):** the LOOKS tab and gallery, a look's page (board, name,
      note, pieces), + NEW LOOK (pick pieces, starting flat-lay), name and
      note, delete; looks in a piece's details.
    - **17c (built 2026-10-06):** the freeform editor (drag, resize, rotate, layer, remove,
      add pieces), phones and desktop.
    - **17d:** SHUFFLE, built then removed (2026-10-06, the user's call).
    - **17e (built 2026-10-06; 10 rolled-back checks passed):** looks on public pages through `public_looks` (only visible looks, only visible pieces on their boards, none on FOR SALE ONLY pages); LOOKS tab for visitors when there are any; read-only look pages at /@username/looks/<id>; PUBLIC PAGE · SHOWN / HIDDEN in the look's EDIT, the crossed-out eye in your gallery.
18. **Final polish** (planned 2026-10-06). Decisions:
    - Input borders stay `rule` (1.3:1, under WCAG's 3:1 for field edges):
      a deliberate exception for the quiet look, the user's call after
      comparing it with `stone` (2026-10-06). Labels above, the white fill
      and the `ink` focus border mark each field.
    - The words (home page lines, README) are drafted by Claude in the
      archive's voice and edited by the user before they ship.
    Steps:
    - **18a (done 2026-10-06; nothing needed fixing):** accessibility pass over everything built since Milestone 10
      (onboarding, public pages, selling, looks, ARRANGE): keyboard order
      and focus, labels and alt text, contrast of text and states, Reduce
      motion, screen-reader names; fixes as found.
    - **18b:** mobile refinements and the parked extras: 44px touch areas
      around ARRANGE's corner handles; ZOOM instead of SORT BY where the
      menu only holds zoom (LOOKS, the top of FOLDERS); previous / next
      between pieces in the details overlay, in the order you're browsing;
      sizes in size order in the filter (XS, S, M, L… and numbers in
      order, not A–Z). Plus anything found trying it on a real phone.
    - **18c:** a few lines around the log in form on the logged-out home
      page (what you can do, in the archive's own voice; decided
      2026-10-02, replacing an intro above the demo closet; the audience
      is collectors, 2026-10-05): drafted, then edited by the user.
    - **18d:** README and screenshots for the portfolio.
    - **18e (last, when the user's design is ready):** the real favicon
      and the phone home-screen icon (`apple-icon`).
19. **Friend testing:** invite a few friends at a time, with a feedback
    link (Google Form). Consider a custom domain and email service first:
    Supabase's built-in sender allows only a few emails per hour.

## Sell to friends (Milestone 16)

- Superseded 2026-10-05 by the plan in the roadmap (Milestone 16): listings
  live on public profiles instead of private links. The original idea:
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

- **Discovery** (friends' feedback, 2026-10-03): a feed of what people you
  follow acquire; matching "I have this too" across closets; autofill from a
  shared database of other people's entries. Later, if ever: each breaks
  "every closet is private" in a bigger way than sharing a link.
- **Connecting people** (friends' feedback, 2026-10-03; wanted): e.g. people
  who like the same brands. Needs sharing (15) and usernames first; design it
  then.

- Automatic background removal
- Custom fields, and custom replacements for the fixed category list

## Open questions

- ~~In style over time, where do items without a date acquired go?~~
  Decided 2026-10-02: in an "N.D." (no date) group at the end.
- ~~For archived items, should we record how it left (sold, donated, gifted, lost)?~~
  Decided 2026-10-01: yes, optional: sold, donated, gifted, lost or other.
  Archived pieces live in the ARCHIVE view (Milestone 9a), not in ALL.
- Should there be a limit on photos per item, or per account, to manage storage?
- ~~Login method: email and password, or a magic link sent by email?~~
  Decided 2026-09-26: email and password.

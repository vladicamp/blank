# wildsheepgames.com

Static build of the Wild Sheep site. No build step, no dependencies.

It started from the Adobe XD comp (`wildsheepgames.com-landingPage.xd`), and the game
detail page from the Origins one-sheet. The landing page has since diverged from the comp
deliberately — one-up capability carousel modelled on clear.bank, a single `--sec-y`
spacing rhythm through the dark fold, inverted contact and footer, and a full-bleed purple
Engagement Tools band. **The comp is where this came from, not what it should match.**

> **`CLAUDE.md` is the authoritative working document** — how the site is built, why the
> non-obvious decisions were made, and which ones are load-bearing. This README is the
> short orientation. If the two ever disagree, CLAUDE.md is right and this file is stale.

## Run it

```bash
python3 serve.py
```

<http://localhost:8756/> — it must be served over HTTP, not opened as a file,
because the pages fetch their content from `data/`.

The server binds to loopback only. `serve.py --lan` binds every interface and serves this
whole folder to anyone on the network — useful for testing on a real handset at home, not
something to run on a network you don't trust.

| Page | URL |
|---|---|
| Landing | `/` |
| Game library | `/games/` |
| Game detail | `/games/game.html?g=blob-invasion` |
| Brochure | `/brochure/` |
| Free branded game | `/free-branded-game/` |

## Editing content

Everything is in two files. You do not need to touch HTML to change copy or add
a game.

- **`data/games.json`** — the game catalogue. Single source of truth: it drives
  the library grid, the landing page carousels, the game pages and the brochure.
- **`data/site.json`** — marketing copy, nav, contact form fields, brochure
  front matter.

Adding a game: append an object to `games`, drop its 3:2 card art at
`assets/img/games/<slug>.jpg`, point `thumbnail` at it. It appears everywhere
automatically. For a full page it also wants `assets/img/games/<slug>/logo.png` (a
transparent cutout) and `backdrop.jpg` — with those two it gets the composed hero rather
than the flat-thumbnail fallback.

**Trim any logo to its own alpha bounds first.** Supplier exports habitually centre the
artwork on a big empty canvas, and the empty canvas is what `max-width` then describes, so
the mark renders small inside its own slot with nothing in the console to explain it.

### Optional fields worth knowing about

Each renders only when present, so leaving one out is a valid state, not a hole:

| Field | Effect |
|---|---|
| `capabilities[].art` | Illustration in the bottom-right of that carousel card. Currently empty for all four — drop in a path and it appears. |
| `value_props[].link` | The green "Read more →" at the end of that paragraph. Only Engagement Tools has one. |
| `promotion_tools.items[].icon` | SVG path `d` data for the line icon top-right of the card. |
| `brand_tiles[].tagline` | The line revealed under the mark when that tile is hovered (or tapped on touch). |
| `brand_tiles[].mark_hover` | The mark the lockup swaps to on hover — a `.mark--<value>` class suffix. Omit and the lockup simply stays. |
| `games[].card_line` | The one-sentence teaser on the card's meta strip, in place of "Slots · Origins". Written as a hook, not a spec line, but always pointing at the game's real mechanic or theme. Falls back to the range/type pair if absent. |
| `games[].new_release` | Purple "New release" corner flag, everywhere that card appears. |
| `games[].teaser` | An unnamed upcoming slot: art and a date only, Upcomings rails only — never the grid or the brochure. |
| `games[].art.cutout` | An alpha PNG of the subject alone, floated uncropped on a purple card in the Upcomings rails. For a slot whose art is still a character render rather than a finished 3:2 tile. Give it a real tile and remove this. |
| `games[].status: "upcoming"` | Green "Coming soon" flag, and the card stops being a link everywhere. Keeps the title out of the library grid and onto its Upcomings shelf. `?g=` for it answers with the date rather than a page. |
| `games[].options[]` | The spec-band ticks. A plain string means the game has it; `{"label": "...", "available": false}` renders the grey cross. |
| `games[].symbols_title` / `symbols_lead` | Override the Symbols heading and add a lead under it — Spin My Drink uses "Customisable Booze". |
| `games[].screenshots[].w` / `.h` | The file's pixel size. **Required.** Reserves the box before load, and is what keeps a portrait phone capture from being cropped to landscape. |
| `games[].specs_provisional` | Prints the "placeholder specification" note inside the spec band. |

Both brand-tile fields belong to the **hover** state only — at rest the tile is the full
lockup from `logo`, exactly as it always was.

`personalisation.chips` **was deleted on purpose.** The chips under the statement are the
capability carousel's tab strip and now render from `capabilities` itself, so chip *n*
always selects card *n* and the two lists cannot drift apart. Don't re-add it.

## Download Brochure

**Download Brochure** in the menu — on any page — builds a print-ready A4
PDF from the live catalogue — cover, overview, contents table, every game with art and
specs, and a contact page.

**Three editions, chosen in the toolbar or by `?scope=`:** `origins` (10 titles, 12 pages),
`classic` (16 titles, 20 pages) and `all` (26 titles, 28 pages, the default). **One page per
released game** — each sheet carries that title's own key art, spec grid and whatever prose,
symbols, screenshots and buy options it has. The unreleased titles share a single Upcoming
sheet of thumbnails and dates.

**Every class in `brochure.css` is `b-` prefixed and the file shares zero class names with
`site.css`.** Both stylesheets load on this page, so an unprefixed name lets the site's rules
win — it has already caused black capability cards and a two-column spec grid in print.

The scope only filters by RANGE. There is still no filter- or search-scoped brochure:
`brochure.js` reads `scope` and `print` and nothing else, and `library.js` does not pass the
library's active filter into the link — that used to happen and quietly produced brochures
nobody had asked for.

Choose **Save as PDF** in the print dialog, and leave **Background graphics** on
so the brand colours print.

The Download Brochure panel that used to sit at the foot of `/games/` has been removed —
the menu item is the only route in now.

## The library grid

`/games/` shows its first four tiles **two-up at 1.5x** and everything after them
three-up. Which four is purely positional (`:nth-child(-n + 4)`), so it follows whatever
is on screen: filter to Classic and the top four Classic games go big, re-sort and the big
four change with it. Nothing in `games.json` marks them, and there is nothing to keep in
sync. CLAUDE.md has the mechanism and the one rule you can break — every selector is
scoped to `.game-grid >` because `.game-card` is shared with the landing page's rails.

## Structure

```
index.html          landing
games/              library + detail
brochure/           brochure document
data/               ← content lives here
assets/css/         tokens.css (design system) · site.css · brochure.css
assets/js/          store.js (data) · site.js · library.js · brochure.js
assets/fonts/       SCHABO Condensed · Space Grotesk
assets/img/         games/<slug>/ (logo · backdrop · symbols · cast) · logos
wp/                 WordPress port notes + partial ACF field group
serve.py            local preview server
```

`assets/img/partners/` still holds the partner logos, but nothing renders them — see
below.

## Porting to WordPress

Read **`wp/HANDOVER.md`**. It maps every file to its theme equivalent, gives the
exact CPT/ACF field names, and lists the CSS gotchas that are load-bearing.

`wp/acf-fields.json` is importable but **partial** — it covers the `game` post type only,
and not all of its fields. HANDOVER §4 has the full spec and says exactly what's missing.

## Known-provisional

- The seven **Origins** titles carry real spec figures, stories, features, symbols
  and buy options, transcribed from `A4-wildsheep-ORIGINS_20260820.pdf`. Twelve of the
  **Classic** titles carry real spec panels from `A4-wildsheep-classic.pdf`, which
  contains no prose — so those pages are hero → spec band → demo. The six **Joker Win
  Hits** titles additionally carry hit frequencies and per-game feature blocks from
  `Wild Sheep Joker Win Hits Series.pdf`. **`epic-stars` is the only entry left on
  invented figures**, and says so on its page.
- Where the Joker deck (Feb 2026) and the Classic brochure (Jul 2026) disagree, the
  newer brochure wins. Three figures differ, one of them a factor-of-two max-win gap on
  Joker Win Hits Power 5 — see `_meta.source_conflicts` in `games.json`.
- Every named title has hero art (logo + backdrop), and the two newest Joker titles'
  logo, backdrop, screenshots and catalogue card were all built from the series PDF
  because they ship no asset pack. Only the three unnamed upcoming Origins slots fall
  back to the flat catalogue thumbnail.
- Classic artwork is published without a Blueprint licence credit. That was a
  deliberate call on 2026-08-25; see CLAUDE.md if it needs revisiting.
- **Nothing in the specs is invented** except `epic-stars`. The only *written* copy left is
  the tagline and summary on the four Classic entries added from the packs and the Joker
  deck (`wonder-of-greece`, `joker-win-hits-megaways`, `…-win-boost`, `…-win-stepper`), and
  their release dates, which are inferred from document order.
- `high-rollers-cash` and `spin-my-drink` have no background story in the brochure;
  their pages carry its operator-facing feature blocks instead. That is the finished
  state for them, not a gap.
- **Bamboonanza's Core Features do not follow the brochure**, because the brochure's
  block there is Iron Gate's and contradicts Bamboonanza's own spec panel. See
  `_meta.source_conflicts` in `games.json` — this one needs a decision.
- `demo_url` is empty for every game, so the demo block is a placeholder. Fill it
  in and the same frame renders an `<iframe>`; no template change. The block has no
  visible heading — just the frame.
- The demo form is front-end only — it validates and reports locally, nothing is sent.
- **The News section and the partner logo row are removed from the page.** Their content
  stays in `site.json` (`news`, `partners`), marked not-rendered: News returns as real
  posts in a later phase, and the partner logos came from the XD file and are not
  confirmed as cleared for public display.
- The catalogue comes from `A4-wildsheep-ORIGINS_20260820.pdf`. **Every release date in
  `games.json` is inferred — no source document states one, for any title.** They carry
  ordering and nothing else: the Origins brochure gives page order (earlier = more recent)
  and the dates encode it so the `release_date` sort reproduces it. Three Joker Classic
  titles were re-dated on 2026-08-26 so the whole Classic range sorts below the whole
  Origins range. `_meta.release_dates` and `_meta.inferred_dates` record both.
- **Unreleased titles are teasers everywhere and never link.** `status: 'upcoming'` makes a
  card a `<span>`, on the library grid and the Upcomings rail alike; a `?g=` URL for one
  answers with its date and a way back rather than an empty page. One test, `isTeaser()` in
  `site.js`, drives all of it.
- The four unnamed slots at the end of the Upcoming timeline additionally carry
  `teaser: true` and no title or slug, exactly as the brochure has them. They show on the
  Upcomings rails only — `WS.query()` filters them out of the brochure. Their art is an
  alpha cut-out on purple (`art.cutout`), because the source images are square character
  renders, not tiles. **The Feb 2027 one keeps a faint outline** — its source has a dark
  slab baked in behind the subject in the same grey as the bomb, and a clean asset is the
  only real fix.
- **The footer menu comes from `site.json`'s `nav`.** The header's overlay menu does NOT —
  it is static markup in each page, so a menu label has to change in both places. On a game
  page the footer takes the range's colour — purple for Origins, orange for Classic.
- **`footer.legal_links` in `site.json` is empty on purpose.** Privacy / Terms / Cookies
  belong there, but those pages don't exist yet and the row is content-gated, so it stays
  hidden rather than shipping dead links. Add entries and the row appears.
- **The first fold has a scroll effect, and there are two of them.** `<html data-parallax>`
  in `index.html` picks: `"v2"` (shipping) pins the headline while the fold scrolls up under
  it until the dark band covers it; `"v1"` makes the headline recede and fade behind the
  cast. Changing that one word swaps them; any other value leaves the fold static. Details
  and the reasoning are in CLAUDE.md.
- **The reserved mobile image slots are both gone.** `.hero__art-slot` was replaced by the
  cast lineup; `.personalisation__art-slot` was closed on 2026-08-30 because the artwork
  isn't coming and its 128px was sitting between the capability chips and the carousel they
  control. The empty div stays in `index.html`, so restoring the reservation is one CSS rule.
- The Classic **page header** is now true vector (`.mark--classic-wide`). The brand
  tile's `.mark--classic` and `.mark--classic-word` are still crops of the old PNG —
  479×151 of raster, which softens on a retina display. Origins is vector throughout.
  Swapping the rest over is a URL plus an `aspect-ratio` value, nothing more.
- The Engagement Tools card hover is a placeholder treatment, as is the brand tile's
  lockup scale. The brand tile's hover *content* is not: the lockup swapping to the
  sub-brand word plus the revealed tagline is the intended design.

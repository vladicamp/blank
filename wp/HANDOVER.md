# Wild Sheep — WordPress handover

This is the static build of wildsheepgames.com, written so that porting it to a
WordPress theme is a **mechanical translation, not a rewrite**. Every page is
already split along the lines the theme will use, all content already lives in
data files rather than markup, and every asset is final.

Read this file top to bottom once before starting. It should take ~15 minutes.

> The repo's other two docs: **`CLAUDE.md`** in the root is the authoritative record of how
> the site is built and why — it goes deeper than this file on the front-end decisions, and
> wins if the two disagree. `README.md` is a short orientation. If you change behaviour
> described here, check whether the same claim lives in one of those.

---

## 1. Run it locally

No build step, no npm, no compiler. It is plain HTML/CSS/JS.

```bash
python3 serve.py
```

Then open <http://localhost:8756/>. That's it. Any static server works — the only
requirement is that it is served over HTTP, because the pages `fetch()` the JSON
data files and browsers block that on `file://`.

Pages:

| URL | File | Becomes (WP) |
|---|---|---|
| `/` | `index.html` | `front-page.php` |
| `/games/` | `games/index.html` | `archive-game.php` |
| `/games/game.html?g=<slug>` | `games/game.html` | `single-game.php` |
| `/brochure/` | `brochure/index.html` | `page-brochure.php` |

---

## 2. The one rule that matters

**`data/games.json` is the single source of truth.** The landing page carousels,
the library grid, the game pages and the brochure all read from it. Nothing about
a game is written into markup anywhere.

When you port to WordPress, `games.json` becomes a `game` custom post type and
`site.json` becomes an ACF Options page. **Nothing downstream needs to change** —
see §5 for the one function you swap.

---

## 3. File map

```
index.html            front-page.php
games/index.html      archive-game.php
games/game.html       single-game.php        (built out; content-gated — see §8)
brochure/index.html   page-brochure.php

data/games.json       →  'game' CPT + ACF fields      (§4)
data/site.json        →  ACF Options page             (§4)

assets/css/tokens.css →  theme.json + a small tokens stylesheet   (§6)
assets/css/site.css   →  style.css
assets/css/brochure.css  brochure stylesheet (keep separate — see §7)

assets/js/store.js    →  the ONLY file that changes  (§5)
assets/js/site.js     →  front-page rendering + header/carousels
assets/js/library.js  →  archive filtering/search/sort
assets/js/brochure.js →  brochure builder

assets/fonts/         →  theme fonts (§9)
assets/img/           →  media library or theme assets
```

### Template parts

`assets/css/site.css` is sectioned with banner comments that name the template
part each block belongs to, in page order:

`header` · `hero` · `personalisation` · `capabilities` · `value-props` ·
`brand-tiles` · `hot-games` · `upcomings` · `promotion-tools` · `contact` · `footer`

`upcomings` is used **twice** — the landing page and the library archive — so make it a real
shared partial rather than copying it. `footer` now carries a menu as well as the wordmark
and the hosting note; see gotcha #24.

The `partners` and `news` sections were removed from the page — their CSS is gone and
their markup with it. Their *content* is still in `site.json`; see §8.

Note the naming split on `promotion-tools`: the section **displays** as "Engagement
Tools", but the `#promotion-tools` anchor, the `promotion_tools` key in `site.json` and
the ACF field names all still say *promotion*. Only the display strings changed, because
those three are wired into the brochure builder and this port. Keep the keys.

`index.html` carries the same markers as HTML comments
(`<!-- == template-parts/hero.php == -->`), so you can cut the file into
`template-parts/*.php` by following them.

### The library grid

**`archive-game.php` lists released titles only.** Anything with `status: upcoming` is
excluded from the loop and appears instead on an Upcomings shelf at the **foot** of the
template, after the grid and its Show More — the same partial as the landing page's
`upcomings`. An unreleased title in the grid is a dead tile: not a link, no single view to
open. In the static build this is `WS.query(..., { released: true })`; in WP it is a
meta/date condition on the archive query. The shelf is filtered by the same taxonomy terms as
the grid and hides when it is empty; it also hides while a search term is active.

Counts, so you can check the port: 30 entries, 4 unnamed teasers excluded everywhere but the
shelf, 26 in the brochure, **23 in the grid**.

`archive-game.php` shows its first four tiles **two-up at 1.5x** and the rest three-up, on
one six-column grid (`span 3` == two per row, `span 2` == three). Which four is purely
positional CSS — `:nth-child(-n + 4)` — so it tracks whatever the archive is currently
filtered and sorted to, and needs no query, no meta field and nothing to keep in sync.

**Keep the selectors scoped to `.game-grid >`.** `.game-card` is shared with the landing
page's rails and `.rail-track` is itself a grid, so a loose `grid-column` flattens both
carousels. See gotcha #19.

The Download Brochure panel that used to close this template was removed; the brochure is
reached from the nav menu only.

---

## 4. Data model

### `game` custom post type

Each object in `games.json` → one `game` post. Field names below are **exactly**
the JSON keys, so keep them identical in ACF and the port stays a find/replace.

| JSON key | WP home | ACF type | Notes |
|---|---|---|---|
| `slug` | `post_name` | — | URL slug |
| `title` | `post_title` | — | |
| `summary` | `post_content` | — | 1–2 sentence description |
| `tagline` | `tagline` | Text | Short hook line |
| `brand` | `brand` | Select | `origins` \| `classic` |
| `category` | `category` | Select | `slots` \| `mini-game` |
| `status` | `status` | Select | `live` \| `upcoming` |
| `featured` | `featured` | True/False | Drives the landing "Hot Games!" rail |
| `release_date` | `release_date` | Date Picker | `Ymd` storage, `Y-m-d` return |
| `thumbnail` | `_thumbnail_id` | Featured image | Use the featured image, not an ACF field |
| `specs.*` | `specs` | Group | See below |

`specs` group (all Text, all optional):
`rtp`, `volatility`, `max_win`, `min_bet`, `max_bet`, plus **`variants`**
(Repeater — see below), plus the two range-specific sets below.

**The two ranges describe themselves differently and the schema keeps both.** Do not
try to merge them into one set of labels — they are different documents describing
different games, and the page renders only the keys a given entry carries.

| | ORIGINS keys | CLASSIC keys |
|---|---|---|
| structure | `layout` (Grid Layout, `6x4`) · `mechanic` (Win Mechanic, `4096 ways`) | `reels` (Game Type, `6 reels`) · `lines` (Lines, `4,096 ways`) |
| frequency | `hit_rate` · `feature_hit_rate` | *(the Classic brochure quotes none)* |
| other | `free_spin_cost` · `game_id` | `region` (`Global`) · `orientation` (`Mobile / Desktop`) |
| bands | 3 RTP configurations on six of seven | single RTP |
| options | Crazy Speed · Flexible Max Win · Adjustable RTP | Free Rounds · Bet Limits |

`sd` and `avg_feature_win` were considered and dropped — see below.

**`sd` and `avg_feature_win` are deliberately absent.** The Techtoniq `.pptx` sheets
state standard deviation for four Origins titles, where the brochure states a
volatility *word* for all seven; and they give average feature win per RTP band, where
their bands do not line up with the brochure's. Both brochures win. Do not populate
either from the packs — two volatility measures from two documents is how
contradictions get in.

**`specs.variants` replaced the old `rtp_variants`.** It is a repeater whose row is
`label` (`94`) + `rtp` (`94.0%`). **The first row is the shipping default and
duplicates the flat `specs.rtp` above it** — that duplication is deliberate, so
`brochure.js` and anything else reading `specs.rtp` keeps working without knowing
variants exist.

**Only RTP varies between bands — do not build a switcher.** One was built here and
removed. The source of truth (A4-wildsheep-ORIGINS_20260820.pdf) prints a headline RTP
plus its alternates and a *single* figure for hit frequency, feature frequency and
max win on all seven game pages. A control that swapped "configurations" implied
movement the source does not state. The alternates render beside the headline instead.
If per-band figures are ever published, `variants` already has room for them.

The game page also reads five optional top-level blocks, each rendered only when
present, so a title with catalogue fields alone still produces a valid page:

| JSON | ACF | Type | Notes |
|---|---|---|---|
| `tagline_lines[]` | `tagline_lines` | Repeater (Text) | Explicit hero line breaks; empty falls back to `tagline` |
| `options[]` | `options` | Repeater | `label` (Text) + `available` (True/False, default true). In JSON a plain string means available; `{label, available:false}` renders the grey cross the brochure uses for an option the game lacks. Tick/cross + label, **not** buttons |
| `story[]` | `story` | Repeater (Textarea) | Background story, **one row per paragraph** |
| `features[]` | `features` | Repeater | `title` (Text), `body` (Repeater of Textarea — one row per paragraph) |
| `symbols[]` | `symbols` | Repeater | `name` (Text), `file` (Image), `note` (Textarea, optional) |
| `symbols_title` | `symbols_title` | Text | Overrides the section heading — Spin My Drink uses "Customisable Booze", because its six bottles are switchable skins, not paytable symbols |
| `symbols_lead` | `symbols_lead` | Textarea | Optional lead under that heading |
| `buy_options[]` | `buy_options` | Repeater | `title`, `cost` (Text, may be empty), `body`, `symbol` (Image, optional) |
| `screenshots[]` | `screenshots` | Repeater | `file` (Image), `caption` (Text), `w`/`h` (Number — the file's pixel size). **`w`/`h` are required**: they emit the `width`/`height` attributes so the box is reserved before load, and they decide portrait vs landscape. In WordPress take them from `wp_get_attachment_metadata()` rather than storing them by hand |
| `platform` | `platform` | Text | Key into the shared reach table — see below |
| `demo_url` | `demo_url` | URL | Empty renders the placeholder; a URL renders the embed |
| `art.logo` / `art.backdrop` / `art.cast[]` | `art` | Group (2× Image + Repeater) | Transparent logo, hero backdrop, decorative cast; falls back to the featured image |

**`story` and `features[].body` are arrays of paragraphs, not textareas of prose.**
The renderer emits one `<p>` per row. It still accepts a plain string for
backwards compatibility, but a four-paragraph story pasted into one field renders
as one block. In WordPress make them repeaters, or split on blank lines on the way
out of the REST layer.

**`platform` is a key, not data.** The supported languages (10) and currencies (88)
are identical across every Origins sheet, so they live once in `games.json` under
`_meta.platforms.techtoniq` and each game references them by name. In WordPress this
belongs on an Options page as a repeatable "platform" record, with the game holding
a select. Do **not** copy 88 currency codes onto each post — and note the Classic
titles deliberately carry no `platform` at all, because they come from a different
supplier and Techtoniq's reach does not describe them.

`art.cast[]` was `art.characters[]` before the game-page rebuild; the art itself now
lives at `assets/img/games/<slug>/` alongside `logo.png`, `backdrop.jpg`,
`sym-*.png` and `buy-*.png`, with the catalogue thumbnail still at
`assets/img/games/<slug>.jpg`.

`art.logo` picks the composed hero over the flat-thumbnail fallback. Nothing bleeds
past the band any more — `--bleed` and `.game-hero--bleed` were removed, see gotcha 7.

An importable field group is provided: **`wp/acf-fields.json`** → ACF → Tools →
Import Field Groups. **It is partial — treat the tables above as the spec, not the file.**
Precisely what it is missing:

- the `specs` fields `feature_hit_rate`, `free_spin_cost`, `game_id`, the whole
  `variants` repeater, and **every Classic key** (`reels`, `lines`, `region`,
  `orientation`). It carries nine spec fields — `rtp`, `volatility`, `max_win`,
  `layout`, `mechanic`, `hit_rate`, `bonus_buy`, `min_bet`, `max_bet` — and
  `bonus_buy` is the one field there the page no longer renders at all, since the
  Buy Bonus carousel enumerates every tier;
- **all ten** optional game blocks (`tagline_lines`, `options`, `story`, `features`,
  `symbols`, `buy_options`, `screenshots`, `platform`, `demo_url`, `art`);
- any Options-page group at all for `site.json`, including `_meta.platforms`.

It covers the `game` post type's core fields and nine spec fields, and that is all. Extend
it, or build the group by hand from the tables above — either is fine, ACF regenerates its
field keys on import.

> **Both ranges carry real figures, each from its own brochure.** Origins' seven come
> from A4-wildsheep-ORIGINS_20260820.pdf; twelve Classic spec panels from
> A4-wildsheep-classic.pdf; and the six Joker Win Hits titles' hit frequencies and feature
> blocks from Wild Sheep Joker Win Hits Series.pdf, which is also the only source for
> Megaways, Win Boost and Win Stepper. `epic-stars` appears in no document and is the only
> entry left on invented figures — it carries
> `specs_provisional: true`, which prints the placeholder note inside the spec band.
> An entry with an empty `specs` object renders without a spec table — nothing breaks
> either way.
>
> **The Classic brochure carries no prose at all** — no stories, features or buy
> tiers — so those pages are hero → spec band → demo by design, not for want of data
> entry.
>
> **Classic artwork currently ships with no licence credit.** Blueprint's
> `Product and Legal Requirements.docx` names them as licence holder and asks for
> that to appear on associated artwork. Publishing without it was an explicit
> decision taken on 2026-08-25, not an oversight — but if it is revisited, it is one
> optional field on the game plus one line in the hero template.

### Filters

The library's four filter chips mix two different fields, which is deliberate:

- `Slots` / `Mini Game` match `category`
- `Origins` / `Classic` match `brand`

`WS.query()` in `store.js` handles both with one slug. Keep that behaviour; it is
what lets one filter row cover both taxonomies. In WP, register `brand` and
`category` as taxonomies and query with a `tax_query` using an `OR` relation, or
keep them as ACF selects and use a `meta_query` — either works.

### `site.json` → ACF Options page

Everything else — company details, hero copy, the personalisation statement, capability
cards, value props, brand tiles, promotion (Engagement) tools, the contact form's field
list, nav, and the brochure's front matter. Mostly Repeaters. It is all editable copy;
none of it is hard-coded in markup.

Three optional fields drive content-gated blocks — each renders only when present, so an
empty one is a valid state rather than a hole:

| JSON | ACF | Type | Notes |
|---|---|---|---|
| `capabilities[].art` | `art` | Image | Illustration bottom-right of the carousel card. Empty for all four today. |
| `value_props[].link` | `link` | Group: `label` (Text) + `href` (Text/Link) | The green "Read more →" that runs on at the end of that paragraph. Only Engagement Tools has one. |
| `promotion_tools.items[].icon` | `icon` | Textarea | SVG path `d` data for the card's line icon. Stroke is styled in CSS — store geometry only, no markup. |
| `brand_tiles[].tagline` | `tagline` | Text | Revealed under the mark on hover/tap. Hover state only — the resting tile is unchanged. |
| `brand_tiles[].mark_hover` | `mark_hover` | Text | The mark the lockup swaps to on hover, as a `.mark--<value>` class suffix. Omit and the lockup stays put. |

**`personalisation.chips` does not exist and must not be re-added.** The chips under the
statement are the capability carousel's tab strip and render from `capabilities` itself,
so chip *n* selects card *n* and the two lists cannot drift. In WP, render them from the
capabilities Repeater the same way.

`news` and `partners` are still in the file but **nothing renders them** — both are kept
for a later phase. See §8.

---

## 5. The only JavaScript that changes

`assets/js/store.js` exposes `WS.loadData()`. It is the single place the site
reads content from:

```js
async function loadData() {
  const [games, site] = await Promise.all([
    fetch(`${base}data/games.json`).then(r => r.json()),
    fetch(`${base}data/site.json`).then(r => r.json()),
  ]);
  ...
}
```

Two ways to port it, both fine:

**(a) Server-render the data (recommended).** In `functions.php`, build the same
shape and hand it over with `wp_localize_script` / `wp_add_inline_script`:

```php
wp_add_inline_script('ws-store',
  'window.WS_DATA = ' . wp_json_encode($payload) . ';', 'before');
```

Then `loadData()` becomes `return window.WS_DATA;`. No fetch, no REST, fastest.

**(b) Keep it fetching**, pointing at `/wp-json/wildsheep/v1/catalogue`, and
register that route to return the identical JSON shape.

Either way **only this function changes.** `site.js`, `library.js` and
`brochure.js` never touch WordPress.

Also note: every page declares `<html data-root="…">` and `store.js` reads it, so
the site works from any subdirectory. In the theme, emit
`get_template_directory_uri()` (or `home_url('/')`) there.

---

## 6. Design tokens

`assets/css/tokens.css` holds every colour, type size, and spacing value,
measured from the XD comp at its 1920px canvas. Port the palette and font sizes
into `theme.json` so the block editor offers the right swatches, and keep
`tokens.css` loaded for the values `theme.json` can't express (the fluid
`clamp()` type scale, the layout rhythm).

| Token | Value | Use |
|---|---|---|
| `--ink` | `#2E2E2E` | Body text, dark bands, **and all display type** — it matches the wordmark, and there is deliberately no blacker ink. (An `--ink-strong: #000` used to exist for display type; it was removed, not renamed.) |
| `--paper` | `#F7F7F7` | Page background |
| `--green` | `#27DB88` | Every CTA, border, interactive accent |
| `--green-dark` | `#12A863` | Hover / text-on-light contrast |
| `--purple` | `#9445FF` | Wild Sheep + Origins |
| `--purple-light` | `#A15EFD` | Purple **on the dark band** — see gotcha #8 |
| `--orange` | `#FF932E` | Wild Sheep Classic |
| `--rule-w` | `2px` | The one stroke weight for the button language — buttons, carousel arrows, the sort select, the demo frame. Change it there, not per-rule. |
| `--rule-invert` / `--rule-invert-50` | 22% / 50% white | Hairlines on dark and on brand colour. The Engagement Tools cards use the 50% one and deliberately sit **outside** the `--rule-w` button language. |
| `--sec-y` | `180px` @1920 | The section rhythm. The dark fold and the Upcomings block are built on it — see CLAUDE.md. |
| `--container` | `1530px` | Content column (195px gutters at 1920) |
| `--lh-tight` / `--lh-lead` / `--lh-body` | `0.82` / `1.24` / `1.45` | Display, oversized standfirst, prose |

**Weight is a two-step system, not a per-rule choice.** Prose is **400**; **700** is the
only step up, for `<b>`, buttons, form status and small uppercase meta. **300** is reserved
for the two oversized standfirsts (the personalisation statement, the brochure cover).
**Nothing sits at 500.** The body default used to be 500, which meant every prose rule had
to declare 400 to undo it — and the rules that forgot ran a step heavier than the copy
beside them. If you find yourself writing `font-weight` on a prose rule, the default is
already right.

---

## 7. The brochure

**What it does.** `/brochure/` builds a print-ready A4 document from the live
catalogue: a brand-coloured cover carrying the cast lineup and the title counts, two
overview sheets ("Why Wild Sheep" and "What you get") that reuse the site's own capability
illustrations and promotion-tool icons, an Upcomings sheet, then **one sheet per game**
with its key art, spec grid and whatever prose, symbols, screenshots and buy options it
has, and a closing contact page.

**There are THREE editions, chosen by `?scope=all|origins|classic`** (default `all`) —
28, 12 and 20 pages respectively. This reversed an earlier "one brochure only" rule on an
explicit client call (2026-08-31).

**The scope filters by RANGE and nothing else.** There is still no filter- or
search-scoped brochure: `brochure.js` reads `scope` and `print` and no other parameter,
and `library.js` does not pass the library's active filter into the link. That half used
to exist and quietly produced brochures nobody had asked for. **Don't reintroduce it** —
the header comment in `brochure.js` says so too.

**One game per sheet, never two.** Each sheet carries that title's own key art; doubling
games up turns the document back into a list.

**How the PDF is produced today.** The button opens the document and calls
`window.print()`; the user picks "Save as PDF". This was chosen deliberately: the
brochure is *HTML and CSS*, so its design is editable by anyone who can edit CSS,
the real fonts and vector logos are preserved, and the text in the resulting PDF
is selectable rather than a screenshot.

The trade-off is the print dialog, and that the user must leave
"Background graphics" on for the brand colours.

**Recommended phase-2 upgrade — true one-click download.** Keep the exact same
template and stylesheet and render them server-side:

- **Best fidelity:** headless Chrome via
  [Browsershot](https://github.com/spatie/browsershot) or a small
  `wp_remote_post` to a rendering service. It is literally the same page, so
  output is identical to what you see now.
- **No-Node option:** [Dompdf](https://github.com/dompdf/dompdf) or **mPDF** via
  Composer. Both handle this layout; mPDF has better `@page` and font support.
  You will need to simplify a few modern CSS bits (`aspect-ratio`, CSS `mask`)
  for Dompdf specifically.

Then wire a `admin-post.php` / REST endpoint that streams the PDF with
`Content-Disposition: attachment`, and point the button at it. **Cache the result as
three transients — one per edition — keyed on the newest `post_modified` in the `game`
CPT**, so each regenerates only when a game actually changes.

**There are THREE editions now, not one document.** `?scope=all|origins|classic` filters
by range only; `brochure.js` reads that and `print` and nothing else. Page counts are
**28 / 12 / 20**, at **one game per sheet** — never two.

Everything is sized in `mm`. `@page { margin: 0 }` and each sheet is a fixed
`height: 297mm` with `overflow: hidden` — **the whole A4 page, not a content box inside a
margin**. Both of those are load-bearing and are the difference between a clean PDF and a
broken one:

- The margin is zero because Safari and Chrome draw their own header, footer and page URL
  *inside* the `@page` margin. Give them room and they use it.
- The height is `height`, not `min-height`, because a growable box whose content bottom
  lands exactly on 297mm gets tipped over by rounding and paginates a near-empty extra
  page after every sheet.

**A server-side renderer needs the same care, plus one more:** Dompdf and mPDF have
weaker support for the constructs this document leans on. The brochure deliberately avoids
CSS `mask`, `color-mix()` and `:has()` for exactly this reason, and paints its brand
colours as inline `<svg>` rather than as `background`, so they survive an engine that
drops backgrounds. Keep that if you port it. If you add content to a sheet, re-measure —
the tallest sheet's intrinsic content is 284.9mm against the 297mm page.

---

## 7b. The game page's two CTAs

`single-game.php` branches on `brand` for its primary button:

| Range | Button | Target |
|---|---|---|
| `origins` | **Rebrand This Game** | `#request-demo` — a form rendered **on the same page** |
| `classic` | **Request Demo** | the landing page's form |

Origins is the range that can be rebuilt as a branded exclusive, so its CTA sells that and
scrolls rather than navigating away. The on-page form is built from the same
`site.contact.fields` list the front page uses — **do not create a second field group for it**
— plus a hidden `game` input so the enquiry identifies the title. Wire both forms to the same
handler.

There is no back-to-library link in the hero, and no range/type/date meta line under the
title; the header and footer menus both carry the library link, and the range is already in
the header lockup.

**The Origins form band is `--purple` and the footer directly beneath it must have no top
margin** — two purple fields with a gap between them read as a seam. Its submit button is the
**filled** variant: the outline one is green-on-green and fails contrast on purple.

**The hero is a fixed-height fold.** The logo is sized by a definite slot
(`height` + `object-fit: contain`), not a width cap, and `.game-hero` carries a `min-height`
floor — plus a flat `46rem` floor for the stacked layout under 900px. Keep all three when
porting, or the fold's height starts tracking each title's artwork and copy again.

**The demo frame's air is owned by `#demo` alone**, with
`main > section:has(+ #demo):not(.band-dark):not(.band-purple) { padding-bottom: 0 }` stopping
the preceding section paying for it too. Margins do not collapse against padding, so without
that rule the gap above the frame is larger than the gap below. **Keep the `:not()` guard** —
without it the rule also strips a coloured band's inner padding, and on Classic pages (where
`#spec` sits directly above `#demo`) the last spec row ends up flush against the dark band's
bottom edge.

---

## 8. What is deliberately unfinished

- **One title is in no document.** `epic-stars` still carries invented figures and is
  flagged `specs_provisional`. Everything else in the catalogue is transcribed. `games/game.html`
  is fully built out — hero, spec band, story + core features, symbols, screenshots and
  the Buy Bonus carousel — and every block after the hero is skipped when its data is
  absent, so the Classic pages (spec panel only, no prose in A4-wildsheep-classic.pdf)
  render correctly as hero → spec band → demo.
- **Bamboonanza's Core Features deliberately do not follow the source of truth**, and
  this is the one open editorial question in the data. The brochure's block there is
  Iron Gate's copy and contradicts Bamboonanza's own spec panel on the facing page. See
  `_meta.source_conflicts` in `games.json`.
- **Two titles have no background story** (`spin-my-drink`, `high-rollers-cash`) — the
  brochure gives them operator-facing feature blocks instead, and the page is
  content-gated so it simply renders Core Features with no story column.
- **`demo_url` is still empty for every title**, so every game shows the demo
  placeholder. Filling it renders the embed with no template change.
- **`symbols` is the full paytable.** Every high and low tier is its own entry (94 across the
  seven Origins titles); an earlier build collapsed each range into one "High"/"Low" tile.
  Names for the tier-coded files describe the artwork, because the packs name them only
  `H1.png`/`L2.png`. The `note` is optional and renders as a **reveal** — hover on desktop,
  tap on touch — never as printed caption text. Only entries that have a note get the toggle
  button and the marker.
- **The hero is one full-bleed alpha PNG** (`assets/img/hero-lineup.png`) that deliberately
  overflows the viewport and is cropped by the screen edge — 190% wide on a phone, so the
  middle of the cast stays large. `.hero` is NOT inside the content column and carries
  `overflow-x: clip`; the artwork is centred with `left: 50%` + `translateX(-50%)`, because
  `margin: auto` cannot centre a box wider than its container. It has no bottom padding: the
  artwork's baseline is the fold's bottom edge, so the characters stand on the dark band.
  There are **no CTA buttons in the hero** — that is the client's decision, not an omission.
  The dark band's top edge must land on the artwork's own table line (y=1207 of 1307), so the
  flat cut hides behind it and the hooves/bottles overhang; that is what the wrapper and its
  `margin-bottom: -3.49%` achieve. Served as **WebP q85 at native size (454KB)** via
  `<picture>`, with the lossless PNG as master and fallback. Do NOT re-palette it (banding)
  and do NOT downscale it — measured, downscaling costs more fidelity than it saves bytes.
- **Backdrops must be roughly square.** Every `art.backdrop` is 0.93–1.01 aspect (bar one
  portrait phone-native title). The hero band runs from ~2.3:1 on desktop to ~0.51:1 on a
  phone, and only a square-ish source survives `object-fit: cover` at both ends. Three files
  were rebuilt or replaced for this: `fortunes-of-sparta` (was 2.09:1 widescreen, now
  composited onto a square canvas over a blurred copy of itself), and
  `joker-win-hits-win-boost` / `-win-stepper` (were gameplay screenshots — those two titles
  have no asset pack, so they now use the Joker family's shared stage). Originals are kept
  beside them as `*-OLD-*.bak`. **Check the aspect of any new backdrop before adding it.**
- **Only 4 of 23 released titles have screenshots** (`blob-invasion`, `spin-my-drink`,
  `joker-win-hits-win-boost`, `joker-win-hits-win-stepper`). The `screenshots` block is
  content-gated, so the other 19 pages simply omit that row — it is missing assets, not a
  broken template. One shipped file is badly cropped: `joker-win-hits-win-boost/shot-base-game.jpg`
  cuts off the bottom of the reels.
- **News is removed from the page.** Three sample items are retained in `site.json` under
  `news`, marked not-rendered. When the feature is built they become ordinary WP posts;
  the markup and CSS were deleted, so this is a build, not a re-enable.
- **The demo form does not submit.** It validates and reports locally. Wire it to
  Gravity Forms / WPForms / WP Mail SMTP. The field list is data-driven from
  `site.json` → `contact.fields`.
- **Partner logos removed from the page.** Betpanda, SOFTSWISS, Spacehills and OdiBets
  came from the XD file and are **not confirmed as cleared for public display**, so the
  "Trusted by" row was pulled. The logo files and their `site.json` entry are retained so
  the row can return once they're cleared — clear them before rebuilding it.
- **The rails are no longer padded.** An earlier build repeated cards up to nine via a
  `repeatTo()` helper; that is gone. Hot Games carries the seven `featured` titles
  newest-first and Upcomings the seven unreleased ones soonest-first, both sorted
  explicitly in `renderLanding()` rather than relying on the order `games.json` happens
  to be written in. Reproduce the sort in the theme; don't reintroduce padding.
- **`capabilities[].art` is empty for all four cards.** The slot is built and content-gated;
  drop in a path and the illustration appears bottom-right. No template change needed.
- **Placeholder hovers.** The Engagement Tools card (lift + rule/icon going solid) and the
  brand tile (the lockup scaling) are both standing in for real treatments.
- **`.mark--classic-wide` (the Classic page header) is now true vector**; the supplied
  SVG's viewBox was the full 1920x1080 board and is cropped in the repo copy to the
  artwork's 1685x546. **`.mark--classic` is still the old PNG**, and the brand tile's `.mark--classic-word` is
  a crop of that same file (479×151), so it softens on a retina display. Origins is true
  vector. Swap the `--mark` URL and `aspect-ratio` when the Classic SVG lands; nothing else
  changes.

---

## 9. Fonts and licensing

Two typefaces, both self-hosted in `assets/fonts/`:

- **SCHABO Condensed** (`SCHABO-XCondensed.otf`) — all display type.
- **Space Grotesk** (Light/Regular/Medium/Bold) — all body text. SIL Open Font
  License, unrestricted for web.

SCHABO is distributed free for personal and commercial use. **Confirm the licence
covers web embedding before launch** — it is the one asset here with any
ambiguity.

Both are shipped as `.otf`/`.ttf`. Converting them to `.woff2` will cut roughly
60–70% off the font payload; worth doing during the port (`fonttools` with
brotli, or any online converter).

---

## 10. Gotchas already hit — don't undo these

These cost time to find. They are all load-bearing.

1. **`font-synthesis: none` in `tokens.css`, and `font-weight: 400` on every
   display-font rule.** SCHABO ships only a 400 weight. Heading elements ask for
   700, so the browser fakes bold by smearing glyphs sideways, which destroys the
   counters and makes the display type look like solid blocks. If display type
   ever looks "melted", this is why.

2. **Logos are painted with CSS `mask`, not `<img>`.** `.mark--wordmark`,
   `.mark--wordmark-outline`, `.mark--origins`, `.mark--origins-wide`, `.mark--classic`,
   `.mark--classic-wide`,
   `.mark--changers`, `.mark--sheep` in `site.css`. The artwork is single-colour, and the
   mask means `color` alone recolours it — one file serves the dark header, the purple
   footer, and the white-on-brand tiles. Swapping these back to `<img>` breaks every
   colourway.

   **Crop a new file's `viewBox` to its artwork before adding it.** Brand exports routinely
   centre the lockup on a big empty board — `wildsheep-outline.svg` arrived as 1684×349 of
   art on a 1920×1080 canvas. Masked as-is, `aspect-ratio` describes the *board*, so the
   mark renders small and floating inside its own slot.

3. **Never nest `/*` inside a CSS comment.** A stray `*/` closed a banner comment
   early and silently ate the `box-sizing: border-box` reset, which made every
   `.container` 64px too wide and put a horizontal scrollbar on the whole site.

4. **`height: auto` on `.game-entry__art`.** An `<img>`'s `height` attribute is a
   presentational hint that counts as a specified height, which makes CSS
   `aspect-ratio` do nothing. Without the reset the brochure's key art crops to a
   portrait sliver.

5. **`.game-card__media` must be `display: block`.** It is a `<span>` (so the
   whole card can be one `<a>`), and inline elements ignore `aspect-ratio`, so
   cards collapse before their image loads.

6. **The game-page header is `position: fixed`, not `sticky`.** Sticky still takes
   up flow space, which leaves a paper strip above the hero and stops the purple
   gradient reaching the top of the viewport. Scoped to `body[data-page='game']`
   so the landing and library headers stay sticky. The hero's `padding-top` is the
   only thing keeping the copy clear of the fixed bar — don't drop it.

7. **The hero band is `inset: 0` and nothing bleeds past it. Don't "restore" the
   bleed.** The XD mockup had the logo cross the band's bottom edge onto paper, and the
   hero reserved that distance as `padding-bottom` so it had somewhere to land. That
   reserve rendered as a slab of dead paper between the hero buttons and the spec band,
   and was removed on request: the band now fills the hero and the logo is centred
   inside it, in the empty half beside the copy. Symptom if reintroduced: a white gap
   under the Request Demo button on every game page.

8. **Purple *type* on the dark band must be `--purple-light`.** `--purple` (#9445FF) on
   `--ink` measures 2.95:1, below the 3:1 large-text floor; `#A15EFD` clears it at
   3.58:1. Applies to `.spec-band__title` and the alternate RTP figures.

   **Two deliberate exceptions — don't "fix" them.** The CHANGERS brush script and the
   footer wordmark stay `--purple` on the dark ground: they are brand artwork rather than
   type, and this was an explicit call. Likewise the menu links hover to `--green` on
   `--purple` (~2.4:1) because green is the site's one interaction colour and that was
   judged to outrank the measurement.

9. **Verifying colour on the game page needs transitions disabled.** The header
   and its marks animate colour, so reading `getComputedStyle` right after a state
   change returns an interpolated value — it reads as though the rule never
   applied. Inject `*{transition:none!important}`, force a reflow, then read.

10. **`.bleed-clip` must be `overflow-x: clip`, never `hidden`.** It is what lets carousel
    cards run past the content column and be cut at the *screen* edge instead of sliced
    mid-artwork at the column. `overflow-x: hidden` implies `overflow-y: auto`, which makes
    a scroll container and clips vertically too. Symptom: content mysteriously cropped at
    the bottom of a section.

11. **`initRail()` measures the track's parent *content* box, not the rail wrapper.** The
    Upcomings rail is padded on the left so the first card lines up with the heading while
    the rail itself runs to the panel edge — two different widths. And `clientWidth`
    *includes* padding, so it is subtracted. Get either wrong and the last card overshoots
    or stops short of the edge.

12. **`data-rail-flush` is opt-in, and the capability carousel must not have it.** It parks
    the last card on the far edge instead of on the next whole step, which is right for a
    rail of several small cards (Hot Games, Upcomings) and wrong for the one-up capability
    carousel, whose last card is meant to rest flush *left*.

13. **Both brand-tile `[data-open]` selectors need the `:has()` prefix.** A bare
    `.brand-tile[data-open='true']` loses on specificity to
    `.brand-tiles:has([data-open='true']) .brand-tile`, so both tiles get the shut ratio and
    the push effect silently does nothing. Symptom: tiles never move, no error anywhere.

14. **`.symbol__art` must stay `display: flex`.** The rule doing the work is
    `max-height: 100%` on the image inside it. Against a *grid* area that percentage
    resolves to nothing, so every symbol renders at its natural size and the tall ones
    overflow into their own labels. Against a definite-height flex container it
    resolves. Symptom: a paytable that looks fine for square symbols and broken for
    portrait ones.

15. **Game logos must be trimmed to their alpha bounds before they are used.** The
    supplied exports centre artwork on a large empty canvas — one shipped as 647×521 of
    art on a 1200×675 board — so `max-width` describes the board and the logo renders
    small inside its own slot, with nothing in the console. This is the same trap as
    the SVG `viewBox` one in gotcha #2, in a different file format. If someone re-imports art
    straight from a supplier pack, expect it.

16. **`vector-effect: non-scaling-stroke` on the Engagement Tools icons.** Without it the
    stroke scales with the 24×24 viewBox and renders ~2.5px against a 1px card rule — the
    whole point of that treatment is that the box and the icon are one line weight.

17. **The hamburger is two bars, and the close transform is a `calc`.** Written as
    `calc((var(--bar-gap) + var(--bar-h)) / 2)` rather than a literal, so retuning the gap
    can't desync the two arms of the X. It was grid before; auto rows in a fixed-height box
    stretch, which spread the bars and made the arms cross off-centre. It is flex now.

18. **`[hidden] { display: none !important; }` in the reset is load-bearing.** The UA's
    own `[hidden]` rule is weaker than any author `display`, so without the reset an
    element hidden from JS stays on screen if its class sets one. The library's Show More
    button did exactly that for months — `library.js` set `more.hidden = true`, `.btn` is
    `display: inline-flex`, and the button painted "Show More (0 left)" regardless.
    Symptom: you hide something in JS, nothing happens, no error anywhere.

19. **The library grid's span rules must stay scoped to `.game-grid >`.** `.game-card` is
    shared with the landing rails, and `.rail-track` is itself
    `display: grid; grid-auto-flow: column` — a bare `.game-card { grid-column: span 2 }`
    lands on every Hot Games and Upcomings tile and flattens both carousels. Both tiers
    also keep `aspect-ratio: 16 / 10`: the thumbnails have each game's logo baked in, so a
    wider ratio on the big four would let `object-fit: cover` crop it off.

20. **The header carries no bottom rule in either state**, and is fully transparent until
    `data-scrolled` flips. The old tinted-paper plate composited lighter than `--paper` and
    left a visible seam across the top of the first fold. While the menu is open the plate
    is dropped too (`body:has(.site-nav[data-open='true'])`) but the marks stay.

---

21. **The footer wordmark needs an explicit `max-width`.** `.mark` is `display: block`, and
    the footer wrapper is full width, so without a cap the mark stretches edge to edge —
    1376px at a 1440 viewport, which made the site's largest element its footer logo.
    `.site-footer__mark` is held to `--container` and `.site-footer__mark .mark` is capped;
    keep both when porting the footer template.

22. **Nothing unreleased may render as a link.** `isTeaser()` in `site.js` (`status ===
    'upcoming' || !slug`) is the single test, shared by `gameCard()`, `upcomingCard()` and
    `single-game`. Teaser cards are `<span>`, not disabled `<a>` — no destination means
    nothing in the accessibility tree and nothing focusable. In WordPress, whatever replaces
    `status` must keep driving this, or upcoming titles get clickable cards leading to empty
    pages.

23. **A lazily-loaded image needs a non-zero box, or it never loads.** `.shot img` has no
    CSS `aspect-ratio` — screenshots keep their own ratio — so the reserved box comes from
    the `width`/`height` attributes. Portrait shots are sized by a definite **width**;
    setting `width: auto` with a `max-height` instead gives a zero-width box, and a lazy
    image in a zero-width box never intersects the viewport, never loads, and stays zero.
    The box and the load end up waiting on each other. Symptom: screenshots that are
    simply absent, with no console error.

24. **The footer menu must not become a second link list.** It is rendered from the same
    `nav` array in `site.json` that the header's overlay menu uses — one source, so the two
    menus cannot end up naming different pages. Porting this to a WordPress **menu location**
    is right; giving the footer its own separate menu is the thing to avoid, because the next
    person to add a page will update one and not the other.

25. **The game-page footer takes the range's colour: purple for Origins, orange for
    Classic, white type and the white OUTLINE lockup on both.** It is driven by one
    attribute (`data-footer-brand`) over four custom properties (`--footer-bg`,
    `--footer-ink`, `--footer-note`, `--footer-mark`) whose defaults reproduce the ordinary
    dark footer — so the template sets the range and nothing else, and a page that sets
    nothing is unaffected.

    Use `.mark--wordmark-outline`, never the solid `.mark--wordmark`: the solid file paints
    as one flat silhouette in `--footer-mark`, which on a brand ground loses the sheep inside
    the W. The outline keeps it.

    **White on the orange does not meet WCAG AA — 2.22:1 against a 4.5:1 floor — and that is
    a known, deliberate client decision, not a defect.** An earlier build used ink (6.1:1)
    and was overruled so the two ranges match. Do not "correct" it during the port; raise it
    with the client if it needs revisiting.

## 11. Suggested port order

1. Theme skeleton + `tokens.css`/`site.css` + fonts. Confirm SCHABO renders
   crisply — that validates gotcha #1 immediately.
2. `game` CPT + import `wp/acf-fields.json`. Enter two or three real games.
3. Swap `loadData()` (§5). The library page should now work end to end.
4. Cut `index.html` into template parts along the existing comment markers.
5. Brochure: ship the print version first (it already works), then add the
   server-side renderer.
6. Game detail page — the template is built, content-gated and fully populated for
   the Origins range, so there is nothing to build here. The Classic range's specs
   are waiting on Blueprint (§8), not on data entry.
7. Contact form. News stays out of scope for this phase (§8).

26. **A card sub-element that stops being `position: absolute` must be given
    `display: block` in the same rule.** `.game-card__meta` is a `<span>` — the card is one
    `<a>`, so its parts have to be phrasing content. The desktop rule blockifies it only as a
    side effect of `position: absolute`. The mobile rule makes the strip static, and the span
    silently reverted to `display: inline`, whose horizontal padding does not indent a
    block-level child: the game title sat flush on the card's edge while its 17.6px of
    padding computed correctly and did nothing. Same family as gotcha #5.

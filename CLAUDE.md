# CLAUDE.md — wildsheepgames.com

Static marketing + game-catalogue site for Wild Sheep, built from an Adobe XD comp.
Plain HTML/CSS/JS. **No build step, no npm, no framework.** Keep it that way unless
the user explicitly asks otherwise.

## Docs in this repo — read this before changing any of them

| File | For | Authority |
|---|---|---|
| `CLAUDE.md` (this file) | How the site is built and why; every load-bearing decision | **Wins.** If another doc disagrees, that doc is stale. |
| `README.md` | Short human orientation — run it, edit content, what's provisional | Derivative |
| `wp/HANDOVER.md` | The WordPress port — file map, data model, gotchas for an external dev | Derivative, and deliberately duplicates the gotchas because that reader never opens this file |
| `_incoming/README.md` | Provenance: which source document won where, and every conflict between them | Derivative, but the only record of *why* a figure is what it is |

**When you change behaviour, grep the other two for the same claim.** They drifted badly
once: after the brochure was made a single whole-catalogue document, both still described
it as inheriting the library's filter, which is exactly the kind of thing a later session
reads and faithfully rebuilds. The docs are only useful while they agree.

## Where things stand — 2026-09-02

The catalogue, both content passes, the brochure rebuild and the Free Branded Game page
are **done**; what is left is listed under *Provisional* and *Open decision* at the foot
of this file.

| | |
|---|---|
| Catalogue | **30 entries** — 26 named titles + 4 unnamed teaser slots. 10 Origins (7 released, 3 upcoming), 16 Classic. `WS.query()` drops the teasers, so the brochure shows 26; the library grid additionally drops the 3 named upcoming titles and shows **23**, with all 7 unreleased on its Upcomings shelf. |
| Specs | Transcribed from three PDFs, **not invented** — see `_meta.specs_source`. `epic-stars` is the one entry still on placeholder figures. |
| Prose | Origins has stories, core features, symbols and buy tiers. Classic has spec panels only — its brochure carries no prose, and that is its finished state, not a gap. |
| Art | All 23 released titles have a composed hero (logo + backdrop). `assets/img` is ~26MB. |
| Pages | Five routes: landing, library, game detail, brochure, free-branded-game. |
| Brochure | Three editions via `?scope=` — **all 28 pages, origins 12, classic 20** — one game per page. Rebuilt for print: see *Making the PDF match the preview*. |
| Verified | All 26 game pages plus landing/library/brochure/free-branded-game at 375, 768 and 1440: no broken images, no horizontal overflow, no console errors. Every brochure sheet measured against a 297mm page in all three editions. |

**Three things are waiting on someone else, not on code:**

1. **Bamboonanza's Core Features** — the brochure prints Iron Gate's copy there and it
   contradicts Bamboonanza's own spec panel. The page ships the correct features from the
   asset pack instead. Needs flagging to Techtoniq. See *Provisional*.
2. **Joker Win Hits Power 5's max win** — the Classic brochure says `5,000x bet`, the Joker
   series deck says `10,000x`. The newer brochure is shipped. A factor of two is worth a
   confirmation.
3. **Blueprint licence credit on Classic artwork** — published without one, an explicit
   decision taken 2026-08-25 with the requirement on the table.

## Run it

```bash
cd "/Users/eric/Documents/#BACKUP/#ERIC/CLAUDE/wildsheep-site2" && python3 serve.py
```

http://localhost:8756/ — must be HTTP, not `file://` (pages `fetch()` their data).

`preview_start` with a launch.json **name** does not work here: the preview launcher
is sandboxed out of `~/Documents`. Start the server with Bash (background), then
`preview_start` with `{url: "http://localhost:8756/"}`.

Routes: `/` · `/games/` · `/games/game.html?g=<slug>` · `/brochure/` · `/free-branded-game/`

## Source documents

All of these live outside the repo, under

```
/Users/eric/Documents/#BACKUP/#WORK2/9. may/WILD SHEEP/
```

and none of them is read at runtime — they are where the content in `data/games.json`
came from. **Precedence is newest-document-wins, and the conflicts are real:** see
`_meta.source_conflicts` in `games.json` and `_incoming/README.md`.

| Path (under the folder above) | Covers | Dated |
|---|---|---|
| `work11 (2026 e-brochure)/#pdf/A4-wildsheep-ORIGINS_20260820.pdf` | The 7 released Origins titles — specs, stories, core features, buy tiers | 2026-07/08 |
| `work11 (2026 e-brochure)/#pdf/A4-wildsheep-classic.pdf` | 12 Classic spec panels. **No prose at all.** Games identified by tile art, not text | 2026-07-26 |
| `work11 (2026 e-brochure)/ref/WSC games/Wild Sheep Joker Win Hits Series.pdf` | The 6 Joker titles — hit rates + feature blocks; sole source for Megaways, Win Boost, Win Stepper | 2026-02-17 |
| `ref/WSO asset Techtoniq/` | Origins art packs + `.pptx` sheets. Supplies only what no brochure carries: `game_id`, `free_spin_cost`, `symbols`, `_meta.platforms` | — |
| `work11 (2026 e-brochure)/ref/WSC games/` | Classic art packs (Blueprint) + their licence docs | — |
| `work8 (logo complete)/` | Brand lockups. Supplied SVGs sit on a 1920x1080 board — **crop the viewBox**, rule 3 | — |

`~/Downloads` is blocked to this process by macOS, so a PDF handed over from there has to
be copied into the folder above first.

## The two rules

**1. `data/games.json` is the single source of truth.** It drives the library grid,
the landing carousels, the game pages and the brochure. Never hard-code a game into
markup. Adding a game = one JSON object + art in `assets/img/games/`.

**2. `assets/css/tokens.css` is the only place colours, type sizes and spacing are
defined.** Never write a raw hex, px font-size, or magic spacing value in
`site.css`/`brochure.css` — use the token. If a value is genuinely missing, add a
token rather than inlining it.

## Design system

Measured from the comp at its 1920px canvas. Content column is 1530px (195px gutters).

| | |
|---|---|
| `--ink` `#2E2E2E` | body text, dark bands, **and all display type** — matches the wordmark; there is deliberately no blacker ink |
| `--paper` `#F7F7F7` | page background |
| `--paper-tint` `#F0EFF3` | one step off paper, to separate a section softly |
| `--green` `#27DB88` | every CTA, border, interactive accent |
| `--green-dark` `#12A863` | hover + text-on-light contrast |
| `--purple` `#9445FF` | Wild Sheep / Origins |
| `--purple-light` `#A15EFD` | purple **on the dark band** — `--purple` is only 2.95:1 there |
| `--orange` `#FF932E` | Wild Sheep Classic |
| `--rule-w` `2px` | the one stroke weight for the button language |
| `--rule-invert` / `--rule-invert-50` | 22% / 50% white hairlines on dark and on brand colour |
| `--sec-y` `180px` @1920 | the section rhythm the dark fold and Upcomings are built on |

Type: **SCHABO Condensed** (`--font-display`) for all display type, **Space Grotesk**
(`--font-body`) for everything else. Display scale `--d-xl`…`--d-2xs`, body scale
`--t-lead`…`--t-small`. All fluid `clamp()`, upper bound = the exact comp value.

**Weight is a two-step system, not a per-rule choice.** Prose is **400**; **700** is the
only step up, for `<b>`, buttons, form status and small uppercase meta. **300** is reserved
for the two oversized standfirsts (personalisation statement, brochure cover). **Nothing
sits at 500** — the body default used to, which meant every prose rule had to declare 400
to undo it, and the rules that forgot ran a step heavier than the copy beside them. If you
find yourself writing `font-weight` on a prose rule, the default is already right.

Prose has three steps on the landing page and they are not interchangeable: `--t-lead` (48)
for the one statement, `--t-lg` (23) for section leads and the capability card, `--t-body`
(18) for body copy, `--t-small` (13) for meta. `--t-btn` (21) is UI only, never prose.

One button language sitewide: `.btn` (`--rule-w` green rule, green label), `.btn--solid`
for the filled variant. Don't invent new button styles. `--rule-w` is the single stroke
weight for every outline that speaks that language — buttons, carousel arrows, the sort
select, the demo frame. Change it there, not per-rule.

The Engagement Tools cards deliberately **left** that language: they are hairline panels
at `--rule-invert-50`, not buttons, because six 2px green-language boxes competed with the
page's real CTAs. Their rule weight and their icon's stroke are one custom property
(`--card-line-w`), and their colour another (`--card-line`), so the box and the icon can
never drift apart — including on hover, where both go solid together.

## Architecture

```
index.html          landing        (sections marked <!-- == template-parts/X.php == -->)
                    hero · personalisation+capabilities+value-props (one dark run) ·
                    brand tiles · hot games · upcomings · promotion tools · contact
games/index.html    library        2-up top four + 3-up grid, filter/search/sort.
                    Released titles only; the unreleased ones sit on an
                    Upcomings shelf between the filter bar and the grid.
games/game.html     detail         hero · spec(+RTP bands, options, reach) ·
                                   story(+features, shots) · symbols ·
                                   buy-bonus rail · demo (frame only, no heading).
                                   Footer takes the range's colour. An unreleased
                                   title renders the teaser state instead.
brochure/           A4 PDF document, built from live data. THREE editions via
                    ?scope=origins|classic|all, ONE GAME PER PAGE — see
                    "Three brochure editions" below
free-branded-game/  the Free Branded Game offer — one purple field top to bottom,
                    header fixed with white marks so the colour reaches pixel
                    zero. Target of the hamburger's "Free Branded Game!" and of
                    the Branded Exclusive card's link. Its form renders from the
                    same site.contact.fields as the other two

data/games.json     catalogue  ← source of truth (also `_meta.platforms`, the
                    once-stored language/currency reach referenced by `platform`)
data/site.json      marketing copy, nav, contact fields, brochure front matter

assets/css/tokens.css   design tokens + @font-face
assets/css/site.css     all site styles, sectioned by template part
assets/css/brochure.css brochure only — keep separate

assets/js/store.js      WS.loadData/query/fmtDate/escape — the ONLY data access point
                        query() takes `released` to drop unreleased titles
assets/js/site.js       header, nav, FOOTER MENU, carousels, landing render,
                        gameCard(), upcomingCard(), isTeaser(),
                        initHeroParallax() — v2 measures one number once,
                        v1 sets --hero-p per frame; switch in index.html
assets/js/library.js    library page — calls gameCard(), upcomingCard() and
                        initRail() from site.js, so site.js must be loaded
                        first (plain globals, no modules)
assets/js/brochure.js   brochure builder — its SPEC_LABELS must stay in step with
                        the one in games/game.html

assets/img/games/<slug>.jpg        catalogue thumbnail (3:2)
assets/img/games/<slug>/           logo.png · backdrop.jpg · sym-*.png ·
                                   buy-*.png · cast-*.png · shot-*.jpg
assets/img/games/upcoming/         alpha cut-outs for the unnamed teaser slots
                                   (`art.cutout`), floated on purple
assets/img/logos/                  brand marks, painted via CSS mask

_incoming/          the superseded first extraction, kept as provenance only —
                    nothing reads it; its README records every source conflict
wp/HANDOVER.md      WordPress port guide (read before any CMS work)
wp/acf-fields.json  importable ACF field group — PARTIAL, see HANDOVER §4
```

`store.js` is the seam for any CMS. Porting to WordPress or a headless CMS should
change `loadData()` and nothing else.

Every page declares `<html data-root="…">` (`""` at root, `"../"` one level deep) and
`store.js` reads it. New pages must set it correctly or all asset paths break.

## Hard rules — these are load-bearing, do not undo them

1. **`font-synthesis: none` in tokens.css, and `font-weight: 400` on every rule that
   sets `--font-display`.** (The prose default is also 400, but these declarations are
   load-bearing for a different reason and must stay explicit.) SCHABO ships only a 400 weight; heading elements request
   700 and the browser fakes bold by smearing glyphs sideways, which destroys the
   counters. Symptom: display type looks like solid blocks.

2. **Never nest `/*` inside a CSS comment.** A stray `*/` closes the comment early and
   silently eats the following rules. This already ate the `box-sizing` reset once and
   put a horizontal scrollbar on the whole site.

3. **Logos are painted with CSS `mask`, not `<img>`** — `.mark--wordmark`,
   `.mark--wordmark-outline`, `.mark--origins`, `.mark--origins-wide`,
   `.mark--classic`, `.mark--classic-wide`, `.mark--changers`,
   `.mark--sheep`. Brand exports often centre the artwork on a large empty board
   (`wildsheep-outline.svg` shipped as 1684x349 of art on a 1920x1080 canvas) — **crop the
   file's `viewBox` to the artwork** before adding one, or `aspect-ratio` describes the
   board and the mark renders small inside its own slot. The artwork
   is single-colour so `color` alone recolours it; one file serves the black header,
   purple footer and white-on-brand tiles. Switching to `<img>` breaks every colourway.

   Two traps when cutting a new mark out of an existing file. **Select shapes by geometry
   across `path, rect, circle, ellipse, polygon, polyline, line`** — the Origins word's two
   "i" stems are `<polygon>` and one dot is a `<circle>`, so a `path`-only extraction
   silently renders "Or g ns". And **an XML comment cannot contain `--`**: pasting a CSS
   class name like `.mark‑‑origins‑word` into one makes the whole file invalid and the mask
   paints nothing, with no console error. Same family as rule 2, different language.

4. **`height: auto` whenever CSS `aspect-ratio` is used on an `<img>`.** The `height`
   attribute is a presentational hint that counts as a specified height and makes
   `aspect-ratio` a no-op.

5. **Card sub-elements must be `display: block`.** `.game-card__media` etc. are spans
   (so the whole card is one `<a>`), and inline elements ignore `aspect-ratio`.

   **This bit twice.** `.game-card__meta` is blockified in the base rule only as a *side
   effect* of `position: absolute`. The mobile override turns the meta into a static strip
   under the art — and the moment `position` went back to `static`, the span reverted to
   `display: inline`, whose horizontal padding does not indent a block-level child. The
   game title sat flush against the card's edge with 17.6px of padding computing correctly
   and doing nothing. If you take `position` off one of these spans, put `display: block`
   on in the same breath.

## The landing page

### One rhythm, top to bottom

The fold's spacing is `--sec-y` throughout: top edge → statement, carousel → value props,
value props → bottom edge. The **only** exception is the chips, which sit a **quarter** of
that (`--sec-y / 4`) above the carousel — they are its tab strip (chip *n* selects card *n*),
so they have to read as attached to the thing they drive rather than as part of the block
above. It was `/ 2` until 2026-08-30, which still left 68px at 1440 and had them floating
between statement and carousel, belonging to neither; `/ 4` is 34px at 1440 and 20px on a
phone, which is the tab-strip distance the pairing needs.

On a phone the gap is that 20px and nothing else. It used to measure 148px, because
`.personalisation__art-slot` — an empty reserved div below the chips — was holding 128px of
it; that slot is now closed (see *Mobile*). If this gap ever grows again, check the slot
before touching the padding.

### The dark band is one run, not three sections

Personalisation, the capability carousel and the three value props are three
`.band-dark` sections stacked with their inner padding zeroed so they read as a single
field. The chips under the statement are **the carousel's tab strip**, not decoration:
they are rendered from the same `capabilities` array as the cards, so chip *n* selects
card *n* and neither list can drift from the other. `initCapabilityChips()` in `site.js`
binds them; `initRail()` returns `{ goTo, onChange }` for exactly this.

`personalisation.chips` no longer exists in `site.json` — deleting it is what makes the
two lists impossible to desync. Each capability takes an optional `art` path, rendered
bottom-right and content-gated like the game page's optional blocks.

### Carousels are clipped by the section, never by the column

Modelled on clear.bank's solutions carousel. The section carries `.bleed-clip`
(`overflow-x: clip`) and the rail inside it does **not** clip, so cards slide out into
the gutter and are only ever cut at the screen edge — a card never looks sliced off
mid-artwork. `clip`, not `hidden`: `overflow-x: hidden` implies `overflow-y: auto`, which
would make a scroll container and clip vertically too.

This costs nothing. It is the same `translateX()` on the same track with the same
transition `initRail()` already drove; only the owner of the `overflow` moved.

Two rails run this way — the capability carousel and Hot Games. **Upcomings deliberately
does not**: it is a contained island, and letting its cards bleed to the screen edge
would break the panel, so `.upcomings-panel`'s rail keeps `overflow: hidden` and clips at
the island's own edge.

The capability card is one-up at ~87% of the content column, 2:1, and its prev/next
arrows sit *inside* it at bottom-left. They are anchored to `.cap-carousel`, not to a
card — the selected card is always flush with the carousel's left edge and the carousel
is exactly one card tall, so they land in the card's corner without having to move with
the track. The card reserves extra bottom padding so body copy can't collide with them.

**Each card carries a sheep illustration bottom-right** (`capabilities[].art`), sized by
HEIGHT so the four don't have to share an aspect ratio. Two placements, and the difference
is forced by the arrows rather than chosen:

- **Desktop** insets it by `--cap-pad` from the card's right edge. Flush to the edge read as
  though the artwork had been cropped by the card rather than placed in it.
- **Mobile** keeps it flush (`right: 0`) and caps it at `11.25rem`. That is the only way to
  gain size on a 285px card: the arrows end 112px in, and at this height even the widest of
  the four still clears them — measured 16px of gap. The two then read as one bottom row,
  arrows left and sheep beside them. The card also grows to `min-height: 25rem` so the
  sheep has somewhere to stand instead of being cropped by the card's bottom edge.

Verified at seven widths that every card's art clears the arrows.

### Header

Transparent at rest on **every** page — no plate, no blur — and only paints paper + blur
once `data-scrolled` flips. The old tinted-paper plate composited a shade lighter than
`--paper` and left a visible seam across the top of the first fold. **There is no bottom
rule in either state**: the plate and blur do the separating, and a hairline under the bar
reads as a seam of its own. `body[data-page='game']` now only adds `position: fixed` and
the white marks.

### Hamburger and menu

**Two bars, which are also the two arms of the X** — there is no third bar to fade out.
`.nav-toggle` is **flex column**, not grid: auto grid rows in a fixed-height box stretch
by default, which spread the bars further apart than `gap` and made the arms cross
off-centre. The close transform is written as `calc((var(--bar-gap) + var(--bar-h)) / 2)`
rather than a literal, so retuning the gap can't desync it.

**While the menu is open the header's plate is dropped** but its marks stay —
`body:has(.site-nav[data-open='true'])`. The bar sits above the overlay (z-index 60 vs 50),
so a paper plate left behind reads as a strip of the old page pasted across the top of the
menu. CSS only; `initHeader()` needs no change.

**The open bars are explicitly `--white`.** They used to be `--ink` on an `--ink` overlay
— the X was drawn, just in the same colour as the ground behind it, so it looked like it
had disappeared. The overlay is now `--purple`, but the explicit colour is what fixes it.

Menu links hover to `--green` — green is the site's one interaction colour and that
outranks the fact that it measures ~2.4:1 on `--purple`. Deliberate call, not an oversight;
don't "fix" it. `.site-nav` carries `overflow-y: auto` because the type is large enough
that a short viewport could otherwise clip a centred menu with no way out.

### Footer

Shared chrome on all three site pages (not the brochure, which is a print document and
loads no `site.js`). Menu, then the big wordmark, then the hosting note.

**The footer menu is rendered from `site.json`'s `nav`.** `initFooter()` in `site.js` does
it, so nothing here is invented.

**The header's overlay menu is NOT rendered from that array — it is static markup repeated
in every page's `<head>` section.** This file claimed otherwise until 2026-08-31, which is
exactly the drift the doc rules at the top warn about: editing `nav` in `site.json` changes
the footer on all pages and the header on none. Change a menu label and you must edit
`site.json` **and** the `<nav class="site-nav">` block in `index.html`, `games/index.html`,
`games/game.html` and `free-branded-game/index.html`. The hrefs differ per page because the
header's are hand-written relative paths, where the footer's take `store.js`'s `base`. `initFooter()` in `site.js` does it, and it
runs on every page rather than inside `renderLanding()`; `WS.loadData()` caches, so the
second caller is free. It also owns `[data-hosting-note]` — `renderLanding()` used to set
that too, and one element with two writers is one too many. Every page still carries the
note as static markup, so it reads correctly if the JS never runs.

**Layout is one left-hung column at every width** — wordmark, blurb, then the menu beneath
it, all sharing the same left edge. It used to be two columns with the menu hard right,
collapsing to a stack only under 720px, which meant the footer was effectively two different
designs depending on the screen; the stack is the one that works, so on 2026-08-30 it became
the only one. `.site-footer__top` is `flex-direction: column`, and because flex-basis then
sizes *height*, the brand's old `flex: 1 1 22rem` had to go with it — the blurb's own
`max-width: 38ch` is the only measure that was ever needed. There is no footer override left
in the mobile block: what was the exception is now the rule.

The menu is **one straight row of four above 1024px, and 2x2 at 1024 and below** — never a
column of four, and never 3+1. `nav` carries exactly four entries and the row has room to
spare: measured at 1440 it needs 526px of the 1376 available. Four across still *fits* on a
tablet (~388px of ~961) but reads as a strip of small print rather than a menu, so the fold
to 2x2 happens at the tablet boundary rather than when it runs out of room.

**`grid-auto-flow: column` against an EXPLICIT `grid-template-rows` is what makes those the
only two possible states.** The row count is stated, so the four items can only divide
4-across or 2x2. A wrapping flex row or an `auto-fit` grid would break to **3+1** at the
widths in between, which is the one arrangement this must never produce. Verified at 1920,
1440, 1100, 1025, 1024, 900, 768, 430, 375 and 320: `4` above the breakpoint, `2+2` at and
below it, no 3+1 anywhere, no overflow.

Column flow also fills top-to-bottom *then* across, so in the 2x2 state the pairs read
Home / Game Library, then Request Demo / Download Brochure — source order down each column.
Default row flow would deal them across and break that. Grow `nav` past four and the desktop
row simply gets longer while the tablet state gains a third column.

The links set one notch above `--d-2xs` (`clamp(1.75rem, 2.6vw, 3.125rem)` — 28px on a
phone against the old 24px, 50px at 1920 against 40px). `--d-xs` would have out-shouted the
mark.

The strip closes on a hairline-separated fine-print block:
the 18+ / responsible-gambling line, an optional legal-links row, the hosting note and a
copyright whose year is `new Date().getFullYear()` — a stored year goes stale on 1 January
and nobody notices until a client does. `footer.legal_links` in `site.json` is deliberately
**empty**: Privacy / Terms / Cookies are the usual entries but those pages don't exist, so
the row is content-gated and hidden rather than shipping dead links.

**The 18+ line sits at full `--footer-ink`, not in the note colour.** It is a compliance
statement, not a footnote, and it is the one line here that has to stay legible on all three
grounds (ink, purple, orange).

Because the nav is a grid rather than a flex column, its alignment takes `justify-content`
*and* `justify-items` — the first places the two columns within the footer's width, the
second sets the rag inside each cell. Setting one alone leaves the block centred or the
labels ragged the wrong way, which is the trap if this is ever re-aligned.

**The footer's colours are four custom properties, not four rules.** `--footer-bg`,
`--footer-ink`, `--footer-note` and `--footer-mark`, defaulting on `.site-footer` to exactly
the dark footer that was there before. That is what lets a game page repaint the whole thing
by setting **one attribute** (`data-footer-brand`) while the palettes stay in CSS — see the
game-detail section for why Classic flips to ink type. A page that sets nothing is
unaffected.

`.site-footer.band-dark` is qualified rather than left to source order: both `.site-footer`
and `.band-dark` are one class deep, so an unqualified rule would be decided by which
happens to come later in the file.

### Mobile

The shared `clamp()`s are tuned at the 1280–1920 end, and several bottomed out at their
minimum on a phone — technically correct, visually undersized. The `max-width: 720px` block
raises the ones that mattered:

| | was at 375 | now |
|---|---|---|
| Overlay menu links | 48px (clamp floor) | ~64px |
| Hero headline | 69px | ~82px |
| Brand-tile lockups (`--mark-h`) | 64px (floor) | ~88px |
| Open tile's sub-brand word | 12.8px (floor) | 24px |
| Open tile's tagline | 12.8px (floor) | 16px |

**The same fault applies to the vertical rhythm, and that one is fixed in the tokens.**
`--sec-y` and `--sec-y-sm` are `vw`-based, so below ~850px the vw term has fallen away and a
phone gets whatever the floor says — but the copy inside those sections does *not* shrink to
match (`--t-body` bottoms out at 15px, `--t-small` is a flat 13px at every width). The
original 4rem/2.5rem floors gave that same text roughly **half** the air it has on a desktop,
which is what reads as cramped. Floors are now **5rem/3.25rem**; the vw term and the upper
bound are untouched, so the crossovers move to ~853px and ~1000px and **nothing above 1000px
changes at all** — verified 135px/74.88px at 1440, byte-identical to before.

Prefer raising a floor here over adding a mobile override: the floor is the thing that was
wrong, and an override would leave the bad value in place for the next section that uses it.

**No reserved image slots are left.** `.personalisation__art-slot` held a `min-height` under
720px — 128px at 375 — waiting on dark-fold artwork. It sat between the chips and the
carousel, so it was **128px of the 148px gap** separating a tab strip from the panel it
drives: an invisible hole doing visible damage. Closed on 2026-08-30 on the client's call
that the art is not coming; the mobile gap went 148px → 20px. The hero's equivalent slot went
earlier — the cast lineup fills that space now.

**The div is still in `index.html`**, so reinstating the reservation is one rule and nothing
else: `min-height: clamp(8rem, 30vw, 14rem)` in the 720px block. Don't re-add the markup.

**The hero lineup goes WIDER on a phone, not narrower.** At 100% the cast would be a strip of
thumbnails, so it runs at **150%** and lets the screen crop the outermost characters — which
is the whole reason `.hero` carries `overflow-x: clip`. It was 190% for a round, which cropped
so hard that only the middle few characters survived; 150% still bleeds off both edges (74px
and 104px at 375) while showing appreciably more of the cast.

**The hero arrows align to the LOGO on mobile, not the copy.** Stacked, the hero puts artwork
above copy, so arrows centred on the whole hero land beside the paragraph. Every lockup has
its own aspect ratio and therefore its own height, so no CSS value finds the artwork's middle
— `game.html` measures it and sets `--hero-nav-y` on the hero, which the mobile rule consumes
(`top: var(--hero-nav-y, 50%)`, falling back cleanly if the script never runs). Re-measured on
resize and after the image decodes, since the height isn't known before then. The disc is a
fixed square there too: padding around a 14x22 glyph made it 35x43, which read as a stretched
oval. With the arrows off the copy, the copy column reserves nothing and goes back to the
ordinary container gutter.

**Rails are swipeable.** They are transform-driven rather than scroll containers, so a phone
has no native gesture to fall back on and the arrows were the only way to move one — the last
thing anyone reaches for on a touch screen. `initRail()` binds `touchstart`/`touchend` and
steps **once per swipe** rather than dragging the track with the finger: same one-card-per-
move model the arrows already use, so there is no extra state and no snap-back to animate.
Both listeners are `passive`, and a gesture that is more vertical than horizontal is ignored
so a rail can never eat a page scroll that merely began on top of it.

### The hero's cast lineup

The first fold carries a single full-bleed alpha PNG of the cast —
`assets/img/hero-lineup.png`, from `work17 (website NEW)/BG-last-supper2.png`. Trimmed to its
alpha box (rule 3 again — the supplied file has ~170px of empty canvas down the left) and
otherwise unresized. It is served as **WebP q85 at native 2864x1307 — 454KB**, with the
lossless PNG (4.3MB) kept as the master and the `<picture>` fallback.

**Two things were measured to get there, and both are counter-intuitive:**

*A palette PNG is the wrong tool.* An earlier pass quantised it to 224 colours: 476KB and
visibly banded, because this artwork is mostly gradients. WebP at a similar size is
indistinguishable. Don't reach for palette reduction on this image.

*Downscaling is worse than lowering quality.* Measured against the master composited on
`--paper`, native@q85 scores **40.3dB at 454KB** while 2400px@q92 scores only **37.7dB at
546KB** — bigger file, lower fidelity. Detail lost to a resample never comes back, whereas
WebP spends its error budget on high-frequency texture where nothing shows. So the source
keeps its full width. At 1:1 the diff against the PNG is fine texture noise on fur and
scales, no banding or ringing, and the alpha edge is essentially untouched (mean 0.84/255).

**`.hero` is not a `.container` any more.** The artwork has to reach past the content column
and be cut by the screen edge, so the section runs full width and `.hero__type` takes the
column back with its own `max-width`. The section carries `overflow-x: clip` — `clip`, not
`hidden`, for the same reason as the carousels: `hidden` implies a scroll container.

**Three numbers do the work, and each has a reason:**

| | |
|---|---|
| `width: min(126%, 120rem)` | 126% so the outermost characters are cropped by the screen rather than the cast being shrunk to fit, capped at **120rem = 1920px — the design's target width**, so the lineup is exactly full-bleed at a 1920 viewport and only insets beyond that. **There is deliberately no `max(100%, …)` floor**: it is a lineup, not a full-bleed band, and stretching it across an ultrawide screen only coarsens the characters. Two earlier values were wrong in opposite directions — a `max(100%, …)` floor forced edge-to-edge everywhere, then a 92rem cap pinned it from a ~1170px viewport up and left it undersized across the whole normal desktop range |
| `margin-top: calc(-5% - 20pt)` | pulls the lineup up so the dragon's wings cross the headline and the two read as one composition. Tuned repeatedly against the client's eye: -8% buried the type, -3% left them looking like separate blocks. The **fixed** `-20pt` on top of the proportional part is what holds the same optical bite on a phone, where a percentage of a 355px column is almost nothing. 98px overlap at 1440, 41px at 375 |
| `left: 50%` + `translateX(-47.22%)` | `margin-inline: auto` **cannot** centre a box wider than its container — auto resolves to 0 and the whole overflow lands on the right. And the offset is **-47.22%, not -50%**, because the SHEEP has to be dead-centre, not the file's bounding box: its hooves sit at x=1071 and x=1634 of 2864, putting its axis at 1352 against the file's 1432 — 2.78% of the width to the left, which this adds back. Verified 0.0–0.1px off centre from 375 to 2560 |
| `margin-bottom: calc(-3.49% - 3px)` | the measured overhang plus 3px, because subpixel rounding as the image rescales can otherwise leave a hairline of paper between the artwork's cut edge and the band |

**The artwork carries its own table edge, and the band's top has to land on it.** At
**y=1207 of 1307** the cast is cut flat; below that line the sheep's hooves, two bottles and a
hand hang over. So the dark band starts at that line — the flat cut disappears behind it and
the overhang reads as resting on a surface, which is the whole effect.

That overhang is 100/1307 = 7.65% of the image's height, and because the image is 1307/2864
as tall as it is wide, it comes to **3.49% of its own width**. Which is exactly why the
`<img>` sits in a `.hero__art` **wrapper**: a percentage margin resolves against the
*containing block's* width, so putting `margin-bottom: -3.49%` on the image inside a wrapper
that is the image's width makes the alignment exact at every viewport rather than a tuned
guess. Measured 0px off at 375, 430, 768, 1024, 1280, 1440 and 1920.

`.hero` therefore has **no bottom padding** — any there would float the cast off the band. Its
top padding is half what the other sections use (`clamp(1.5rem, 3.5vw, 4rem)`): the headline
sits close under the header because the artwork below needs the vertical room more than the
gap above does.

**One consequence of centring the sheep:** the artwork holds more cast to the right of the
sheep than the left, so once the cap makes it inset (beyond 1920px) the paper margins either
side are unequal — 364px left against 257px at 2560. That is inherent to centring the focal
point rather than the bounding box; the only ways out are cropping the file symmetrically
about the sheep (losing a slice of the cowboy) or going back to edge-to-edge.

**The ARTWORK paints over the type**, so the cast reads as standing in front of the words.
`.hero__art` carries `z-index: 2` against `.hero__type`'s `1`, both inside `.hero`'s own
stacking context. This is the reverse of an earlier pass that put the text on top — both
orders were tried on the client's instruction and this is the one that shipped, so don't
"restore" the other. Verified by hit-testing a grid across the whole overlap band at six
widths: every sample returns the artwork, none the text.

Note that `.hero__art` carries `pointer-events: none`, so `elementFromPoint` reports whatever
is *underneath* it regardless of z-order — a hit test only proves paint order here if that is
temporarily lifted first. It is exactly what made an earlier check read as a false pass.

**The art cannot sit at `z-index: -1`.** It has to be *behind* the headline but *in front of*
the dark band it overhangs. So `.hero` takes `position: relative; z-index: 1` to lift the
whole fold above the following sections, and `.hero__type` takes `z-index: 1` inside it to
stay above the art. Negative z-index would put the hooves under the band and lose the effect. **The hero has no CTA buttons** — an explicit call on 2026-08-29 to match the comp;
Our Games and Request Demo are both still in the header menu, and Request Demo in the footer
menu too.

### The first-fold parallax

**There are two versions, and `<html data-parallax>` in `index.html` is the only switch.**
`"v2"` (shipping) pins the headline; `"v1"` makes it recede and fade. Both live in
`site.css` under `[data-parallax='…']` and both branches of `initHeroParallax()` are in
`site.js`. **Reverting is that one word** — verified by actually doing it: flipping to `v1`
restores `--hero-p 0.400 / translateY 38.4px / opacity 0.648` at 306px of scroll, exactly
v1's measured curve, with no other edit. Any other value (or no attribute) disables both and
leaves the fold static, which is also what the other three pages get — they have no `.hero`
and do no work at all.

#### v2 — the headline holds still and the band rises over it (shipping)

The headline is pinned to the viewport while the cast and everything else scroll up under
it, until the dark band climbs over it and swallows it. Measured at 1440x900: **still at
128px through 1250px of scroll**, fully covered at **1109**, and it only unsticks at ~1338 —
230px after it has completely disappeared. At 375 it holds through 800px and is covered from
400.

**The motion is `position: sticky`, so there is no per-frame JavaScript at all.** Sticky is
resolved by the compositor, which is the whole reason it was chosen over extending v1's
scroll handler: a JS-positioned "fixed" element visibly jitters under a phone's momentum
scrolling, and that is the most likely way this effect could look broken. JS measures **one
number once** (on load and on resize) — the headline's own resting offset, so it is already
in place at scroll 0 rather than sliding up to meet a guessed value — and never touches the
DOM again while scrolling.

That offset is measured from `.hero` (its document top plus its `padding-top`), **not from
the headline itself**: once the headline is sticky its own rect *is* the pinned position, so
reading that would feed the value back into itself on every resize.

Two things are arranged for this, and both are load-bearing:

**1. The paint order is reversed, which undoes what v1 relies on.** In v1 `.hero` carries
`position: relative; z-index: 1` to lift the whole fold above the sections after it, so the
cast's hooves paint *on* the dark band. That also puts the headline above the band — exactly
what v2 must not do. So here the fold is not lifted as a unit: `.hero` goes back to
**static**, `.hero__art` carries the elevation itself (`position: relative; z-index: 2`, now
resolved against the page rather than against `.hero`), and the headline drops to
`z-index: -1`, behind every block background on the page including the band's.

`.hero` must be **static, not relative** — a positioned box paints above static content, so
a relative `.hero`, whose box now overlaps the band, would swallow clicks on the chips inside
it. Verified by hit test: all four chips reachable, `.hero` not in the hit path. Also
verified the band paints over the pinned headline (3 sample points) and the cast still paints
over the band (5 sample points, with `pointer-events` temporarily lifted on the art — without
that a hit test proves nothing here, as CLAUDE.md notes elsewhere).

**2. The hero's CONTENT box is extended, and it has to be content rather than padding.**
The band's top sits only ~66px above the hero's content-box bottom — that gap is the
artwork's overhang — so an unextended hero can cover just 66px of a ~450px headline. A
sticky element is confined to its containing block, and the containing block of an in-flow
element is its parent's **content** box; padding sits outside it. `padding-bottom: 75vh` was
tried first and **did nothing** — the headline still released at 663px, exactly the unpadded
content edge. An empty `.hero::after` supplies the height instead, and `margin-bottom: -75vh`
on `.hero` pulls everything after it back up by the same amount, so **the layout is
unchanged** and only the sticky range grows. The two values must move together. Verified
`scrollHeight` is unaffected.

`.hero` still has no bottom *padding* either way — real padding there would float the cast
off the band.

The whole v2 block is inside `@media (prefers-reduced-motion: no-preference)`, and it has to
be the whole block: leaving the reversed paint order or the `-75vh` in place without the pin
would be a half-state.

#### v1 — the headline recedes and fades behind the cast

Drifts **down** (moving up slower than the page, which reads as *further away*), scales to
0.94 and fades to 0.12 over the first **85vh**. The lineup does not move, so the depth is the
*difference* between the two. Driven by `--hero-p` from `initHeroParallax()`; the composition
is in CSS so the motion can be retuned without touching the script.

Four things keep it cheap: one **passive** listener; **rAF-coalesced** (measured **60 scroll
events → 1 rAF request**); **no write when nothing changed** (past the fold `p` pins at
exactly `1.000`, so `p === last` returns before touching the DOM); and **compositor-only**
(`transform` + `opacity` on one element, `scrollHeight`/`scrollWidth` unchanged).

**A degenerate viewport made this write `NaN`.** When `innerHeight` is 0 — a prerendered
document, a `display:none` iframe, the moment before an orientation change settles — `0/0` is
`NaN`, and `calc(NaN * 6rem)` is invalid, which takes the whole transform down with it.
`update()` now bails on `!(span > 0)` before computing.

#### Both

**Do not add a blur to the receding type.** It looks the part but forces a repaint of a very
large element every frame, which is exactly the cost both versions avoid.

**`animation-timeline: scroll()` was tried first and abandoned.** It is the better primitive
in principle and `CSS.supports()` reports it available, but it could not be verified: in this
workspace's preview browser the `ScrollTimeline` resolves and then sits permanently inactive
(`currentTime: null`), even on a minimal throwaway page. If it is ever revisited, prove the
timeline actually samples before relying on it.

**The artwork is never animated in either version.** `.hero__art` carries a
`translateX(-47.22%)` that centres the sheep rather than the file's bounding box, and its
`<img>` carries `margin-bottom: calc(-3.49% - 3px)` to land the cast's cut edge on the dark
band. Both are tuned to the pixel; moving the art breaks the "resting on a surface" illusion
the moment the page scrolls.

### Hero, dark-fold spacing, brand tiles

`.hero__line--script` carries a negative `margin-top` in **em** that pulls the line up to
place the CHANGERS script, which is taller than its line box and deliberately crosses into
the line above (it paints on top by source order, no `z-index` needed).

That margin would drag GAME up with it, so `.hero__word` pushes GAME back down with a
**`transform`, not a margin** — the script shares the same flex line and must not move, and
transforms don't participate in layout. The value sets the vertical gap to **half** the
optical gap the type already has between GAMES and FOR. Everything here is in `em`, so the
relationship holds at every viewport and in the contact block's reuse of the same lockup —
verified from 375 to 1920.

The air around the value props is one value — `padding-block` on `.value-props-section` —
used as both `padding-top` and `padding-bottom` so the space above ENGAGEMENT TOOLS and
below FAST API INTEGRATION cannot drift apart. `.cap-carousel-section` zeroes its own
`padding-bottom` so the gap above is that value alone. (It was once a `--vp-gap` custom
property; it is plain `var(--sec-y)` now, and this paragraph said otherwise for a while.)

**Under 720px the three props take tripled spacing, set flat.** Stacked, they are the only
thing in the fold's closing section and the desktop numbers do not survive the change of
axis: 24px between them is a column gap doing duty as a paragraph break, and 80px of band
either side is just `--sec-y`'s floor. An explicit client call on 2026-08-30 tripled both —
**72px between, 240px before and after** — so each prop reads as its own statement rather
than as one block of three. These are deliberately flat values, not clamps, for the same
reason the spec band's are: below this width the type has stopped shrinking, so the spacing
that serves it should stop too. 240px is a third of a phone viewport and is meant to be a
hard section break; don't quietly reduce it back toward the token.

**The purple Engagement Tools band underlaps the Upcomings island.** Its top sits flush
against the island's bottom, then the background runs *up* behind it — negative `margin-top`
with matching `padding-top`, so only the background moves and the heading and cards stay put.
`#upcomings` takes a higher `z-index` so the dark island paints over it and the purple shows
only in the gutters either side.

The rise is **`var(--sec-y)`, not a literal**, because that is the panel's own
`padding-bottom` — i.e. exactly the distance from the carousel arrows down to the panel's
edge. So the purple's top edge lands on the arrows' baseline at every width for free;
verified 0px off at 1920/1440/768/375.

Upcomings crops its cards at the **island's own edge, both sides**: `.upcomings-panel`
carries the inset as its own padding (`--panel-pad`) instead of a narrowed inner container,
so `.upcomings-rail` can cancel exactly that one value with a negative `margin-inline` and
stretch to the dark ground. `.rail` then takes `padding-left: var(--panel-pad)` so the
first card still *starts* on the heading's margin while the clip happens at the panel edge
— a card leaving to the left stays visible until it reaches the ground's edge.

`initRail()` measures **`track.parentElement`'s content box**, not `[data-rail]`, precisely
because those two are different widths here. Note `clientWidth` includes padding, so the
padding is subtracted — without that the track travels one pad too far.

Rails opt into flush end-parking with **`data-rail-flush`** (Hot Games, Upcomings): the last
card lands on the far edge instead of on the next whole step, which otherwise leaves up to a
card-width of dead space. The capability carousel deliberately does **not** opt in — it is
one card at ~87% of the column and depends on the last card resting flush *left*.

**Everything about the resting tile is the comp's — hover is the only thing that changed.**
At rest each tile is the full stacked lockup, centred, at `--mark-h` in a
`min-height: clamp(14rem, 22vw, 26rem)` tile. On hover (or first tap on touch) three things
happen at once: the tiles push each other aside, the lockup cross-fades to the **sub-brand
word alone**, and a tagline fades in beneath it.

The word marks were cut out of assets already in the repo rather than supplied:
`wildsheep-origins-word.svg` is the 9 shapes below the wordmark in `wildsheep-origins-h.svg`
(true vector), and `wildsheep-classic-word.png` is the lower alpha band of
`wildsheep-classic.png` (raster, so it inherits the pending-Classic-SVG caveat and is the
one mark that softens on retina).

**The word and tagline share one out-of-flow wrapper, `.brand-tile__hover`**, and that
wrapper is centred as a unit (`top: 50%` + `translateY(-50%)`). Centring the wrapper rather
than positioning each piece is what makes it hold when the copy changes — the alternative is
arithmetic over the word's height plus the tagline's line count, which goes silently wrong
on a re-word. Being out of flow is also what keeps the resting tile untouched: the lockup is
the only in-flow child, so `place-items: center` on the tile keeps centring it exactly as
before, and nothing the hover adds can grow the tile.

The hover rule composes `translateY(-50%) scale(1.06)` — translate first, then scale, so the
group grows about its own centre and stays centred. Both live on the same property, so they
have to be written together.

The word needs **its own height**, not the lockup's — it is ~3.3:1 against the lockup's
~1.3:1, so at the same height it would be three times as wide and blow out of a phone tile.
That rule needs a `.brand-tile` prefix or `.brand-tile .mark` outranks it.
`max-width: min-content` on the tagline gives one word per line, which is what reproduces
the comp's breaks — including "battle-tested" splitting at its hyphen. `justify-items`
places the boxes; `text-align` sets the rag, and both are needed.

The pair gathers either side of the seam at `--tile-gap` rather than centring in their own
half, and the tiles stay **two-up at every width** — the pair only reads as a pair while the
seam is vertical.

## The game library page

Title → filter bar → result count → grid → Show More → **Upcomings shelf**.

The shelf sits at the **foot** of the page, after the grid and its Show More: the page reads
released catalogue first, then what is coming. That also restores the original rule intact —
*nothing sits between the controls and the grid they drive*.

The shelf is still **driven by those controls** even from down there. It reads the filter
through the same `WS.matches()` the grid uses and hides when nothing in it matches — filter
to Classic and it goes, because every unreleased title is Origins. It also stands down during
a search, since a search is a request to find one title rather than to browse.

The result count lives inside `.library-grid` rather than trailing `.library-head`, so it
travels with the grid it describes.

### The grid is released titles only

`WS.query(..., { released: true })`. An unreleased title in this grid was a dead tile: not a
link, no page to open, sitting in the same rows as 23 that are. They are on the shelf above
instead, as the same `upcomingCard()` the landing page uses — art plus a date, which is all
there is to say about them.

**The brochure deliberately does not pass `released`.** It is the whole catalogue and it has
a "Coming soon" pill for exactly this case. The flag is opt-in for that reason.

Counts: 30 entries → `WS.query()` drops the 4 unnamed teasers → 26 for the brochure →
`released` drops the 3 named upcoming titles → **23 in the grid**. The result count is
computed with the same options the grid used, so it reads "23 games" rather than "23 of 30"
with nothing on the page to explain the gap.

### The grid promotes its top games in place

The first four tiles run **two-up at 1.5x**, everything after them **three-up** as before:

```
big   big
big   big
sm  sm  sm
sm  sm  sm   …
```

**Six columns is the mechanism.** One grid serves both tiers — `span 3` gives two per row,
`span 2` gives three — which also means the small tiles keep exactly the width they had
under the old `repeat(3, 1fr)` (2 of 6 == 1 of 3). Big tiles are 1.5x, not double: span 3
against span 2.

**Which four is positional, not a flag on the data.** `:nth-child(-n + 4)`, and nothing
more. `render()` rewrites the grid's `innerHTML` on every filter, search and sort, so the
selector re-evaluates itself — filter to Classic and you get the top four Classic games,
re-sort and the big four change with it. The two big rows are therefore never left
half-empty, and a result set of four or fewer simply renders all-big. No JS, no `featured`
lookup, nothing to keep in sync.

**Every selector is scoped to `.game-grid >`, and that is load-bearing.** `.game-card` is
shared with the landing page's rails, and `.rail-track` is itself a grid
(`grid-auto-flow: column`). A bare `.game-card { grid-column: span 2 }` would land on every
Hot Games and Upcomings tile and flatten both carousels. `.game-grid` exists only here.

Both tiers keep `aspect-ratio: 16 / 10`, so a big tile scales whole. A wider ratio on the
big four would make `object-fit: cover` crop the artwork, and **every thumbnail has the
game's own logo baked into it** — the same fact that rules out overlaying copy on this art.
The only other difference is the title, bumped to `--d-2xs` so it isn't stranded on the
larger tile. Card meta stays hover-reveal on both tiers: size alone marks the top four.

Responsive: at ≤720px the big four go full width and the rest stay two-up; at ≤460px it is
one column and the distinction has nowhere left to go.

### There is no brochure panel on this page

The Download Brochure block at the foot of the grid was removed. The brochure is still one
click away from the nav menu on every page, which is the only route now. Its copy was also
the last place still claiming the brochure was scoped to the current filter — see
**Three brochure editions, one game per page** below.

### A trap this page found

`[hidden] { display: none !important; }` sits in the reset in `site.css`. The UA's own
`[hidden]` rule is weaker than any author `display`, so `[data-show-more]` painted
"Show More (0 left)" for as long as it existed — `library.js` set `.hidden = true`, `.btn`
set `display: inline-flex`, and the class won. Symptom is always the same: you hide
something from JS, nothing happens, and there is no error anywhere.

## The game detail page

Content comes from `A4-wildsheep-ORIGINS_20260820.pdf` (see below); the first fold
follows the XD mockup (`wildsheepgames.com-gamePage-blobinvasion.pdf`).
Sections: hero → spec band → story + core features + screenshots → **symbols** →
Buy Bonus rail → demo.

Every block after the hero is **content-gated** — it renders only if that game has
the data, so one template serves a fully-documented title and a catalogue-only one.
Optional per-game blocks: `tagline_lines`, `options`, `story`, `features`,
`symbols`, `screenshots`, `buy_options`, `platform`, `demo_url`, and `art`.
See `_meta.detail_blocks` in `games.json`.

The Buy Bonus carousel reuses the landing page's rail (`[data-rail]` +
`initRails()` from `site.js`) — don't write a second carousel.

### The source of truth is the brochure PDF

**`work11 (2026 e-brochure)/#pdf/A4-wildsheep-ORIGINS_20260820.pdf` wins for anything
it states** — spec block, background story, core features, buy options. The Techtoniq
`.pptx` marketing sheets under `ref/WSO asset Techtoniq/` supply only what the brochure
does not carry: `game_id`, `free_spin_cost`, `symbols`, and the shared
languages/currencies in `_meta.platforms`.

**The two disagree, and not trivially.** An earlier pass built these entries from the
`.pptx` sheets and got seven things wrong, all recorded in `_meta.source_conflicts`:
Blob Invasion ships three RTP bands (94.0 / 96.0 / 98.2), not one; it has six buy
options including High-Roller Boost, not five; Cursed's RTPs are 94.58 / 96.06, not
94.5 / 96.0; Bamboonanza is High volatility at 27.1% hit, not Very High at 19.38%;
Spin My Drink is Hi-Lo with a €2000 max bet, not "Mini Game" at €100; High Roller's
Cash is a 4x1 grid, not 1x4. **When in doubt, open the PDF.**

**Two pack-only fields are deliberately NOT carried across.** `sd` — the brochure states
a volatility *word* for all seven, and a second volatility measure from a superseded
document invites the exact contradiction this is meant to remove. `avg_feature_win` —
the packs give it per RTP band, and their bands do not line up with the brochure's.

### The data shapes, and why

**`story` and a feature's `body` are arrays of paragraphs**, not strings. `paras()` in
`game.html` still accepts a bare string, so old entries render, but the stories run to
three paragraphs and a single `<p>` set them as one block.

**`specs` keeps the shipping band flat and adds `specs.variants`.** The old
`specs.rtp_variants` flat string array is gone; `variants` is `[{label, rtp}]`, the
first entry being the default and duplicating the flat `specs.rtp`. That duplication is
deliberate: `brochure.js` reads `g.specs.rtp` and `g.specs.max_win` directly, so this
shape kept the brochure working with no change to it at all. `store.js` stays the only
seam.

**There is no RTP switcher, and that is a considered reversal.** One was built, on the
assumption that hit rate, deviation and average feature win move with the band. **They
do not** — the brochure prints a headline RTP plus its alternates and a *single* figure
for everything else on all seven pages. A switcher would imply movement the source of
truth does not state. Don't rebuild it unless per-band figures are actually published.

**Every certified RTP is set at the same size and colour, in one row**
(`.stat__value--row`). The brochure ranks them — shipping band large and dark, alternates
small and lilac — and that ranking was reproduced at first. On the page it read as a
footnote, which is wrong: with one set of figures serving all three bands there is no
sense in which the others are lesser, so nothing distinguishes them typographically.

**`platform` is a key into `_meta.platforms`, not inline data.** The languages (10) and
currencies (88) are identical across all seven Origins sheets, so they are stored once
and referenced. Classic titles carry no `platform` — different supplier, and quoting
Techtoniq's reach for them would be wrong.

**`specs_provisional: true` is an explicit flag, not a derived one.** It used to be
inferred as "this game has no `story`", which broke the moment two titles turned out to
have real brochure figures and no story slide (Spin My Drink, High Roller's Cash) and
were labelled as invented.

### Hero — four things that are load-bearing

1. **The header is `position: fixed` on this page only** (`body[data-page='game']`),
   not sticky. Sticky still occupies flow space, which leaves a paper strip above
   the hero and stops the gradient reaching pixel zero. It is transparent with
   white marks at `[data-scrolled='false']` and returns to paper/ink once scrolled;
   `initHeader()` in `site.js` already maintains that attribute.

2. **The band fills the hero, and nothing bleeds past it — this reverses the XD
   mockup on purpose.** The mockup had the logo cross the band's bottom edge onto
   the paper below, so the hero reserved that distance as `padding-bottom` for the
   bleed to land in (`--bleed`, `.game-hero--bleed`). That reserve read as a slab of
   dead paper between the buttons and the spec band. Both are gone: `.game-hero__band`
   is `inset: 0`, and the logo is composed *inside* the band, `align-self: center` in
   the empty half beside the copy. **The hero now hands straight off to the section
   below it — verified 0px on all 26 pages.** Don't reintroduce `--bleed`.

   `art.logo` still picks the composed treatment over the flat-thumbnail fallback;
   **every catalogue title has one** except the three unnamed upcoming Origins slots.

3. **The band's `::after` carries two gradients on one pseudo-element.** The brand
   gradient is `180deg` with five stops — the alpha curve measured off the mockup
   (solid to 10%, ~0.79 at 25%, ~0.55 at 42%, gone by 64%); a simple two-stop fade
   clears far too early and washes the key art out. Beneath it sits a **horizontal
   readability scrim**, because the vertical gradient has fully cleared by 64% and
   the copy sits below that, directly on whatever the artwork happens to be — which
   across the catalogue runs from The Void's night forest to Wolf Bonanza's midday
   desert, where the white summary and the green Demo Play button both washed out.
   The scrim stops by 66% so it never touches the logo.

   They cannot be split across `::before` and `::after`: `::before` is inserted
   *before* the backdrop `<img>`, so a scrim there paints under the artwork it is
   meant to darken. One element, two background layers, first listed on top.

4. **`.game-hero__copy` has its own `padding-bottom`.** The copy column is the
   tallest thing in the row on most titles, so it sets the band's height — without
   that padding the Demo Play button sat at exactly 0px from the band's hard bottom
   edge. The padding grows the band with the copy instead of cropping against it.

Measuring against the mockup: normalise to its 1920 canvas
(`value * 1920 / innerWidth`). Band ≈ 599–640; the mockup's ≈200px bleed is no
longer reproduced — see point 2.

**Reading computed styles here needs transitions disabled** — the header and logo
both animate colour, so an immediate `getComputedStyle` returns an interpolated
value and looks like the rule failed. Inject `*{transition:none!important}`,
force a reflow, then read.

### The rest of the page

**The story runs two text columns when there is no cast beside it.**
`.story-grid--solo` sets `columns: 2 30ch` — with a column *width* the collapse to
one column happens on its own, so there is no breakpoint to maintain. Without it a
46ch measure left two thirds of the row empty. The heading sits above the split,
not inside its first column, which is what lets the prose take the full width.

**`.feature-cards` uses `auto-fit`, not a fixed column count.** The catalogue runs
from one feature (The Void) to four (High Roller's Cash); a fixed three-up strands
a single card in the first third, which is exactly how the old stacked list failed.

**The symbol grid is the full paytable, not a sample of it.** Every pack ships several
distinct high and low symbols under tier codes (`H1`–`H4`, `L1`–`L4`, `HP1`–`HP5`,
`LP_A`…`LP_9`), and the page used to collapse each range into a single "High" and "Low"
tile — Bamboonanza has a tiger, a ram, a rabbit *and* a panda where one image showed. All
seven Origins sets were re-extracted from `ref/WSO asset Techtoniq/…/02_Symbols`: 51 symbols
became 94.

**The H\*/L\* files carry no names in the packs, so those names describe the artwork** —
Tiger, Ram, Spade, Amethyst, Rune K. That is a different act from inventing a spec, and it is
the only honest option when the source is a filename like `H2.png`. Feature symbols keep the
names the slides gave them. The one character name, Cursed's **Annie**, comes from that
game's own background story ("Only Annie brings respite"), not from a guess at `Elmo.png`.

**Notes are a reveal, not a caption.** The description used to print under every name, which
let whichever cell happened to carry a paragraph set the height of its entire row. It is now
an overlay: hover on a pointer, tap on touch, tap again (or outside, or Escape) to dismiss,
and opening one closes any other. Only a symbol that HAS a note gets the button, the ring
marker after its name and the overlay — the affordance never promises something a cell cannot
deliver.

**The overlay sizes to its content and is allowed to overflow the cell**, which took three
attempts. Confined to the art slot it had to scroll (Cursed's Wild is 130 characters, 174px
of text in an 80px box). Pinned to the cell with room reserved for the name, it overlapped the
name. `min-height: 100%` with `bottom: auto` covers the tile at minimum and simply extends
past the bottom edge when the text needs it — the grid does not clip, so this works, and the
shadow is what stops the panel reading as part of the row beneath.

**`.symbol__art` is `flex`, not `grid` + `place-items: center`.** The cap doing the
work is `max-height: 100%` on the image, and against a grid area that percentage
resolved to nothing — symbols rendered at natural size and the tall ones overflowed
into their own labels. Against a definite-height flex container it resolves.

**The Buy Bonus lead counts its own cards.** It used to hardcode "Six entry points"
on every game; the real range is four to six.

**`options` is a string when the game has the feature and `{label, available: false}`
when it does not.** The brochure prints all three (Crazy Speed, Flexible Max Win,
Adjustable RTP) on every page and marks a missing one with a grey cross rather than
dropping the row — a missing row would read as an oversight. Spin My Drink is the only
title with a cross, on Crazy Speed.

**Screenshots carry their own `w`/`h`, and that is load-bearing twice over.** They set the
`width`/`height` attributes so the browser reserves the right box before load — there is
no CSS `aspect-ratio` on `.shot img` any more, so without them the figure collapses to
zero height. And they decide `.shot--portrait` at render time. Portrait captures are
phone screens (Spin My Drink's are 610x900) and used to be cropped to 2:1, which threw
away two thirds of the picture; they now keep their ratio at a capped width.
`.shot--portrait img` sets a definite **width**, not `width: auto` with a max-height —
auto width gives a zero-width box, and a lazy image in a zero-width box never intersects
the viewport, never loads, and stays zero.

**The provisional notice moved inside the spec band.** As a paper banner above it,
it was the first thing under the hero on two thirds of the catalogue.

**On a phone the band's spacing is flat, not clamped, and that is deliberate.** Measured at
1440 against 375, every *spacing* value in this band roughly halves — section padding x1.87,
grid top margin x1.80, row gap x1.56 — while every *type* value is **identical at both
widths**: `dt` 13px, `dd` 18px, the cell's top padding 13.6px and the label-to-value gap
6.4px, because those are flat `rem` values rather than clamps. So a phone was rendering
desktop-sized text in half the desktop's space. Under 900px the band therefore sets its own
flat rhythm — roughly 2x the 18px value size between rows (36px) and half that inside a cell
— rather than inheriting clamps that are still shrinking after the type has stopped. Don't
convert these back to `clamp()`: below this breakpoint the type is flat, so the spacing that
serves it should be flat too.

**The spec band's top padding is `--sec-y-sm`, its bottom `--sec-y`, and the asymmetry is
the point.** Every other section on the site opens with something above it; this one butts
straight onto the hero's hard bottom edge (the hero hands off at 0px), so a full `--sec-y`
of dark ground before a `--d-2xs` label read as a blank slab rather than as breathing room.
The bottom edge keeps `--sec-y` because it does the ordinary job of closing the band off
from the story below. Set on `#spec`, so it cannot leak onto the other `.band-dark .section`
blocks.

**Origins pages sell a rebrand; Classic pages sell a demo.** Origins is the range that can be
rebuilt as a branded exclusive, so its primary CTA reads **Rebrand This Game** and anchors to
a form on *that page* rather than throwing the visitor back to the landing page to find one.
The form renders from the same `site.contact.fields` the landing page uses — one field list in
the project — and carries a hidden `game` input so the enquiry arrives knowing which title it
came from. `initContactForm()` has to be called again after render: `site.js` binds it on
`DOMContentLoaded`, long before this markup exists. Classic keeps **Request Demo** pointing at
the landing form; rebranding is not on offer for that range, so there is nothing on the page
for it to scroll to.

**The form band is `--purple`, not `--ink`, and the footer below it carries no top margin.**
On an Origins page the form hands straight off to the purple footer, and the footer's old
inline `margin-top: var(--sec-y)` put a strip of paper between two purple fields — a seam
where there should be none. Removing it costs the Classic pages nothing, because `#demo`'s own
margin already supplies the air above their footer. The inverted field rules had to grow
`.band-purple` selectors alongside `.band-dark` to follow, and the submit button is
`.btn--solid` here rather than the landing form's outline variant: green-on-green measures
~2.4:1 on this purple, where ink-on-green clears 7.5:1.

**The submit button sits LEFT, not right** (`justify-self: start` on `.contact-form .btn`).
Every field in the form is ragged-left, so a button parked on the far right sat at the end of
a long empty row with nothing above it to align to. One rule serves both forms — the landing
page's and the game page's — because both are `.contact-form`.

**There is no back-to-library link in the hero.** The header menu and the footer menu both
carry Game Library on every page, and a third route out sat directly above the title.

**The hero carries prev/next arrows pinned to the viewport edges.** They walk
`WS.query(..., { sort: 'newest', released: true })` — the library grid's own default order —
so stepping through follows the sequence the visitor just saw rather than `games.json`'s
write order, and it wraps so neither arrow is ever dead. They are a disc, not the site's
square button language: this is furniture over artwork, and a green 2px rule would compete
with the real Demo Play button a few centimetres away. The title rides along on hover by
animating `max-width` from zero, so the disc grows into a pill instead of jumping; touch gets
the disc alone.

**Every game page opens at exactly the same height, and that takes two rules, not one.**
The logo is sized by a definite **slot** (`height` + `object-fit: contain`), not a width cap
— the same lesson as `.symbol__art` and `.buy-card__symbol`. Capped by width alone, a squat
lockup rendered 517x192 and a tall one 517x573 on the same page: the tall ones dominated, the
squat ones looked like an afterthought, and each set a different hero height. The second rule
is a `min-height` floor on `.game-hero`. Together they took the spread from **221px to 0** at
1440. Mobile needs its own flat floor (`46rem` under 900px): stacked, the fold is logo slot
plus copy, so the vw-based desktop floor stops binding and heights ran 615–723 at 375.

`.game-hero` is a flex column with `justify-content: center` — `.game-hero__inner` is its only
child in flow (band and arrows are absolute), so the content parks in the middle of a fold now
taller than most of the copy in it, and the slack from the floor spreads evenly instead of
pooling at the bottom.

**There is no meta line under the title.** Range · type · release month used to sit there; the
range is already in the header lockup and the release date is in the spec grid below.

**`.game-hero__inner` reserves inline padding for those arrows via `max()`.** `.container`'s
own padding caps at 2rem, and the arrow occupies ~4.4rem from the edge, so at 1280 the disc
sat on top of the meta line. `max(5.25rem, …)` takes whichever is larger — above ~1600px the
content column's gutter already clears them and it reserves nothing. Mobile reserves less
(3rem), because the disc is smaller there and 5.25rem left the copy at 207px of a 375 screen.

**The symbol grid is ruled, not gapped, and the direction of the rules is the whole trick.**
Each cell closes its own **right and bottom**; the container closes the **top and left**. So
every interior line is painted once and shared by two cells, however `auto-fill` wraps, and
an empty slot in a ragged last row simply draws nothing — the grid ends where the symbols do
and closes itself at any count, without needing to know how many columns were chosen.

Built the other way round (rules on the cell's top/left, closing edges on the container) it
looks broken, which is how it originally shipped: the container's bottom rule runs on under
empty space and its right rule hangs past the final cell, leaving an open box with stubs in
it. A `gap` breaks the scheme entirely — space where the shared line needs to be, so each
cell draws its own and every interior rule doubles.

`.symbol__note` is clamped to four lines. One symbol in a set carries a paragraph and the
rest carry none, and a single description was setting the height of every cell in its row —
rows of mostly-empty ruled boxes. The colour is deliberately weaker than `--rule`: alignment
scaffolding, not a table anyone should notice.

**SPECIFICATION takes the range's colour**, like the footer — `#spec[data-brand]`, one
attribute set by `game.html`, palettes in CSS. Origins keeps `--purple-light`; Classic uses
`--orange` straight, with no lightened variant needed: it measures 7.4:1 on `--ink` where
`--purple` managed only 2.95:1 and had to become `--purple-light` in the first place.

**The demo section has no visible heading or lead.** The frame explains itself, and "Demo
Play / Try the game as players will see it" was a caption on a placeholder. The `<h2>` is
still there as `.visually-hidden`: `#demo` is the target of the hero's Demo Play button, and
removing the name outright would leave that jump landing on an unlabelled region.
The frame takes the full content column — it was capped at 60rem while the heading and lead
were there to balance it, and with those gone the frame *is* the section.

**The air above and below the frame is one declared value, and getting that took a sibling
rule.** `#demo` zeroes its padding and owns the gap as `margin-block`, and
`main > section:has(+ #demo)` gives up its bottom padding. Without that second rule the gap
above was the previous section's padding *plus* this margin while the gap below was the margin
alone — **margins do not collapse against padding, they stack on it**.

**That sibling rule must exclude the coloured bands, and forgetting to broke a page.** As
first written it stripped the padding from *any* preceding section. On a Classic page the
section before `#demo` is `#spec` — a dark band — and there the padding is not invisible
whitespace, it is the band's inner margin. Zeroing it left the Free Rounds / Bet Limits row
sitting flush on the band's bottom edge with nothing under it. The selector now carries
`:not(.band-dark):not(.band-purple)`, and the visible result is unchanged for paper sections:
what the eye measures above the frame is the distance from the band's *edge*, which is
`--demo-air` either way. Measured 144/144 at 1440 and 80/80 at 375, on all 23 pages.

**The footer wears the game's range.** `game.html` sets one attribute —
`footer.dataset.footerBrand = game.brand` — and `site.css` owns both palettes. Origins takes
purple, Classic takes orange, and **both carry white type and the white outline lockup**, so
the two read as one treatment in two colours.

Both also use `.mark--wordmark-outline`, not `.mark--wordmark`. The solid mark paints as a
single flat silhouette in `--footer-mark`; on a brand-coloured ground that loses the sheep
inside the W entirely, because there is no second colour to draw it. The outline file keeps
it. The landing page's dark footer already used this variant.

**White on the orange is a deliberate brand decision that overrides contrast, and it should
not be "fixed" back.** `#FFFFFF` on `#FF932E` measures **2.22:1** against a 4.5:1 floor —
and this footer's fine print is `--t-small`, so it is the strictest case on the site. An
earlier pass used `--ink` here (6.1:1) for exactly that reason and was overruled: the ranges
have to match. Recorded so the next session doesn't silently revert it as a bug.

The teaser branch returns before any of this runs, so an unreleased title's page keeps the
ordinary dark footer with the purple mark — consistent with that branch also handing the
header back to its ink-on-paper behaviour.

### Backdrops are square, and that is a constraint not an accident

Every `art.backdrop` in the catalogue is between **0.93 and 1.01** aspect except one portrait
outlier (`spin-my-drink`, 0.57 — a phone-native mini-game). That is not a coincidence: the
hero band runs from roughly 2.3:1 on a wide desktop to **0.51:1 on a phone**, and only a
square-ish source survives `object-fit: cover` at both ends.

`fortunes-of-sparta` shipped at **2.09:1** and was the one page that broke on mobile — the
crop threw away three quarters of the width, the bright sky vanished under the brand gradient,
and the wall's top edge read as a hard crop line across the fold. Its asset pack is a 2018
widescreen title and contains no square version, so the backdrop in the repo is **rebuilt**:
the original strip composited onto a 1920x1920 canvas over a heavily blurred cover-scaled copy
of itself, with the seams feathered ~90px. The blur is colour-matched by construction, and the
top third it occupies is under the solid part of the brand gradient anyway.

**Before adding a backdrop, check its aspect.** Anything wider than ~1.2:1 needs this
treatment or it will break the phone layout. The original is kept beside it as
`backdrop-OLD-widescreen.jpg.bak`.

`joker-win-hits-win-boost` and `-win-stepper` were also replaced: both had **gameplay
screenshots** as their backdrops (reels, jackpot bars, spin buttons), because neither title
has an asset pack — they exist only in the Joker Series PDF. Both now use the Joker family's
stage background, which is already shared between `joker-win-hits` and `-megaways`, so reusing
it is the established pattern here rather than a new one. Old files kept as
`backdrop-OLD-screenshot.jpg.bak`.

### Game art is trimmed to its alpha bounds on the way in

`assets/img/games/<slug>/` holds `logo.png`, `backdrop.jpg`, `sym-*.png`,
`buy-*.png`, `cast-*.png` and `shot-*.jpg`; the catalogue thumbnail stays at
`assets/img/games/<slug>.jpg`.

**Trimming is load-bearing, and it is CLAUDE.md rule 3 in a different file format.**
Brand exports centre artwork on a large empty canvas — `the-real-og`'s logo shipped
as 647x521 of art on a 1200x675 board, Wolf Bonanza's as 573x543 — so `max-width`
describes the board and the mark renders small inside its own slot. The build pass
crops each PNG to its alpha bounding box before resizing. Symbols shrank as far as
73x77 from a 300x300 export, which is also why `.symbol__art` sizes by a fixed slot
rather than by the files.

Only `sips` and Pillow are available (no npm, no ImageMagick, no `pngquant`). The
one-off scripts are not in the repo — re-deriving them is cheaper than maintaining
them, and nothing here needs a build step.

## The catalogue and the ORIGINS brochure

`data/games.json` was rebuilt from `A4-wildsheep-ORIGINS_20260820.pdf` (24 pages). Two things about
it are worth knowing before editing dates or order:

**Release dates for the seven brochure titles encode page order, not sourced dates.** The
brochure states order only — earlier page = more recent — via pages 6/8/10/12/14/16/18:
Bamboonanza, Spin My Drink!, High Roller's Cash, The Void, Blob Invasion, Cursed, Iron Gate.
The dates are inferred on a monthly cadence to make that order fall out of the site's
existing `release_date` sort. `_meta.release_dates` in `games.json` says the same.

**No document states a release date for ANY title in this catalogue — Classic included.**
So every date in `games.json` is carrying ordering and nothing else, and it is legitimate to
re-date a title to fix an ordering that reads wrong. That was done on 2026-08-26 to the three
newest Joker Classic entries (Megaways, Win Boost, Win Stepper): the cadence a previous pass
picked had run them into 2026-05/06/07, which interleaved three Classic titles through the
Origins run and put two of them in the library grid's promoted top four. They now sit at
2025-11-12, 2025-12-10 and 2026-01-14 — the Joker deck's own order preserved, the monthly
cadence preserved, and **the whole Classic range now sorting below the whole Origins range**,
which is the real-world order. `_meta.inferred_dates` records it. Don't undo this by
re-deriving dates from a cadence without checking the two ranges stay separated.

**Nothing unreleased is clickable, anywhere.** `isTeaser()` in `site.js` is the one test —
`status === 'upcoming' || !slug` — and `gameCard()`, `upcomingCard()` and `game.html` all
use it, so the rule cannot drift between them. A teaser card is a `<span>`, not a disabled
`<a>`: there is no destination, so there should be nothing in the accessibility tree and
nothing for the keyboard to land on. `.game-card--teaser` drops the hover zoom with it.

**A `?g=` URL for an unreleased title still resolves**, because it may be bookmarked or
shared — but it answers with the date and a route onward, not an empty one-sheet. That
branch also flips `body[data-page]` off `game`: the game-page header is fixed and paints
its marks white at scroll-top, which is right over a dark hero and invisible over the paper
this state uses.

**The four unnamed upcoming teasers** are a subset of that. The brochure's timeline ends
with four slots that have art and a date but no title — deliberate. They carry
`teaser: true` and an empty `slug`, and `WS.query()` filters them out, which keeps them out
of the brochure (no title means nothing to search, sort A–Z, or link to). `renderLanding()`
and the library page's `renderUpcomings()` both read `games` directly, so the Upcomings rails
still show them, and they alone are `aria-hidden` — a picture with no title conveys nothing
without the date beside it.

**Their art is a cut-out on a purple ground, not a cropped tile** — `art.cutout`, an alpha
PNG under `assets/img/games/upcoming/`. What shipped before was a square character render
run through the 3:2 tile's `object-fit: cover`, which showed a band of the render's own
background and a sliver of the subject. The four sources were isolated subjects on flat
white or flat black, so they were keyed by a border-connectivity flood (not a global colour
key — the bomb's white spade and the zombie hand's bone are interior pixels that match the
background exactly and have to survive), un-premultiplied at the edge so no halo shows on
purple, then trimmed to the alpha box, capped at 600px and palette-quantised: 1.4MB → 280KB.
`.game-card__media--cutout` keeps the 16/10 footprint so the rail still steps by one card
width, and fits every render to the same HEIGHT — they run 428x600 to 480x500, and matching
widths instead would make the squat ones tower over the tall ones.

**Its padding is the only thing setting the subject's size**, because the image is fitted by
height to that box's *content* area — so widening the inset shrinks the render and adds the
margin in one move. It shipped at `1.6vw` (23px against a 248px-tall card), which left the
cut-outs at 81% of the card's height and all but touching the purple's top and bottom edges.
Now `clamp(1.25rem, 2.5vw, 2.5rem)` — 36px at 1440, 71% of the card — so they read as placed
on the ground rather than cropped by it. Only the vertical inset does any work (fitted by
height, these clear 100px+ either side already); it stays uniform so the corners look even.

`upcomingCard()` falls back to `thumbnail` when there is no `art.cutout`, so the three named
upcoming titles — which have real finished key art — are untouched. **Give a slot a proper
3:2 tile and it should lose its `art.cutout`**, not keep both.

One caveat on the Feb 2027 slot: its source has a hard-edged dark slab baked in behind the
subject, in a grey the bomb's own body also uses. It is keyed with a second key colour, and a
faint outline of that slab survives. It cannot be lifted further automatically — a clean
source asset is the fix.

**Upcoming cards carry art and a date, and nothing else.** A one-line description briefly sat
under the date and was removed: those titles are not out, so there is nothing to sell, and the
line was explaining games nobody can play. Released cards keep their `card_line`.

**A card's meta strip says what the game IS, not what it was filtered by.** `card_line` is a
one-sentence description on every named title, replacing the old "Slots · Origins" pair —
which repeated the filter the visitor had just clicked and said nothing about the title. Each
line points at that game's real mechanic or its real theme — nothing invents a feature — but
it is written as a **teaser, not a spec line**: the sentence a player reads on a card, leading
with the hook rather than the figure. The first pass condensed each `summary` verbatim and
read like a datasheet. `gameCard()` falls back to the range/type pair when a `card_line` is absent, so
the strip can never render blank, and the four unnamed teasers have none because there is
genuinely nothing to describe. The strip drops the uppercase/letter-spaced meta treatment —
tracked-out caps are unreadable past three words — and clamps to three lines so a long one
can never push the title out of the card. It sets at `--t-body`, not `--t-small`: at 13px it
read as a caption under the title rather than as the pitch.

`new_release: true` drives the purple corner flag, which shares `.game-card__flag` with the
green "Coming soon" and appears everywhere a card does.

## Provisional — don't treat as final

- **Every figure comes from one of three documents.** Origins' seven released titles from
  `A4-wildsheep-ORIGINS_20260820.pdf`; twelve Classic spec panels from
  `A4-wildsheep-classic.pdf`; the six Joker Win Hits titles' hit frequencies and feature
  blocks from `Wild Sheep Joker Win Hits Series.pdf`, which is also the only source
  for Megaways, Win Boost and Win Stepper. **`epic-stars` appears in no document** and is
  the single entry left on invented figures — it carries `specs_provisional: true`, which
  prints the placeholder note inside the spec band. The three upcoming Origins titles have
  an empty `specs` object and render as teasers instead.
- **The Classic brochure has no prose whatsoever** — no stories, no core features, no
  buy tiers, and its game pages carry no title in the text layer (each game is
  identified only by its tile artwork; the page→slug map is in the build note in
  `_incoming/README.md`). So Classic pages are hero → spec band → demo, and that is
  the finished state for them, not a gap waiting on data entry.
- **No Origins story is invented any more.** `high-rollers-cash` and
  `spin-my-drink` have no background story in the brochure, and their pages carry the
  brochure's own operator-facing feature blocks instead. Only the two new Classic
  entries' tagline and summary are written copy.
- **Six Origins summaries were rewritten** because the placeholder marketing
  contradicted the brochure — The Void's claimed an expanding reel (that is Iron
  Gate's mechanic) and Cursed's invented a "curse meter" where the real one is the
  Wicked Reel. Don't restore the old copy from git.
- **Bamboonanza's Core Features are the one place the brochure is not followed**, and
  this needs a decision. Brochure p7 gives them as Expanding Grid and Multiplier Totem
  — Iron Gate's copy from p19 — which contradicts Bamboonanza's *own* spec block on the
  facing page, where an expanding grid cannot coexist with `Grid Layout 5x6` and
  `Win Mechanic 50 Lines`. The same error is in the Techtoniq deck the brochure was
  built from, so it is an upstream content bug. The page ships the features from
  Bamboonanza's own Feature Symbols slides instead. **Flag to Techtoniq**; re-importing
  from either document brings the wrong copy straight back. Recorded in
  `_meta.source_conflicts`.
- **All 23 released titles have hero art** (logo + backdrop). The three upcoming Origins
  titles and the four unnamed slots have a thumbnail only, and never reach a hero anyway —
  they are teasers.
- **Classic artwork is published without a licence credit.** Blueprint's
  `Product and Legal Requirements.docx` names them as licence holder and asks for
  that on associated artwork (the `LEGAL NOTICE REQUIREMENTS` field is blank in all
  eleven). Publishing without it was an explicit decision, taken 2026-08-25 with the
  requirement on the table — not an oversight. Adding it later is one optional data
  field plus one line in the hero.
- **`demo_url` is empty everywhere**, so every game shows the demo placeholder.
  Fill it in and the same frame renders an `<iframe>`; no template change.
- **`wp/acf-fields.json` is a partial export** — the `game` CPT's core fields and nine
  specs only. No optional detail blocks, no Options-page group. `wp/HANDOVER.md` §4 is the
  real spec and lists the gap precisely.
- **The Classic lockup is half-migrated to vector.** The *header* on Classic game
  pages now uses `.mark--classic-wide` — true vector, from
  `work8 (logo complete)/Wild Sheep Classic/SVG/WSC-logos_logo2-horizontal-white.svg`,
  whose viewBox was the full 1920x1080 board and is cropped in the repo copy to the
  artwork's own 1685x546 (rule 3 again, in a supplied file rather than a cut one).
  `.mark--classic` (the stacked brand-tile lockup) and `.mark--classic-word` are
  **still the old PNG** and still soften on retina.
- **Buy Bonus card symbols are a judgement call**, and only `blob-invasion` and
  The Void's High-Roller Boost have them — the other packs ship no per-tier art, so
  those cards render text-only. Each is one `symbol` path in `games.json`.
- **Symbol names are the sheets', but the file-to-name mapping is mine.** The packs
  name files `WL.png`, `bouns.png`, `Higt1.png`, `Elmo.png`; the slides name the
  categories. Cursed's Cursed Door, Scatter Specters and Annie's Spell were left out
  rather than guessed at from `b1_*`/`b2_*`/`Elmo.png`.
- **The Engagement Tools items are the second set of copy.** `Missions` was dropped and
  `GGR Discount` added; the other four were renamed and rewritten from a supplied reference.
  That reference also showed a different layout (left heading column, 2-up items, cream
  ground, no outlines) which was **deliberately not adopted** — copy and icons only.
- **News section** — **removed from the page**; the sample items stay in `site.json` for
  the later phase that brings it back as real posts.
- **Demo form** — validates and reports locally, no backend.
- **Partner logos** (Betpanda, SOFTSWISS, Spacehills, OdiBets) came from the XD and are
  not confirmed as cleared for public display — **the row is removed from the page**.
  The data stays in `site.json` so the section can return once they're cleared.
- **`repeatTo()` padding is gone.** Both rails now carry the ORIGINS brochure's real
  line-ups — seven featured and seven upcoming — so there is nothing to pad. Both are
  sorted explicitly in `renderLanding()` rather than relying on the order `games.json`
  happens to be written in: Hot Games newest-first (brochure page order), Upcomings
  soonest-first (its release timeline).
- **The capability cards each carry a sheep illustration** in `capabilities[].art`, rendered
  bottom-right by the slot that was already built for it — no template change was needed, and
  none should be. The four are matched to the cards by their source filenames
  (`carousel1-brandedexclusive` → `branded-exclusive`, and so on), not by order.
  Trimmed to their alpha bounds and converted to **WebP q88 — 2.2MB → 241KB**, all four above
  40dB against the source composited on `--ink`. They are decorative and `aria-hidden`, so
  there is no PNG fallback: a browser without WebP simply renders nothing where a picture
  would have been, which costs the reader no information.
- **The Promotion Tools hover** (`translateY` plus the rule and icon going solid) is a
  placeholder standing in for the real treatment.
- **The brand tiles push each other aside** on hover — `flex-grow` 1.18/0.82 on a flex row,
  so the seam slides and the pair always fills the width. They stay two-up at **every**
  width: the pair only reads as a pair while the seam is vertical. On touch there is no
  hover and the tiles are links, so `initBrandTiles()` makes the first tap open a tile and
  the second follow its link. Both `[data-open]` selectors carry the `:has()` prefix — a
  bare `.brand-tile[data-open]` loses to `.brand-tiles:has(…) .brand-tile` and nothing moves.
- **The promo card icons** are `d` path data in `site.json`, drawn with
  `vector-effect: non-scaling-stroke` so the stroke stays exactly `--card-line-w` however
  the 24x24 viewBox is scaled. Without it the stroke scales with the box and lands at
  ~2.5px against a 1px rule.

## Three brochure editions, one game per page

**This reverses the old "one brochure, whole catalogue only" rule — a client call on
2026-08-31.** There are now three editions, chosen by `?scope=`:

| `?scope=` | Contents | Pages |
|---|---|---|
| `origins` | the 10 Origins titles | 14 |
| `classic` | the 16 Classic titles | 20 |
| `all` (default) | the whole 26-title catalogue | 30 |

**The scope only ever filters by RANGE.** There is still no filter- or search-scoped
brochure: `brochure.js` reads `scope` and `print` and nothing else, and `library.js` still
does not pass the library's active filter into the brochure link. Both used to, which quietly
produced brochures nobody had asked for — that part of the old rule stands.

**One game per sheet, and never two.** Each game sheet carries that title's own key art, so
a shared page turns it back into a list. The sheet mirrors the game page's order — hero
(backdrop under the brand gradient with the logo on it), spec grid, background + core
features, symbols, screenshots, buy bonus — and every block after the hero is content-gated
exactly as on the page, so a Classic title with figures and no prose renders a short clean
sheet rather than a page of empty headings.

**Four caps in `brochure.js` are what keep a sheet inside one A4 page**, and they were set by
measuring, not guessed: `MAX_SYMBOLS` 8 (The Void ships 20), `MAX_FEATURES` 2, `MAX_BUY` 4,
`MAX_STORY` 2. The story and feature bodies are additionally line-clamped in CSS. Blob
Invasion is the densest title and the one to re-measure after any change — it ran **391mm**
against a 269mm page on the first build, when a sheet was the content box rather than the
whole page. If a sheet ever overflows, tighten these rather than doubling games up. **The unreleased titles share ONE sheet.** A title that is not out has art and a date and
nothing else, so a full game sheet each was three pages of white space; `upcomingsSheet()`
lists them as thumbnail + date. The four unnamed teaser slots are still excluded upstream by
`WS.query()` — with no title there is nothing to list. Classic has no upcoming titles, so
that edition has no such sheet at all.

**The overview and Upcomings headings are `--purple` at 26mm**, and the game sheets' section
headings take the range's colour — purple for Origins, orange for Classic, the same way the
site's SPECIFICATION heading does. `--purple` straight, not `--purple-light`: on paper
#9445FF measures 5.1:1, and it only needed lightening on the site's dark band. The Upcomings
sheet is itself a dark field, so its heading, titles and dates are white and carry no colour
of their own.

**The hero logo's WIDTH cap binds on the wide lockups and its HEIGHT cap on the square ones**
— Fortunes of Sparta is 3.97:1, Bamboonanza 2.51:1, but Blob Invasion's is 1000x1003. Raising
the width cap therefore grew 22 logos and did nothing for that one. Blob Invasion has its own
`height` via `[data-slug='blob-invasion']` rather than the shared slot being inflated for all
of them.

**The game sheet's title block lives in the hero band.** Eyebrow and title left, the logo
right and much bigger (44mm, right-justified) — so the band identifies the title on its own
and the body starts straight into the copy. Both sit after the wash in the DOM and paint on
top of it by source order; don't reorder the markup. The section headings (BACKGROUND, CORE
FEATURES, SYMBOLS, BUY BONUS) are `--ink` at 6.5mm rather than grey at 4.6mm — they are
navigation, and grey small caps disappeared on paper.

**Distribution reach is the smallest type on the sheet.** 10 languages and 88 currencies from
`_meta.platforms`, keyed by the game's `platform`; Classic titles carry none, so it renders
nothing for them. It is a completeness line, not something anyone reads through.

Verified with nothing clipped in all three editions — **all** 28 pages, **origins** 12,
**classic** 20 — under the print rules at full page width: every sheet exactly **297mm**
with zero spill, and the tallest sheet's intrinsic content 284.9mm, so ~12mm of headroom.

**The cover carries the cast lineup, standing on a dark table.** The same `hero-lineup.webp`
the landing page uses, running at 138% of the sheet so the outermost characters are cropped by
the paper edge, with
`left: 50%` + `translateX(-47.22%)` — **-47.22%, not -50%**, because that puts the SHEEP dead
centre rather than the file's bounding box (its axis sits at x=1352 of 2864, 2.78% left of
centre). Same figure and same reason as the landing hero; verified 0.14px off centre. The
lockup is the **outline** SVG, not the solid one: on brand colour the solid mark paints as a
flat silhouette and loses the sheep inside the W, exactly as the footer already documents.
**The table under it is the landing page's dark band, on paper** — `--ink` #2E2E2E, painted
as an `svgField()` so it survives printing with backgrounds off, with the imprint set inside
it beneath the cast. **3.49% of the image's own width is where the artwork's flat cut edge
sits** (y=1207 of 1307), and the wrapper is what makes that percentage exact at any size
rather than a tuned guess. **And `.cover__art` must carry `z-index: 2` so the artwork paints OVER the table**, exactly as
`.hero__art` does on the landing page. Without it the table — later in the DOM and positioned
— painted on top and simply covered the 3.49% that was meant to lap over it, leaving a hard
flat cut where the sheep's arms and the bottles should cross onto the dark. The table's top
padding is what keeps the imprint clear of the overhang.

**The cover takes the edition's own colour** — purple for Origins and All, `--orange` #FF932E
for Classic, on the `svgField()` and the CSS background alike. White type on the orange is the
brand's call, the same one the site's Classic footer makes.

The cover's subtitle is bold, scope-aware (`SCOPES[].blurb`) and carries `white-space: nowrap`
— **all three blurbs must set on one line**, never folding under themselves.

**There is no contents sheet.** It was dropped on 2026-08-31; with one page per game and a
28-page document it was a page of index nobody needed. `FIRST_GAME_PAGE` went with it.

**The front matter is TWO sheets** — cover, *Why Wild Sheep*, *What you get*, then the
games. The two overview sheets
carry the site's own artwork rather than being a wall of text: the capability sheep
illustrations (`capabilities[].art`) and the promotion-tool line icons (`promotion_tools
.items[].icon`, drawn inline with `vector-effect: non-scaling-stroke` so the 24x24 stroke
doesn't thicken when scaled to 8mm). A capability's `link` label is appended to its body as
plain text — on paper there is nothing to click, and without it Branded Exclusive's copy
stops mid-sentence on "First one is on us:".

### Making the PDF match the preview

**In print the sheet is a FIXED `height: 297mm` with `overflow: hidden` — the distinction
from `min-height` is the whole fix.** With `min-height: 297mm` the box could still grow:
every sheet's content bottom (the running footer) landed exactly on 297.0mm, and 297mm is
1122.52px at 96dpi, so the engine's rounding tipped that last fraction over and paginated a
near-empty extra page after every sheet, nearly doubling the page count. A fixed height cannot
grow, and clipped overflow guarantees nothing inside pushes the box past the boundary.

**294mm was tried in between — don't go back to it.** It fixed the pagination but left a 3mm
white bar along the foot of every printed page, which is a worse defect than the bug. 297mm
is the right number; the fixed height is what makes it safe. The tallest sheet's INTRINSIC
content is 284.9mm, so there is ~12mm of headroom — check that before adding anything tall to
the front matter.

**`@page { margin: 0 }`, and that is what removes the browser's own print
furniture.** Safari and Chrome draw their header and footer — document title, date, page URL,
"Page 7 of 29" — INSIDE the page margin. A 14mm/15mm margin gave them room, which is where
the white border with a `localhost` link in the corner came from. At margin 0 there is
nowhere to draw them and they are suppressed; the page's inset moved to `.sheet__pad`
(14mm/15mm). A sheet is now the **whole 210x297mm page**, on screen as well as on paper, so
the preview is the print geometry — and the hero bands bleed to the paper edge as intended.
Sheets are measured against **297mm**, not the old 269mm.

**The hero gradient's alpha lives in `stop-color`, not `stop-opacity`.** Safari's PDF export
flattened `stop-opacity` to 1, painting the whole band solid brand colour: the backdrop
vanished from every printed game page while the logo and title, which come later in the DOM,
still showed. rgba() in `stop-color` survives. Both are set, so only losing both brings it
back. The same SVG carries a bottom-up **readability scrim** — the brand fade has cleared by
60% and the title block sits below that, straight on the artwork, which runs from The Void's
night forest to Wolf Bonanza's midday desert where white copy washed out entirely.

**Everything the reader must see is CONTENT, not CSS background.** Safari's print dialog has
"Print backgrounds" OFF by default, and with it off every `background-color` and
`background-image` is dropped — which took the purple cover, the hero washes and the dark
closing sheet with them. `print-color-adjust: exact` is set and does **not** override that
checkbox in Safari. So:

| Was | Now | Why |
|---|---|---|
| `<span class="mark mark--wordmark">` | inline `<svg fill="currentColor">` via `inlineMark()` | the site paints logos with `background-color` + a CSS **mask** (hard rule 3). The mask does not survive Safari's print pipeline; what landed in the PDF was a solid filled rectangle |
| hero gradient on `::after`, using `color-mix()` | inline `<svg>` `<linearGradient>` via `svgWash()` | pseudo-element backgrounds get dropped, and `color-mix()` is unreliable through the print pipeline — a gradient that fails to parse takes the whole fill with it |
| cover / closing `background: var(--purple)` | inline `<svg><rect>` via `svgField()` | with backgrounds off the cover printed white-on-white |

`inlineMark()` also strips the supplied SVG's own `<style>.cls-1{fill:#fff}</style>` and its
`class="cls-1"` attributes. Inlined, that would be a **global** `.cls-1` rule loose in the
page, and its class selector beats the `fill` attribute, so the mark could never be
recoloured.

Verified by killing **every** CSS background on the sheets and confirming the cover, the
washes and the game heroes still render.

**The logo must come AFTER the wash in the DOM.** It used to sit before a `::after` gradient,
so the wash painted over it — visible on screen only because the gradient is semi-transparent
there, and gone entirely in the PDF. Source order does the layering; there is no z-index to
get wrong. Don't reorder the hero's markup.

**Two print traps were found building this, and both are the same bug in different files.**
An A4 page is only about **794 CSS px** wide, so *any* unscoped `max-width` media query fires
during printing:

1. `brochure.css`'s own mobile block is now `@media screen and (max-width: 800px)`. Unscoped,
   it reflowed every sheet on paper — spec grid to two columns, symbol strip to four — and
   pushed the measured-to-fit sheets past one page.
2. The brochure loads **alongside `site.css`**, and shared class names let the site win the
   specificity ties. This bit twice: first `.spec-grid`/`.spec`/`.shot`/`.shot--portrait`
   (the spec grid inherited a 72px top margin, a **white** `--rule-invert` border on every
   cell, and a forced two-column layout in print), then `.cap-card`, where the site's dark
   carousel card turned the overview's capability cards into black boxes overflowing the
   sheet.

   **Every brochure-only class is now `b-` prefixed**, and `brochure.css` and `site.css`
   share **zero** class names — that is the invariant to preserve. Adding an unprefixed class
   to the brochure is how this comes back a third time.

## Naming

The purple fold is titled **Engagement Tools** on the page, and the first value prop in the
dark band above links down to it with a green "Read more". The anchor, the `promotion_tools`
key in `site.json`, and `wp/acf-fields.json` all still say *promotion* — only the display
strings changed, because those three are wired into the brochure builder and the WP port.

## Conventions

- **Reporting back: one sentence per change. This is the rule that gets broken most, so
  read it twice.** A trivial task ("restart the server") gets "done" and the URL, nothing
  more. A revision round gets ONE sentence per bullet the user asked for — no headings, no
  before/after tables, no measurement dumps, no "worth knowing" asides, no explaining the
  CSS or JS mechanism unless asked. Still DO the verification — measure, sweep the
  breakpoints, check the console — just don't narrate it; report the outcome, not the
  method. Surface something unasked only when it changes a decision: a real defect, a
  contradiction with an earlier instruction, or a call that is the client's to make, and
  then it is one line, not a section. Questions get asked immediately, not buried at the end
  of a write-up. Restated by the client on 2026-08-30 after several replies drifted back
  into long write-ups.
- Match the existing comment density: banner comments per section, short `/* why */`
  notes on non-obvious rules. Explain *why*, not *what*. (Code comments stay verbose — that
  brevity rule is about chat replies, not about the codebase's own documentation.)
- British spelling in user-facing copy ("personalise", "colour").
- Semantic HTML; the whole card is one `<a>`; `aria-pressed` on filter chips;
  `.visually-hidden` for screen-reader-only headings.
- Verify changes in the browser before reporting done. Check for horizontal overflow
  (`document.documentElement.scrollWidth > innerWidth`) after any layout work.
- Screenshots of scrolled pages come back blank in this environment. To review a
  section, hide the preceding ones (`display:none`) rather than scrolling.

## Open decision

CMS approach is not settled: static + a git-backed CMS (Decap/Sveltia) vs a
WordPress theme. `wp/HANDOVER.md` covers the WordPress path. Don't start either
without confirming with the user.

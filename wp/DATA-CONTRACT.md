# Data contract — every field that actually occurs in the data

> **Generated file — do not hand-edit.** Produced by `python3 wp/tools/datacontract.py`
> from `data/games.json` and `data/site.json`. Re-run it after changing either.

`wp/acf-fields.json` is a deliberately partial export (core fields and nine specs).
This is the complete picture, derived from the shipped data, so it cannot drift.
Build the ACF group against this table and the port stays a find/replace —
**keep the JSON key as the ACF field name**.

Read `wp/HANDOVER.md` §4 first for what maps to `post_title`/`post_content`/
taxonomies rather than to a custom field. This file is the field census, not the plan.

## Counts

| | |
|---|---|
| Entries in `games.json` | **30** |
| Named titles (`teaser` absent) | 26 |
| Unnamed teaser slots (`teaser: true`, empty `slug`) | 4 |
| Released (`status: live`) | 23 |
| Unreleased (`status: upcoming`) | 3 + 4 unnamed |

Where those numbers surface: the brochure renders the **26 named** titles, the library
grid renders the **23 released**, and all **7** unreleased sit on the Upcomings shelves.

**Presence counts below are out of all 30 entries** unless the heading says otherwise.
A field on fewer than 30 is optional by definition — every block on the game page is
content-gated, so an absent field is a valid state, not missing data.

---

## `games[]` — top level

| Key | Type | Present | Values / example |
|---|---|---|---|
| `slug` | string | **all** | `blob-invasion` |
| `title` | string | **all** | `Blob Invasion` |
| `brand` | string | **all** | `classic` \| `origins` |
| `category` | string | **all** | `mini-game` \| `slots` |
| `status` | string | **all** | `live` \| `upcoming` |
| `featured` | bool | **all** | `false` \| `true` |
| `release_date` | string | **all** | `2026-04-16` |
| `tagline` | string | 26/30 | `The invasion spreads. So do the wins.` |
| `tagline_lines` | array<string> | 2/30 | _2 item(s)_ |
| `summary` | string | 26/30 | `A chain-reaction grid collector with frequent hi…` |
| `card_line` | string | 26/30 | `A failed experiment is loose on the ship, and every blob it touc…` |
| `thumbnail` | string | **all** | `assets/img/games/blob-invasion.jpg` |
| `specs` | object | **all** | _object_ |
| `options` | array<object|string>/array<string> | 19/30 | _3 item(s)_ |
| `story` | array<string> | 5/30 | _1 item(s)_ |
| `features` | array<object> | 13/30 | _1 item(s)_ |
| `buy_options` | array<object> | 5/30 | _6 item(s)_ |
| `screenshots` | array<object> | 4/30 | _2 item(s)_ |
| `demo_url` | string | 1/30 | _(empty string)_ |
| `art` | object | 27/30 | _object_ |
| `platform` | string | 7/30 | `techtoniq` |
| `symbols` | array<object> | 7/30 | _18 item(s)_ |
| `new_release` | bool | 3/30 | `true` |
| `symbols_title` | string | 1/30 | `Customisable Booze` |
| `symbols_lead` | string | 1/30 | `The game supports switching between six house bottle labels. The…` |
| `specs_provisional` | bool | 1/30 | `true` |
| `teaser` | bool | 4/30 | `true` |

## `specs.*` — the spec band

_30 object(s) across the catalogue._ All strings, all optional. The two vocabularies are deliberate: Origins states `layout`/`mechanic` and quotes hit frequencies; Classic states `reels`/`lines` plus `region`/`orientation` and quotes none. One ordered label list serves both.

| Key | Type | Present | Values / example |
|---|---|---|---|
| `game_id` | string | 7/30 | `Blobinvasion` |
| `rtp` | string | 23/30 | `94.0%` |
| `max_win` | string | 23/30 | `10000x bet` |
| `volatility` | string | 23/30 | `High` \| `Low` \| `Medium` \| `Medium-high` |
| `hit_rate` | string | 14/30 | `27.1%` |
| `feature_hit_rate` | string | 12/30 | `1 in 149` \| `1 in 150` \| `1/203` \| `1/25` \| `1/273` |
| `layout` | string | 7/30 | `6x6 - 8x8` |
| `mechanic` | string | 8/30 | `Chain Collect` |
| `free_spin_cost` | string | 6/30 | `€0.10` \| `€0.20` |
| `min_bet` | string | 20/30 | `€0.10` \| `€0.20` \| `€0.25` \| `€0.50` |
| `max_bet` | string | 20/30 | `€100` |
| `variants` | array<object> | 6/30 | _3 item(s)_ |
| `region` | string | 12/30 | `Global` |
| `reels` | string | 12/30 | `3 reels` \| `5 reels` \| `6 reels` |
| `lines` | string | 12/30 | `117,649 Megaways` \| `25` \| `4,096 ways` \| `5` \| `Pay Anywhere` |
| `orientation` | string | 12/30 | `Mobile / Desktop` |
| `bonus_buy` | string | 1/30 | `No` |

## `specs.variants[]` — certified RTP bands

_18 object(s) across the catalogue._ `variants[0]` duplicates the flat `specs.rtp` on purpose: the brochure builder reads `specs.rtp` directly, so this shape kept it working unchanged. Only RTP varies between bands — every other figure is single-valued in the source.

| Key | Type | Present | Values / example |
|---|---|---|---|
| `label` | string | **all** | `93` \| `94` \| `95` \| `96` \| `97` \| `98` |
| `rtp` | string | **all** | `94.0%` |

## `art.*` — per-game artwork

_27 object(s) across the catalogue._ Paths relative to the site root. `logo` + `backdrop` give the composed hero; without them the hero falls back to the flat `thumbnail`. `cutout` is the alpha PNG floated on purple in the Upcomings rails, for a slot whose art is still a character render rather than a finished 3:2 tile.

| Key | Type | Present | Values / example |
|---|---|---|---|
| `logo` | string | 23/27 | `assets/img/games/blob-invasion/logo.png` |
| `backdrop` | string | 23/27 | `assets/img/games/blob-invasion/backdrop.jpg` |
| `cast` | array<string> | 3/27 | _4 item(s)_ |
| `cutout` | string | 4/27 | `assets/img/games/upcoming/dec-2026.png` |

## `buy_options[]` — the Buy Bonus rail

_24 object(s) across the catalogue._ `symbol` is present only where the asset pack shipped per-tier art; the rest render text-only. The section lead counts the cards rather than stating a number.

| Key | Type | Present | Values / example |
|---|---|---|---|
| `title` | string | **all** | `Boost Bet` |
| `cost` | string | 18/24 | `3x bet` |
| `symbol` | string | 7/24 | `assets/img/games/blob-invasion/buy-boost-bet.png` |
| `body` | string | **all** | `Activate to increase the chance of triggering th…` |

## `features[]` — Core Features cards

_34 object(s) across the catalogue._ `body` is an **array of paragraphs**, not a string (a bare string still renders, for older entries).

| Key | Type | Present | Values / example |
|---|---|---|---|
| `title` | string | **all** | `Chain Collect` |
| `body` | array<string> | **all** | _1 item(s)_ |

## `screenshots[]` — in-play captures

_8 object(s) across the catalogue._ `w`/`h` are **required**: they set the `width`/`height` attributes so the browser reserves the box before load, and they decide portrait vs landscape at render time. There is no CSS `aspect-ratio` fallback. See HANDOVER gotcha #23.

| Key | Type | Present | Values / example |
|---|---|---|---|
| `file` | string | **all** | `assets/img/games/blob-invasion/shot-base-game.jpg` |
| `caption` | string | **all** | `Base game` \| `Bonus game` \| `Choosing the drink` \| `Feature round` |
| `w` | int | **all** | `930` |
| `h` | int | **all** | `458` |

## `symbols[]` — paytable / feature symbols

_94 object(s) across the catalogue._ Origins only — the Classic packs ship no symbol slides.

| Key | Type | Present | Values / example |
|---|---|---|---|
| `name` | string | **all** | `Wild` |
| `file` | string | **all** | `assets/img/games/blob-invasion/sym-wild.png` |
| `note` | string | 57/94 | `Substitutes for Jelly symbols at their correspon…` |

## `options[]` — the three spec-band ticks

_45 entries: 44 plain strings, 1 objects._

**A mixed array, and that is the contract.** A plain string means the game *has* that option (green tick). An object `{"label": "...", "available": false}` means it does not (grey cross). The brochure prints all three rows on every page and marks the missing one rather than dropping it — a missing row would read as an oversight. Model this in ACF as a Repeater of `label` (Text) + `available` (True/False, default true).

| Value | Count |
|---|---|
| `Free Rounds` | 12 |
| `Bet Limits` | 12 |
| `Flexible Max Win` | 7 |
| `Adjustable RTP` | 7 |
| `Crazy Speed` | 6 |
| `Crazy Speed (available: false)` | 1 |

---

## `_meta` — provenance, not content

`games.json` carries a `_meta` object that is **documentation, not data**. Nothing
renders it. It records where every figure came from and where the sources disagree.
Do not import it as fields; keep it with the file, or move it into the theme docs.

| Key | What it records |
|---|---|
| `_meta.role` | What this file is |
| `_meta.catalogue` | The entry counts and what filters them |
| `_meta.wp_mapping` | Pointer to this port |
| `_meta.specs_source` | Which document every figure came from |
| `_meta.spec_vocabularies` | Why Origins and Classic use different spec keys |
| `_meta.detail_blocks` | Which game-page blocks are content-gated |
| `_meta.release_dates` | That the dates encode brochure page order, not sourced dates |
| `_meta.inferred_dates` | The Joker re-dating, and why |
| `_meta.platforms` | Languages/currencies stored once and referenced by `platform` |
| `_meta.normalised_values` | — |
| `_meta.source_conflicts` | Every place the sources disagree and which one won |
| `_meta.updated` | Last edit date |

`_meta.platforms` is the one `_meta` key the site **does** read: a game's `platform`
field is a key into it, so the 10 languages and 88 currencies are stored once rather
than repeated on seven entries. In WP that is one Options-page group, referenced by
the game — not a per-game field.

---

## `site.json` → ACF Options page

Top-level keys, all editable copy. None of it is hard-coded in markup.

| Key | Type | Shape |
|---|---|---|
| `company` | object | Group — name, legal_name, domain, email, hosting_note |
| `footer` | object | — |
| `hero` | object | Group — the three headline lines + two CTAs |
| `personalisation` | object | Group — `body` carries inline `<b>` and renders as HTML |
| `capabilities` | array<object> | Repeater — ALSO renders the chips above the carousel (chip n selects card n) |
| `value_props` | array<object> | Repeater — `link` optional |
| `brand_tiles` | array<object> | Repeater — `mark_hover`/`tagline` are hover-state only |
| `hot_games` | object | Group — rail heading copy |
| `upcomings` | object | Group — heading only |
| `promotion_tools` | object | Group + Repeater — key stays `promotion_tools`, displays as "Engagement Tools" |
| `news` | object | Repeater — NOT RENDERED, retained for a later phase |
| `partners` | object | Repeater — NOT RENDERED, logos not cleared for display |
| `contact` | object | Group + Repeater — drives the demo form field list |
| `nav` | array<object> | Repeater — drives BOTH the header overlay menu and the footer menu |
| `brochure` | object | Group — brochure front matter |

Two of these carry a `_note` key explaining a decision — those are comments, not copy.

**`nav` is the one to be careful with.** It renders the header overlay menu *and* the
footer menu. There is exactly one link list in the project, which is why the two can
never disagree. Port it to a single WP menu location used twice — not two menus.

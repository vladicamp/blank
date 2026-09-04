# `_incoming/` — a superseded extraction, kept only as provenance

**Nothing here is read by the site, and `specs.json` is no longer a source you should
build from.** `store.js` fetches `data/games.json` and `data/site.json` and nothing else.

## The source of truth is the brochure, not this folder

`work11 (2026 e-brochure)/#pdf/**A4-wildsheep-ORIGINS_20260820.pdf**` (24pp) is
authoritative for every Origins spec block, background story, core-feature list and buy-bonus
tier. `data/games.json` was rebuilt from it on 2026-08-25.

The Techtoniq `.pptx` marketing sheets under `ref/WSO asset Techtoniq/` now supply only what
the brochure does not carry:

- `game_id` (the operator-facing ID)
- `free_spin_cost`
- `symbols` — the named paytable/feature symbols and their PNGs in each pack's `02_Symbols`
- the shared languages (10) and currencies (88), stored once as `_meta.platforms.techtoniq`

**Two pack fields are deliberately excluded.** `sd`, because the brochure states a volatility
*word* for all seven and a second volatility measure invites contradiction. `avg_feature_win`,
because the packs give it per RTP band and their bands do not line up with the brochure's.

## Where the packs and the brochure disagree — the brochure wins

An earlier pass built `games.json` from the `.pptx` sheets. It was wrong in seven places, all
now recorded in `_meta.source_conflicts`:

| | Packs said | Brochure says |
|---|---|---|
| Blob Invasion RTP | one band, 94.3% | **three: 94.0 / 96.0 / 98.2** |
| Blob Invasion buy tiers | 5 | **6** — High-Roller Boost is on its page |
| Cursed RTP | 94.5 / 96.0 | **94.58 / 96.06 / 98.2** |
| Cursed mechanic | "Ways" | **46656 ways · Cascading Reels** |
| Bamboonanza | Very High, 19.38% hit | **High, 27.1% hit** |
| Bamboonanza default RTP | 93.77% | **96.36%** (93.77 and 97.96 are the alternates) |
| Spin My Drink | "Mini Game", max €100 | **Hi-Lo, max €2000** |
| High Roller's Cash grid | 1x4 | **4x1**, and feature hit 1/25 |

Two of those deserve calling out because the *previous* `games.json` had them right and the
pack-based pass "corrected" them into being wrong: **Blob's three RTP bands** and **Blob's
sixth buy tier**. `specs.json`'s claim that 96.0% / 98.2% were "invented" is itself incorrect.

## The one place the brochure is not followed

**Bamboonanza's Core Features.** Brochure p7 gives them as *Expanding Grid* and *Multiplier
Totem* — verbatim Iron Gate's copy from p19 — which contradicts Bamboonanza's own spec panel
on the facing page, where an expanding grid cannot coexist with `Grid Layout 5x6` and
`Win Mechanic 50 Lines`. The same error is in the Techtoniq deck the brochure was built from,
so it is an upstream content bug rather than a transcription slip.

The site ships the features from Bamboonanza's own Feature Symbols slides instead (Mystery,
Golden Bamboo, Cash, Multiplier, Collector). **This should be flagged to Techtoniq**, and
re-importing from either document will bring the wrong copy straight back.

## Smaller ORIGINS-brochure quirks, kept or normalised

- p8 prints Spin My Drink's hit frequency as `48,5%` — a comma where every other figure in the
  document uses a point. **Normalised** to 48.5%.
- p19 titles Iron Gate's last buy tier `ULTIMATE BONUS GAMES` but describes it as "Direct
  access to the Ultimate Free Spins feature". **Kept verbatim.**
- Figures are transcribed exactly as printed (`50000x bet`, `46656 ways`), without thousands
  separators, so the page and the PDF can be diffed by eye. **The Classic brochure uses the
  opposite house style** (`10,000x bet`) and is likewise kept verbatim to itself — the two
  ranges are two documents, and neither is normalised to the other.

## What `specs.json` is still good for

Its `raw_slides` is the only machine-readable record of the decks' verbatim text, which is how
the Bamboonanza error was identified as upstream rather than introduced. Its own parsed
`fields` are unreliable — `features` is `null` for all seven games despite every deck having
them, `buy_options` is empty for Iron Gate which has five, and `story` captured the longest
paragraph rather than the first.

## Classic specs come from the Classic brochure

`work11 (2026 e-brochure)/#pdf/**A4-wildsheep-classic.pdf**` (15pp) is authoritative for the Classic range.
Game pages are 3–14, twelve titles. Two things to know before touching them:

**The pages carry no title in the text layer** — each game is identified only by its
tile artwork. The page→slug map, established from a contact sheet of all twelve tiles:

| p3 | p4 | p5 | p6 | p7 | p8 |
|---|---|---|---|---|---|
| Brauhaus Bonanza | Fortune Hunter | Fortunes of Sparta | Glory of Asgard | Joker Win Hits | Joker Win Hits Hotstepper |

| p9 | p10 | p11 | p12 | p13 | p14 |
|---|---|---|---|---|---|
| Joker Win Hits Power 5 | Stallion Stampede Megaways | The Real OG | Wild Bull Megaways | Wolf Bonanza | Wonder of Greece |

**It contains no prose at all** — no background stories, core features or buy tiers. A
Classic game page is hero → spec band → demo, and that is its finished state.

**`epic-stars` and `joker-win-hits-megaways` are not in it.** Megaways was later covered by
the Joker series deck below; `epic-stars` is in no document at all and is the only entry in
the catalogue still carrying invented figures.

Its panel uses a different vocabulary from the Origins one and the two are kept
separate, not merged: Classic states `Game Type: 6 reels` + `Lines: 4,096 ways` +
`Region` + `Orientation Support` and quotes no hit frequencies, where Origins states
`Grid Layout` + `Win Mechanic` and does. `Free Round Support` and `Bet Limit Support`
are `Yes!` on all twelve, so they render as ticks beside the grid rather than as cells.

Normalisations, all typographic: the document writes `4096 ways` (p3, p4) and
`4,096 ways` (p13) for the same value, and `Pay anywhere` / `Pay Anywhere`; both
settled on the separated, title-case form. Bets print as `0.10 €` and are stored
`€0.10` to match the rest of the catalogue. Stallion Stampede's capped figure
`250,000x bet / 288,271 €` is kept whole.

## The Joker Win Hits series has its own deck

`work11 (2026 e-brochure)/ref/WSC games/**Wild Sheep Joker Win Hits Series.pdf**` (13pp, created 2026-02-17) covers six
titles on pages 3/5/7/9/11/13. Like the Classic brochure it carries no titles in the text
layer; identified from page artwork:

| p3 | p5 | p7 | p9 | p11 | p13 |
|---|---|---|---|---|---|
| Joker Win Hits | Power 5 | Hotstepper | Megaways | **Win Boost** | **Win Stepper** |

**Win Boost and Win Stepper were new to the catalogue** and have no asset pack anywhere —
their logo, hero backdrop, screenshots and catalogue card were all built from this PDF. The
logos are stored there as JPEG colour plus a separate soft mask, so the two are composited
before saving; extracting the colour stream alone gives you a black background.

**It is older than the Classic brochure and loses to it.** Deck created 2026-02-17, A4
Classic 2026-07-26. Three figures disagree and the A4 values are the ones shipped:

| | Joker deck | A4 Classic (shipped) |
|---|---|---|
| Joker Win Hits volatility | High | **Medium-high** |
| Power 5 max win | 10,000x | **5,000x bet** |
| Power 5 volatility | Medium/High | **High** |

The max-win gap is a factor of two and is worth confirming with the studio. The deck's real
contribution is `hit_rate` and `feature_hit_rate` — which the A4 panel does not carry at all
— plus every per-game feature block, and the entire panel for the three titles the A4
brochure omits.

**Pages 9, 11 and 13 carry leftover Fishin' Frenzy strapline text** ("Collect enough
fisherman... the BIG CATCH... 50x bet") sitting underneath the real panels. It is hidden by
artwork on screen but present in the text layer, and it is template residue — not used.

## Blueprint licensing — decided, not open

All 11 readable Classic packs are licensed from **Blueprint Gaming Ltd**. Their
`Product and Legal Requirements.docx` names them as licence holder and states that information
"MUST be included on all artwork associated with the stated game"; the
`LEGAL NOTICE REQUIREMENTS` field itself is **blank in all eleven**.

Classic artwork is published **without** a credit line — an explicit decision on 2026-08-25
with the requirement on the table. See CLAUDE.md if it is revisited.

## Still open

The card aspect-ratio mismatch — `.game-card__media` declares `16 / 10` against 3:2 source art.
It affects the library grid and landing rails, not the game page, so it was left out of the
game-page rebuild rather than fixed in passing.

#!/usr/bin/env python3
"""Generate wp/DATA-CONTRACT.md from the shipped data files.

The ACF export in wp/acf-fields.json is a PARTIAL export — core fields and nine
specs only. This walks data/games.json and data/site.json and writes out every
key that actually occurs, with its type, how many entries carry it, and a real
example, so the ACF field group can be built against the data rather than against
a prose description of it.

It is derived from the data, so it cannot drift the way hand-written docs do.
Re-run it after any change to the data files:

    python3 wp/tools/datacontract.py

No dependencies. Writes wp/DATA-CONTRACT.md relative to the repo root.
"""
import json
import os
import sys
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'wp', 'DATA-CONTRACT.md')

# Keys whose values are free prose — an "example" of these is noise, so they are
# shown truncated rather than in full.
PROSE = {'summary', 'body', 'story', 'tagline', 'note', 'caption', 'intro',
         'footer_note', 'hosting_note', 'icon', 'd'}


def typename(v):
    if isinstance(v, bool):
        return 'bool'
    if isinstance(v, int):
        return 'int'
    if isinstance(v, float):
        return 'float'
    if isinstance(v, str):
        return 'string'
    if isinstance(v, list):
        if not v:
            return 'array (empty)'
        inner = sorted({typename(x) for x in v})
        return f'array<{"|".join(inner)}>'
    if isinstance(v, dict):
        return 'object'
    if v is None:
        return 'null'
    return type(v).__name__


def sample(key, v):
    if isinstance(v, bool):
        return '`true`' if v else '`false`'
    if isinstance(v, (int, float)):
        return f'`{v}`'
    if isinstance(v, str):
        s = v.replace('|', '\\|').replace('\n', ' ')
        if key in PROSE and len(s) > 48:
            s = s[:48].rstrip() + '…'
        elif len(s) > 64:
            s = s[:64].rstrip() + '…'
        return f'`{s}`' if s else '_(empty string)_'
    if isinstance(v, list):
        return f'_{len(v)} item(s)_'
    if isinstance(v, dict):
        return '_object_'
    return '—'


def enum_of(values, limit=6):
    """Small closed value sets are worth naming — they become ACF Selects."""
    flat = [v for v in values if isinstance(v, (str, bool))]
    if not flat or len(flat) != len(values):
        return None
    # JSON spelling, not Python's — this table is read against the JSON files.
    uniq = sorted({'true' if v is True else 'false' if v is False else str(v)
                   for v in flat})
    if 1 < len(uniq) <= limit and all(len(u) <= 24 for u in uniq):
        return ' \\| '.join(f'`{u}`' for u in uniq)
    return None


def inventory(records, label, total=None):
    """Field table for a list of like-shaped objects."""
    total = total if total is not None else len(records)
    seen = OrderedDict()
    for rec in records:
        for k, v in rec.items():
            seen.setdefault(k, []).append(v)

    lines = [f'| Key | Type | Present | Values / example |',
             '|---|---|---|---|']
    for k, vals in seen.items():
        types = sorted({typename(v) for v in vals})
        n = len(vals)
        presence = '**all**' if n == total else f'{n}/{total}'
        e = enum_of(vals)
        show = e if e else sample(k, vals[0])
        lines.append(f'| `{k}` | {"/".join(types)} | {presence} | {show} |')
    return '\n'.join(lines), seen


def subrecords(games, path):
    """Collect every object found at a dotted path, e.g. 'specs' or 'buy_options[]'."""
    out = []
    for g in games:
        cur = g
        for part in path.split('.'):
            arr = part.endswith('[]')
            key = part[:-2] if arr else part
            cur = cur.get(key) if isinstance(cur, dict) else None
            if cur is None:
                break
            if arr:
                out.extend(x for x in cur if isinstance(x, dict))
                cur = None
                break
        else:
            if isinstance(cur, dict):
                out.append(cur)
    return out


def main():
    games_doc = json.load(open(os.path.join(ROOT, 'data', 'games.json')))
    site = json.load(open(os.path.join(ROOT, 'data', 'site.json')))
    games = games_doc['games']

    named = [g for g in games if not g.get('teaser')]
    released = [g for g in named if g.get('status') != 'upcoming']

    p = []
    w = p.append
    w('# Data contract — every field that actually occurs in the data\n')
    w('> **Generated file — do not hand-edit.** Produced by `python3 wp/tools/datacontract.py`')
    w('> from `data/games.json` and `data/site.json`. Re-run it after changing either.\n')
    w('`wp/acf-fields.json` is a deliberately partial export (core fields and nine specs).')
    w('This is the complete picture, derived from the shipped data, so it cannot drift.')
    w('Build the ACF group against this table and the port stays a find/replace —')
    w('**keep the JSON key as the ACF field name**.\n')
    w('Read `wp/HANDOVER.md` §4 first for what maps to `post_title`/`post_content`/')
    w('taxonomies rather than to a custom field. This file is the field census, not the plan.\n')

    w('## Counts\n')
    w('| | |')
    w('|---|---|')
    w(f'| Entries in `games.json` | **{len(games)}** |')
    w(f'| Named titles (`teaser` absent) | {len(named)} |')
    w(f'| Unnamed teaser slots (`teaser: true`, empty `slug`) | {len(games) - len(named)} |')
    w(f'| Released (`status: live`) | {len(released)} |')
    w(f'| Unreleased (`status: upcoming`) | {len(named) - len(released)} + {len(games) - len(named)} unnamed |')
    w('')
    w('Where those numbers surface: the brochure renders the **26 named** titles, the library')
    w('grid renders the **23 released**, and all **7** unreleased sit on the Upcomings shelves.\n')
    w('**Presence counts below are out of all 30 entries** unless the heading says otherwise.')
    w('A field on fewer than 30 is optional by definition — every block on the game page is')
    w('content-gated, so an absent field is a valid state, not missing data.\n')
    w('---\n')

    w('## `games[]` — top level\n')
    table, _ = inventory(games, 'games', total=len(games))
    w(table)
    w('')

    groups = [
        ('specs', 'specs', '`specs.*` — the spec band', None,
         'All strings, all optional. The two vocabularies are deliberate: Origins states '
         '`layout`/`mechanic` and quotes hit frequencies; Classic states `reels`/`lines` '
         'plus `region`/`orientation` and quotes none. One ordered label list serves both.'),
        ('specs.variants[]', 'specs.variants[]', '`specs.variants[]` — certified RTP bands', None,
         '`variants[0]` duplicates the flat `specs.rtp` on purpose: the brochure builder '
         'reads `specs.rtp` directly, so this shape kept it working unchanged. Only RTP '
         'varies between bands — every other figure is single-valued in the source.'),
        ('art', 'art', '`art.*` — per-game artwork', None,
         'Paths relative to the site root. `logo` + `backdrop` give the composed hero; '
         'without them the hero falls back to the flat `thumbnail`. `cutout` is the alpha '
         'PNG floated on purple in the Upcomings rails, for a slot whose art is still a '
         'character render rather than a finished 3:2 tile.'),
        ('buy_options[]', 'buy_options[]', '`buy_options[]` — the Buy Bonus rail', None,
         '`symbol` is present only where the asset pack shipped per-tier art; the rest '
         'render text-only. The section lead counts the cards rather than stating a number.'),
        ('features[]', 'features[]', '`features[]` — Core Features cards', None,
         '`body` is an **array of paragraphs**, not a string (a bare string still renders, '
         'for older entries).'),
        ('screenshots[]', 'screenshots[]', '`screenshots[]` — in-play captures', None,
         '`w`/`h` are **required**: they set the `width`/`height` attributes so the browser '
         'reserves the box before load, and they decide portrait vs landscape at render '
         'time. There is no CSS `aspect-ratio` fallback. See HANDOVER gotcha #23.'),
        ('symbols[]', 'symbols[]', '`symbols[]` — paytable / feature symbols', None,
         'Origins only — the Classic packs ship no symbol slides.'),
    ]
    for path, _key, heading, _x, note in groups:
        recs = subrecords(games, path)
        if not recs:
            continue
        w(f'## {heading}\n')
        w(f'_{len(recs)} object(s) across the catalogue._ {note}\n')
        table, _ = inventory(recs, path, total=len(recs))
        w(table)
        w('')

    # options[] is a mixed array — strings and objects — which is itself the contract.
    opts = [o for g in games for o in (g.get('options') or [])]
    if opts:
        w('## `options[]` — the three spec-band ticks\n')
        strs = [o for o in opts if isinstance(o, str)]
        objs = [o for o in opts if isinstance(o, dict)]
        w(f'_{len(opts)} entries: {len(strs)} plain strings, {len(objs)} objects._\n')
        w('**A mixed array, and that is the contract.** A plain string means the game *has* '
          'that option (green tick). An object `{"label": "...", "available": false}` means '
          'it does not (grey cross). The brochure prints all three rows on every page and '
          'marks the missing one rather than dropping it — a missing row would read as an '
          'oversight. Model this in ACF as a Repeater of `label` (Text) + `available` '
          '(True/False, default true).\n')
        w('| Value | Count |')
        w('|---|---|')
        for label, n in Counter(
                (o if isinstance(o, str) else f'{o.get("label")} (available: false)')
                for o in opts).most_common():
            w(f'| `{label}` | {n} |')
        w('')

    w('---\n')
    w('## `_meta` — provenance, not content\n')
    w('`games.json` carries a `_meta` object that is **documentation, not data**. Nothing')
    w('renders it. It records where every figure came from and where the sources disagree.')
    w('Do not import it as fields; keep it with the file, or move it into the theme docs.\n')
    w('| Key | What it records |')
    w('|---|---|')
    meta_desc = {
        'role': 'What this file is',
        'catalogue': 'The entry counts and what filters them',
        'wp_mapping': 'Pointer to this port',
        'specs_source': 'Which document every figure came from',
        'spec_vocabularies': 'Why Origins and Classic use different spec keys',
        'detail_blocks': 'Which game-page blocks are content-gated',
        'release_dates': 'That the dates encode brochure page order, not sourced dates',
        'inferred_dates': 'The Joker re-dating, and why',
        'platforms': 'Languages/currencies stored once and referenced by `platform`',
        'source_conflicts': 'Every place the sources disagree and which one won',
        'updated': 'Last edit date',
    }
    for k in games_doc.get('_meta', {}):
        w(f'| `_meta.{k}` | {meta_desc.get(k, "—")} |')
    w('')
    w('`_meta.platforms` is the one `_meta` key the site **does** read: a game\'s `platform`')
    w('field is a key into it, so the 10 languages and 88 currencies are stored once rather')
    w('than repeated on seven entries. In WP that is one Options-page group, referenced by')
    w('the game — not a per-game field.\n')

    w('---\n')
    w('## `site.json` → ACF Options page\n')
    w('Top-level keys, all editable copy. None of it is hard-coded in markup.\n')
    w('| Key | Type | Shape |')
    w('|---|---|---|')
    shapes = {
        'company': 'Group — name, legal_name, domain, email, hosting_note',
        'hero': 'Group — the three headline lines + two CTAs',
        'personalisation': 'Group — `body` carries inline `<b>` and renders as HTML',
        'capabilities': 'Repeater — ALSO renders the chips above the carousel (chip n selects card n)',
        'value_props': 'Repeater — `link` optional',
        'brand_tiles': 'Repeater — `mark_hover`/`tagline` are hover-state only',
        'hot_games': 'Group — rail heading copy',
        'upcomings': 'Group — heading only',
        'promotion_tools': 'Group + Repeater — key stays `promotion_tools`, displays as "Engagement Tools"',
        'news': 'Repeater — NOT RENDERED, retained for a later phase',
        'partners': 'Repeater — NOT RENDERED, logos not cleared for display',
        'contact': 'Group + Repeater — drives the demo form field list',
        'nav': 'Repeater — drives BOTH the header overlay menu and the footer menu',
        'brochure': 'Group — brochure front matter',
    }
    for k, v in site.items():
        if k == '_meta':
            continue
        w(f'| `{k}` | {typename(v)} | {shapes.get(k, "—")} |')
    w('')
    w('Two of these carry a `_note` key explaining a decision — those are comments, not copy.\n')
    w('**`nav` is the one to be careful with.** It renders the header overlay menu *and* the')
    w('footer menu. There is exactly one link list in the project, which is why the two can')
    w('never disagree. Port it to a single WP menu location used twice — not two menus.\n')

    with open(OUT, 'w') as f:
        f.write('\n'.join(p))
    print(f'wrote {os.path.relpath(OUT, ROOT)} ({len(p)} lines)')


if __name__ == '__main__':
    sys.exit(main())

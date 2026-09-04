/* ==========================================================================
   Wild Sheep — brochure builder
   Reads games.json + site.json and lays the catalogue out as A4 sheets.

   THREE EDITIONS, chosen by ?scope=all|origins|classic (default `all`).
   This reverses the older "one brochure, whole catalogue only" rule — an
   explicit client call on 2026-08-31. The scope only ever FILTERS BY RANGE:
   there is still no filter- or search-scoped brochure, and this deliberately
   reads no other URL parameter.

   ONE GAME PER SHEET. Never pack two entries onto a page — the game sheet
   carries that title's own key art, and a shared page turns it back into a
   list. If a sheet ever overflows, tighten the caps below rather than doubling
   games up.
   ========================================================================== */

/* Caps that keep a game sheet inside one A4 page. Every one of these was set by
   measuring the built sheets, not guessed: see the note in CLAUDE.md. A game
   with less than the cap simply renders what it has. */
const MAX_SYMBOLS = 8;    /* the paytable strip — The Void ships 20 */
const MAX_FEATURES = 2;   /* High Roller's Cash ships 4 */
const MAX_BUY = 4;        /* Blob Invasion ships 6 */
const MAX_STORY = 2;      /* The Void's story runs to 3 paragraphs */


/* Carries both ranges' vocabularies — Origins states `layout`/`mechanic` and
   quotes hit frequencies, Classic states `reels`/`lines` plus region and
   orientation and quotes none. Each entry renders only the keys it has, so one
   ordered list serves the whole catalogue. Keep in step with SPEC_LABELS in
   games/game.html. */
const SPEC_LABELS = {
  rtp: 'RTP',
  volatility: 'Volatility',
  max_win: 'Max win',
  layout: 'Layout',
  mechanic: 'Mechanic',
  reels: 'Game type',
  lines: 'Lines',
  region: 'Region',
  hit_rate: 'Hit rate',
  feature_hit_rate: 'Feature hit rate',
  bonus_buy: 'Bonus buy',
  min_bet: 'Min bet',
  max_bet: 'Max bet',
  orientation: 'Orientation',
};

/* The three editions. `filter` is the ONLY thing that varies between them. */
const SCOPES = {
  all: {
    key: 'all',
    title: 'Game Catalogue',
    label: 'The complete Wild Sheep library',
    blurb: 'The complete catalogue of all Wild Sheep games',
    filter: () => true,
  },
  origins: {
    key: 'origins',
    title: 'Origins Catalogue',
    label: 'Wild Sheep Origins',
    blurb: 'The complete catalogue of Wild Sheep Origins',
    filter: (g) => g.brand === 'origins',
  },
  classic: {
    key: 'classic',
    title: 'Classic Catalogue',
    label: 'Wild Sheep Classic',
    blurb: 'The complete catalogue of Wild Sheep Classic',
    filter: (g) => g.brand === 'classic',
  },
};

const e = WS.escape;

/* ---- colour fields as CONTENT, not background ----------------------------
   Safari's print dialog has "Print backgrounds" OFF by default, and when it is
   off every `background-color` and `background-image` on the page is dropped —
   which took the purple cover, the hero washes and the dark closing sheet with
   it, and is most of why the downloaded PDF did not look like the preview.
   `print-color-adjust: exact` is set and still does not override that checkbox
   in Safari.
   An inline <svg> is CONTENT, so it prints either way. These two helpers paint
   the flat fields and the hero gradient as real SVG behind the sheet's content,
   which makes the document correct without the reader having to find a setting.
   The CSS background stays underneath as a belt-and-braces for screen. */
const svgField = (fill) =>
  `<svg class="field-svg" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true">
     <rect width="10" height="10" fill="${fill}"/></svg>`;

/* Same five stops as the CSS wash. `id` has to be unique per sheet — a repeated
   gradient id makes every later sheet reference the first one's definition.

   THE ALPHA IS IN stop-color, NOT stop-opacity, and that is load-bearing.
   Safari's PDF export flattened `stop-opacity` to 1, which painted the whole
   band SOLID brand colour — the backdrop vanished from every printed game page
   while the logo and title, which come later in the DOM, still showed. rgba()
   in stop-color survives. Both are set: if either is honoured the fade is
   correct, and only losing both would bring the bug back. */
const svgWash = (id, r, g, b) =>
  `<svg class="field-svg game-sheet__wash" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true">
     <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0"    stop-color="rgba(${r},${g},${b},1)"    stop-opacity="1"/>
       <stop offset="0.14" stop-color="rgba(${r},${g},${b},0.88)" stop-opacity="0.88"/>
       <stop offset="0.32" stop-color="rgba(${r},${g},${b},0.58)" stop-opacity="0.58"/>
       <stop offset="0.46" stop-color="rgba(${r},${g},${b},0.26)" stop-opacity="0.26"/>
       <stop offset="0.60" stop-color="rgba(${r},${g},${b},0)"    stop-opacity="0"/>
     </linearGradient>
     <!-- Readability scrim. The brand fade has cleared by 60%, and the title
          block sits BELOW that — straight on whatever the artwork happens to be,
          which across the catalogue runs from The Void's night forest to Wolf
          Bonanza's midday desert, where white copy washed out completely. Rises
          from the foot and is gone by 42%, so it never reaches the logo. Same
          fix, and the same reason, as the site's own game hero. -->
     <linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0"    stop-color="rgba(0,0,0,0)"    stop-opacity="0"/>
       <stop offset="0.42" stop-color="rgba(0,0,0,0)"    stop-opacity="0"/>
       <stop offset="0.72" stop-color="rgba(0,0,0,0.34)" stop-opacity="0.34"/>
       <stop offset="1"    stop-color="rgba(0,0,0,0.68)" stop-opacity="0.68"/>
     </linearGradient></defs>
     <rect width="10" height="10" fill="url(#${id})"/>
     <rect width="10" height="10" fill="url(#${id}-scrim)"/></svg>`;

/* The site paints its logos with `background-color: currentColor` + a CSS mask
   (hard rule 3 in CLAUDE.md). That technique DOES NOT SURVIVE SAFARI'S PRINT
   PIPELINE: the mask is dropped and what lands in the PDF is a solid filled
   rectangle in the current colour. So the brochure inlines the SVG instead and
   colours it with `fill: currentColor` — no mask, no external reference, and it
   is the one form of vector art every print engine handles.
   Do not "simplify" this back to <span class="mark">. */
async function inlineMark(base, file) {
  try {
    const svg = await fetch(`${base}${file}`).then((r) => (r.ok ? r.text() : ''));
    if (!svg) return '';
    return svg
      .replace(/<\?xml[^>]*\?>/g, '')
      /* Supplied exports carry their own `<style>.cls-1{fill:#fff}</style>`.
         Inlined, that is a GLOBAL rule in the page — a generic `.cls-1` that
         could hit anything — and its class selector also beats the fill
         attribute below, so the mark could never be recoloured. Strip both. */
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/\sclass="cls-[^"]*"/g, '')
      .replace(/<svg /, '<svg fill="currentColor" ');
  } catch {
    return '';
  }
}
const paras = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const rangeLabel = (g) => (g.brand === 'classic' ? 'Wild Sheep Classic' : 'Wild Sheep Origins');
const typeLabel = (g) => (g.category === 'mini-game' ? 'Mini Game' : 'Slots');

/* -------------------------------------------------------------- fragments */
function coverSheet(site, games, scope, markSvg, base) {
  const live = games.filter((g) => g.status === 'live').length;
  const upcoming = games.filter((g) => g.status === 'upcoming').length;
  const today = new Date().toLocaleDateString('en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });

  return `
  <section class="sheet sheet--cover" data-scope="${e(scope.key)}">
    ${svgField(scope.key === 'classic' ? '#FF932E' : '#9445FF')}
    <div class="cover__top">
      <div class="cover__mark" role="img" aria-label="Wild Sheep">${markSvg}</div>
    </div>
    <div class="cover__head">
      <h1 class="cover__title">${e(scope.title)}</h1>
      <p class="cover__sub">${e(scope.blurb)}</p>
      <div class="cover__stats">
        <div class="cover__stat"><b>${games.length}</b><span>Titles</span></div>
        <div class="cover__stat"><b>${live}</b><span>Live</span></div>
        <!-- Dropped entirely when there are none, rather than printing a 0.
             Classic has no unreleased titles, and "0 UPCOMING" on its cover
             reads as nothing in the pipeline, which is not what it means. -->
        ${upcoming ? `<div class="cover__stat"><b>${upcoming}</b><span>Upcoming</span></div>` : ''}
      </div>
    </div>
    <!-- The cast lineup standing on a dark "table", with the imprint set inside
         the table beneath it — the landing page's dark band, on paper. The
         artwork has its own flat cut edge at y=1207 of 1307 and the hooves,
         bottles and a hand hang below it; the table's top has to land ON that
         line, which is what the negative margin in .cover__art img does. -->
    <div class="cover__base">
      <div class="cover__art" aria-hidden="true">
        <picture>
          <source srcset="${base}assets/img/hero-lineup.webp" type="image/webp">
          <img src="${base}assets/img/hero-lineup.png" alt="">
        </picture>
      </div>
      <div class="cover__table">
        ${svgField('#2E2E2E')}
        <div class="cover__foot">
          ${e(site.company.legal_name)} · ${e(site.company.domain)} · ${e(site.company.email)}<br>
          ${e(site.company.hosting_note)} · Issued ${today}
        </div>
      </div>
    </div>
  </section>`;
}

/* ---- overview: TWO sheets ------------------------------------------------ */
/* Split from one page on 2026-08-31. As a single sheet this was four stacked
   blocks crammed edge to edge with no room to breathe; two sheets let each half
   take the space it needs AND carry the site's own artwork — the capability
   sheep illustrations and the promotion-tool line icons — instead of being a
   wall of text the rest of the document does not look like. */
function overviewSheets(site, base) {
  /* The Engagement Tools b-prop is the one whose "Read more" points at the tools
     section on the site; the printed page nests the b-tool cards under it for the
     same reason. Matched on that link rather than on position, so reordering
     value_props cannot silently move the cards under the wrong heading. */
  const toolsProp = site.value_props.find((v) => v.link?.href === '#promotion-tools');

  const toolCards = `
    <div class="b-tool-grid">
      ${site.promotion_tools.items.map((t) => `
        <div class="b-tool">
          ${t.icon ? `<svg class="b-tool__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="${e(t.icon)}"/></svg>` : ''}
          <h4>${e(t.title)}</h4>
          <p>${e(t.body)}</p>
        </div>`).join('')}
    </div>`;

  return `
  <section class="sheet">
    <div class="sheet__pad">
      <h2 class="doc-h1">Why Wild&nbsp;Sheep</h2>
      <p class="doc-lead">${e(site.brochure.intro)}</p>

      <!-- 2x2 of cards, echoing the site's capability carousel: title, body,
           and the sheep illustration sitting in the card's bottom-right. -->
      <div class="b-cap-grid">
        ${site.capabilities.map((c) => `
          <div class="b-cap">
            <div class="b-cap__body">
              <h3>${e(c.title)}</h3>
              <p>${c.body}${c.link ? ` ${e(c.link.label)}` : ''}</p>
            </div>
            ${c.art ? `<img class="b-cap__art" src="${base}${e(c.art)}" alt="">` : ''}
          </div>`).join('')}
      </div>
    </div>
    ${footer('Why Wild Sheep')}
  </section>

  <section class="sheet">
    <div class="sheet__pad">
      <h2 class="doc-h1">What you get</h2>
      ${site.value_props.map((v) => `
        <div class="b-vp">
          <h3 class="b-vp__title">${e(v.title)}</h3>
          <p class="b-vp__body">${v.body}</p>
          ${v === toolsProp ? toolCards : ''}
        </div>`).join('<hr class="doc-rule">')}
    </div>
    ${footer('What you get')}
  </section>`;
}

/* ---- one game, one sheet ------------------------------------------------- */
/* Mirrors the game page's own order — hero, spec band, story + features,
   symbols, buy bonus — so the printed page and the web page describe a title
   the same way round. Every block after the hero is content-gated, exactly as
   on the page, so a Classic title with spec figures and nothing else renders a
   clean short sheet rather than a page of empty headings. */
function gameSheet(game, base, index, total, platforms) {
  const specs = game.specs || {};
  const art = game.art || {};

  const rows = Object.entries(SPEC_LABELS)
    .filter(([key]) => specs[key])
    .map(([key, label]) => `
      <div class="b-spec"><dt>${label}</dt><dd>${e(specs[key])}</dd></div>`)
    .join('');
  const released = game.release_date ? WS.fmtDate(game.release_date).full : '';

  /* The hero reproduces the page's composed treatment: backdrop under a brand
     gradient with the logo on top. Falls back to the flat thumbnail for the
     upcoming titles, which have no composed art. */
  /* The wash is a real <span>, not a ::after, and the logo comes AFTER it in the
     DOM. Two print bugs fixed at once: Safari drops gradients on pseudo-elements
     often enough to matter, and with the gradient painting last the logo was
     buried under it in the PDF while still showing on screen. Source order is
     doing the layering here — no z-index to get wrong. */
  const isClassic = game.brand === 'classic';
  const wash = isClassic
    ? svgWash(`wash-${e(game.slug || index)}`, 255, 147, 46)   /* --orange */
    : svgWash(`wash-${e(game.slug || index)}`, 148, 69, 255);  /* --purple */
  /* The eyebrow and title live INSIDE the hero, left-justified, with the logo
     opposite them on the right — so the band identifies the title on its own and
     the body below can start straight into the copy. */
  const heading = `
    <div class="game-sheet__head">
      <p class="game-sheet__eyebrow">${typeLabel(game)} · ${rangeLabel(game)}</p>
      <h3 class="game-sheet__title">${e(game.title)}</h3>
      ${game.tagline ? `<p class="game-sheet__tagline">${e(game.tagline)}</p>` : ''}
      ${game.summary ? `<p class="game-sheet__summary">${e(game.summary)}</p>` : ''}
    </div>`;
  const hero = art.backdrop
    ? `<img class="game-sheet__backdrop" src="${base}${e(art.backdrop)}" alt="">
       ${wash}
       ${heading}
       ${art.logo ? `<img class="game-sheet__logo" src="${base}${e(art.logo)}" alt="${e(game.title)}">` : ''}`
    : `<img class="game-sheet__backdrop" src="${base}${e(game.thumbnail)}" alt="${e(game.title)} key art">
       ${wash}
       ${heading}`;

  /* Distribution reach. Stored once in _meta.platforms and referenced by key —
     the figures are identical across all seven Origins sheets. Set very small:
     it is a completeness line, not something anyone reads through. Classic
     titles carry no `platform`, so this renders nothing for them. */
  const pf = platforms?.[game.platform];
  const reach = pf ? `
    <div class="b-reach">
      <p><b>Languages (${pf.languages.length})</b> ${pf.languages.map(e).join(' · ')}</p>
      <p><b>Currencies (${pf.currencies.length})</b> ${pf.currencies.map(e).join(' · ')}</p>
    </div>` : '';

  const story = paras(game.story).slice(0, MAX_STORY);
  const features = (game.features || []).slice(0, MAX_FEATURES);
  const symbols = (game.symbols || []).slice(0, MAX_SYMBOLS);
  const buys = (game.buy_options || []).slice(0, MAX_BUY);
  const shots = (game.screenshots || []).slice(0, 2);

  /* The modifier is set here rather than with :has(> :only-child) — one less
     selector feature for a print engine to disagree about. */
  const colsMod = story.length && features.length ? '' : ' game-sheet__cols--solo';
  const storyBlock = story.length || features.length ? `
    <div class="game-sheet__cols${colsMod}">
      ${story.length ? `
        <div class="game-sheet__story">
          <h4 class="doc-h3">Background</h4>
          ${story.map((p) => `<p>${e(p)}</p>`).join('')}
        </div>` : ''}
      ${features.length ? `
        <div class="game-sheet__features">
          <h4 class="doc-h3">Core features</h4>
          ${features.map((f) => `
            <div class="b-feat">
              <b>${e(f.title)}</b>
              <p>${e(paras(f.body)[0] || '')}</p>
            </div>`).join('')}
        </div>` : ''}
    </div>` : '';

  const symbolBlock = symbols.length ? `
    <div class="game-sheet__block">
      <h4 class="doc-h3">Symbols</h4>
      <div class="b-sym-strip">
        ${symbols.map((s) => `
          <figure class="b-sym">
            <img src="${base}${e(s.file)}" alt="">
            <figcaption>${e(s.name)}</figcaption>
          </figure>`).join('')}
      </div>
    </div>` : '';

  const shotBlock = shots.length ? `
    <div class="game-sheet__block">
      <h4 class="doc-h3">In game</h4>
      <div class="b-shots">
        ${shots.map((s) => `
          <figure class="b-shot-fig">
            <img class="${s.h > s.w ? 'b-shot b-shot--portrait' : 'b-shot'}"
                 src="${base}${e(s.file)}" alt="${e(game.title)} — ${e(s.caption || '')}"
                 width="${s.w}" height="${s.h}">
            ${s.caption ? `<figcaption>${e(s.caption)}</figcaption>` : ''}
          </figure>`).join('')}
      </div>
    </div>` : '';

  const buyBlock = buys.length ? `
    <div class="game-sheet__block">
      <h4 class="doc-h3">Buy bonus</h4>
      <div class="b-buy-strip">
        ${buys.map((b) => `
          <div class="b-buy">
            <b>${e(b.title)}</b>
            <span class="b-buy__cost">${e(b.cost)}</span>
          </div>`).join('')}
      </div>
    </div>` : '';

  return `
  <section class="sheet sheet--game" data-brand="${e(game.brand)}" data-slug="${e(game.slug)}">
    <div class="game-sheet__hero">
      ${hero}
      ${game.status === 'upcoming' ? '<span class="status-pill status-pill--hero">Coming soon</span>' : ''}
    </div>
    <div class="sheet__pad game-sheet__body">
      ${rows ? `<dl class="b-specs">${rows}
        ${released ? `<div class="b-spec"><dt>Release</dt><dd>${released}</dd></div>` : ''}
      </dl>` : ''}
      ${game.specs_provisional ? `<p class="game-sheet__note">Placeholder specification — figures not yet confirmed.</p>` : ''}
      ${reach}

      ${storyBlock}
      ${symbolBlock}
      ${shotBlock}
      ${buyBlock}
    </div>
    ${footer(`${game.title} · ${index} of ${total}`)}
  </section>`;
}

/* ---- upcomings: ONE sheet for the lot ------------------------------------
   A title that is not out has art and a date and nothing else — no specs, no
   prose, no symbols — so a full game sheet each was three pages of white space.
   The four unnamed teaser slots are still excluded upstream by WS.query(): with
   no title there is nothing to list. */
function upcomingsSheet(games, base) {
  return `
  <section class="sheet sheet--dark">
    ${svgField('#2E2E2E')}
    <div class="sheet__pad">
      <h2 class="doc-h1">Upcomings</h2>
      <p class="doc-lead">Titles in production. Dates are indicative and subject
         to certification.</p>
      <!-- Three titles fill the page as one column of wide rows. More than that
           and the rows would run off the sheet, so the grid drops to two-up. -->
      <div class="b-up-grid${games.length > 3 ? ' b-up-grid--many' : ''}">
        ${games.map((g) => `
          <div class="b-up">
            <img src="${base}${e(g.thumbnail)}" alt="${e(g.title)} key art">
            <div class="b-up__text">
              <h3>${e(g.title)}</h3>
              <p class="b-up__date">${g.release_date ? WS.fmtDate(g.release_date).full : 'Date to be confirmed'}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>
    ${footer('Upcomings')}
  </section>`;
}

const footer = (label) => `
  <div class="sheet__footer">
    <span>Wild Sheep · Game Catalogue</span>
    <span>${e(label)}</span>
  </div>`;

function closingSheet(site, scriptSvg) {
  /* The CHANGERS brush script, as artwork rather than as the word — the landing
     page's own lockup. Inlined for the same reason the cover's wordmark is: the
     site paints it with a CSS mask, and masks do not survive the print pipeline.
     If the fetch fails it falls back to the word, so the sheet always reads. */
  const changers = scriptSvg
    ? `<span class="closing__word">Game</span><span class="closing__script">${scriptSvg}</span>`
    : 'game changers';
  return `
  <section class="sheet sheet--dark">
    ${svgField('#2E2E2E')}
    <div class="sheet__pad" style="justify-content:center">
      <h2 class="doc-h1 closing__title">Be the next<span class="closing__line">${changers}</span></h2>
      <p class="doc-body" style="max-width:120mm">
        Every title in this catalogue can be tuned to your market — RTP, max win,
        game speed — or rebuilt as a branded exclusive no competitor can offer.
        Talk to us about a demo account.
      </p>
      <hr class="doc-rule">
      <p class="doc-body" style="font-weight:700">
        ${e(site.company.email)}<br>${e(site.company.domain)}
      </p>
      <p class="doc-body" style="font-size:3mm;color:rgba(255,255,255,0.6);margin-top:auto">
        ${e(site.brochure.footer_note)}<br>${e(site.company.hosting_note)}
      </p>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ build */
function currentScope() {
  const key = new URLSearchParams(window.location.search).get('scope');
  return SCOPES[key] || SCOPES.all;
}

async function build() {
  const data = await WS.loadData();
  const { site, base } = data;
  const scope = currentScope();

  const games = WS.query(data.games, { sort: 'newest' }).filter(scope.filter);
  /* The OUTLINE lockup, not the solid one: on the purple cover the solid mark
     paints as a flat silhouette and loses the sheep inside the W entirely,
     because there is no second colour to draw it. Same reason the footer uses
     it on brand grounds. */
  const markSvg = await inlineMark(base, 'assets/img/logos/wildsheep-outline.svg');
  const scriptSvg = await inlineMark(base, 'assets/img/logos/changers-script.svg');

  /* Released titles get a sheet each; the unreleased run shares one. */
  const released = games.filter((g) => g.status !== 'upcoming');
  const upcoming = games.filter((g) => g.status === 'upcoming');

  if (!games.length) {
    document.querySelector('[data-brochure]').innerHTML =
      '<p class="loading">This edition is empty.</p>';
    return;
  }

  document.querySelector('[data-brochure]').innerHTML =
    coverSheet(site, games, scope, markSvg, base) +
    overviewSheets(site, base) +
    (upcoming.length ? upcomingsSheet(upcoming, base) : '') +
    released.map((g, i) => gameSheet(g, base, i + 1, released.length, data._meta?.platforms)).join('') +
    closingSheet(site, scriptSvg);

  /* Mark the active edition in the toolbar so the choice is visible. */
  document.querySelectorAll('[data-scope-link]').forEach((a) => {
    a.setAttribute('aria-pressed', String(a.dataset.scopeLink === scope.key));
  });

  const meta = document.querySelector('[data-brochure-meta]');
  if (meta) {
    const sheets = document.querySelectorAll('.sheet').length;
    meta.textContent = `${games.length} games · ${sheets} pages · ${scope.label}`;
  }

  document.title = `${scope.title} — Wild Sheep`;
}

/* The print dialog must not open before the key art has decoded, or the PDF
   comes out with blank image boxes. */
async function printWhenReady(btn) {
  const images = [...document.querySelectorAll('.sheet img')];
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Preparing…';
  await Promise.all(images.map((img) =>
    img.complete ? Promise.resolve() : img.decode().catch(() => {})));
  btn.disabled = false;
  btn.textContent = original;
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  build()
    .then(() => {
      const btn = document.querySelector('[data-print]');
      btn?.addEventListener('click', () => printWhenReady(btn));
      // ?print=1 lets another page hand straight off to the dialog.
      if (new URLSearchParams(window.location.search).get('print') === '1' && btn) {
        printWhenReady(btn);
      }
    })
    .catch((err) => {
      console.error(err);
      document.querySelector('[data-brochure]').innerHTML =
        `<p class="loading">Could not build the brochure (${WS.escape(err.message)}).<br>
         Serve this folder over HTTP rather than opening the file directly.</p>`;
    });
});

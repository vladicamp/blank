/* ==========================================================================
   Wild Sheep — shared behaviour (header, nav, carousels) + landing page render
   ========================================================================== */

/* ---------------------------------------------------------------- header  */
function initHeader() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!header) return;

  const onScroll = () => header.setAttribute('data-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !nav) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () =>
    setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/* -------------------------------------------------------------- footer    */
/* The footer menu, on every page. Rendered from site.json's `nav` — the same
   array the header's overlay menu is built from — so there is exactly one list
   of links in the project and the footer cannot end up naming a page the menu
   doesn't, or vice versa. Nothing is invented here: whatever `nav` holds is
   what both menus show.
   Runs on all pages, not just the landing page, which is why it lives outside
   renderLanding(). WS.loadData() caches, so the second caller costs nothing.
   The hosting note is filled from the same pass; the pages carry it as static
   markup too, so it still reads correctly if this never runs. */
async function initFooter() {
  const nav = document.querySelector('[data-footer-nav]');
  const note = document.querySelector('[data-hosting-note]');
  if (!nav && !note) return;

  const { site, base } = await WS.loadData();
  const set = (sel, html) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  };

  if (nav) {
    nav.innerHTML = site.nav
      .map((l) => `<a href="${base}${WS.escape(l.href)}">${WS.escape(l.label)}</a>`)
      .join('');
  }
  if (note) note.textContent = site.company.hosting_note;

  const f = site.footer;
  if (!f) return;

  set('[data-footer-blurb]', WS.escape(f.blurb || ''));

  /* Regulatory line. The age mark is emphasised because it is the part that has
     to be legible at a glance, and GambleAware is a real outbound link —
     `rel="noopener"` since it opens a third-party site. */
  if (f.responsible) {
    const r = f.responsible;
    set('[data-footer-responsible]', [
      r.age ? `<b>${WS.escape(r.age)}</b>` : '',
      r.text ? WS.escape(r.text) : '',
      r.link ? `<a href="${WS.escape(r.link.href)}" target="_blank" rel="noopener noreferrer">${WS.escape(r.link.label)}</a>` : '',
    ].filter(Boolean).join('<span aria-hidden="true"> | </span>'));
  }

  /* Privacy / Terms / Cookies live here when those pages exist. The row is
     content-gated rather than shipping dead links — see the note in site.json. */
  const legal = document.querySelector('[data-footer-legal]');
  if (legal && f.legal_links?.length) {
    legal.innerHTML = f.legal_links
      .map((l) => `<li><a href="${base}${WS.escape(l.href)}">${WS.escape(l.label)}</a></li>`)
      .join('');
    legal.hidden = false;
  }

  /* The year is computed, not stored — a hardcoded one silently goes stale on
     1 January and nobody notices until a client does. */
  if (f.copyright) {
    set('[data-footer-copy]',
      `© ${new Date().getFullYear()} ${WS.escape(f.copyright)}`);
  }
}

/* ------------------------------------------------------------- carousels  */
/* One generic horizontal rail used by the capability, hot-games and
   upcomings sections. Steps by one card width per click.
   Returns a small API so an outside control — the capability chips — can drive
   the rail and follow it back. */
function initRail(rootEl) {
  const track = rootEl.querySelector('[data-rail-track]');
  const prev = rootEl.querySelector('[data-rail-prev]');
  const next = rootEl.querySelector('[data-rail-next]');
  if (!track || !prev || !next) return null;

  const listeners = [];
  /* Park the last card flush with the far edge instead of on the next whole
     step. Opt-in, because it is only right for a rail of several small cards:
     the capability carousel is one card at ~87% of the column and depends on
     the last card resting flush LEFT, which this would undo. */
  const flush = rootEl.hasAttribute('data-rail-flush');
  let index = 0;
  const step = () => {
    const first = track.firstElementChild;
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  };
  /* The track's containing block, not rootEl: the Upcomings rail is padded on
     the left so the first card lines up with the heading while the rail itself
     runs to the panel edge, which makes those two boxes different widths.
     clientWidth INCLUDES padding, so it has to come off — otherwise the track
     is allowed to travel one pad too far and the last card overshoots. */
  const viewport = () => {
    const box = track.parentElement;
    const cs = getComputedStyle(box);
    return box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  };
  const maxShift = () => Math.max(0, track.scrollWidth - viewport());
  const maxIndex = () => {
    const s = step();
    if (!s) return 0;
    return Math.max(0, Math.ceil(maxShift() / s));
  };
  const apply = () => {
    index = Math.min(index, maxIndex());
    const shift = flush ? Math.min(index * step(), maxShift()) : index * step();
    track.style.transform = `translateX(${-shift}px)`;
    prev.disabled = index <= 0;
    next.disabled = index >= maxIndex();
    listeners.forEach((fn) => fn(index));
  };

  prev.addEventListener('click', () => { index = Math.max(0, index - 1); apply(); });
  next.addEventListener('click', () => { index = Math.min(maxIndex(), index + 1); apply(); });

  /* Swipe. The rails are transform-driven rather than scroll containers, so a
     phone has no native gesture to fall back on — without this the arrows are
     the only way to move a rail, and on a touch screen they are the last thing
     anyone reaches for.
     Deliberately NOT a drag: the track doesn't follow the finger, it steps once
     per swipe, so this stays the same one-card-per-move model the arrows use and
     needs no extra state or snap-back animation.
     The listener is passive and the vertical guard runs first — a rail must
     never eat a downward scroll that merely started on top of it. */
  const SWIPE_MIN = 40;     // px of travel before it counts as a swipe at all
  let startX = 0, startY = 0, tracking = false;
  track.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;      // ignore pinch/zoom
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // Horizontal intent only: a mostly-vertical gesture is a page scroll.
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return;
    index = dx < 0
      ? Math.min(maxIndex(), index + 1)      // swipe left  -> next
      : Math.max(0, index - 1);              // swipe right -> prev
    apply();
  }, { passive: true });
  window.addEventListener('resize', apply);
  // Card widths depend on loaded images, so re-measure once they settle.
  window.addEventListener('load', apply);
  apply();

  return {
    goTo: (i) => { index = Math.max(0, Math.min(maxIndex(), i)); apply(); },
    onChange: (fn) => { listeners.push(fn); fn(index); },
  };
}

/* Symbol description overlays on the game page.
   Desktop reveals on hover, which is pure CSS and needs nothing here. This adds
   the touch behaviour: tap once to reveal, tap again to dismiss — and opening
   one closes any other, so a paytable can never end up with half its cells
   covered in text the visitor has to clear one at a time.
   Bound on ALL devices rather than gated on `(hover: none)`: a click is also
   what a keyboard Enter/Space produces on the button, so this is what makes the
   overlay reachable without a pointer. On a hover device the CSS has usually
   revealed it already, which makes the click a no-op the user never notices. */
function initSymbolNotes(scope) {
  const cells = [...(scope || document).querySelectorAll('.symbol--has-note')];
  if (!cells.length) return;

  const close = (cell) => {
    cell.classList.remove('symbol--is-open');
    cell.querySelector('.symbol__toggle')?.setAttribute('aria-expanded', 'false');
  };

  cells.forEach((cell) => {
    const btn = cell.querySelector('.symbol__toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = cell.classList.contains('symbol--is-open');
      cells.forEach(close);
      if (!open) {
        cell.classList.add('symbol--is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* A tap anywhere else, or Escape, clears the open one — otherwise the only
     way out is finding the same cell again. */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.symbol--has-note')) cells.forEach(close);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cells.forEach(close);
  });
}

/* Touch has no hover, and the tiles are links, so a tap would navigate before
   the push was ever seen. On touch-only devices the first tap opens a tile and
   the second follows its link; on anything with a pointer this does nothing and
   the CSS :hover rules run instead. */
function initBrandTiles() {
  const tiles = [...document.querySelectorAll('.brand-tile')];
  if (!tiles.length || matchMedia('(hover: hover)').matches) return;
  tiles.forEach((tile) => tile.addEventListener('click', (e) => {
    if (tile.dataset.open === 'true') return;   // second tap follows the link
    e.preventDefault();
    tiles.forEach((t) => { t.dataset.open = String(t === tile); });
  }));
}

/* Wires the four chips above the dark band to the capability carousel: chip n
   selects card n, and moving the rail with the arrows moves the chips back.
   The chips are rendered from the same `capabilities` array as the cards, so
   they line up by index and cannot drift out of sync with the copy. */
function initCapabilityChips(rail) {
  const chips = [...document.querySelectorAll('[data-personalisation-chips] [data-cap-chip]')];
  if (!rail || !chips.length) return;
  chips.forEach((chip, i) => chip.addEventListener('click', () => rail.goTo(i)));
  rail.onChange((i) => chips.forEach((chip, n) =>
    chip.setAttribute('aria-pressed', String(n === i))));
}

function initRails() {
  let capRail = null;
  document.querySelectorAll('[data-rail]').forEach((el) => {
    const rail = initRail(el);
    if (rail && el.hasAttribute('data-cap-rail')) capRail = rail;
  });
  initCapabilityChips(capRail);
}

/* -------------------------------------------------------------- rendering */
/* An unreleased title has nothing to show yet — no specs, no art beyond a
   thumbnail, no story — so it is a teaser everywhere it appears and never links
   anywhere. `isTeaser()` is the single test for that, used by both card
   renderers below and by game.html, so the rule cannot drift between them. */
const isTeaser = (game) => game.status === 'upcoming' || !game.slug;

const gameCard = (game, base) => {
  const brandLabel = game.brand === 'classic' ? 'Classic' : 'Origins';
  const catLabel = game.category === 'mini-game' ? 'Mini Game' : 'Slots';
  /* One corner flag, two states. `new_release` mirrors the brochure's own badge
     and is purple to tell it apart from the green Coming soon. */
  const flag = game.new_release ? '<span class="game-card__flag game-card__flag--new">New release</span>'
             : game.status === 'upcoming' ? '<span class="game-card__flag">Coming soon</span>'
             : '';
  /* One line saying what the game actually IS, rather than "Slots · Origins" —
     which repeated the filter the visitor just used and said nothing about the
     title. `card_line` is condensed from each game's own `summary`, so it makes
     no claim the catalogue doesn't already make. Falls back to the range/type
     pair for any entry that has no line yet, so this can never render blank. */
  const line = game.card_line
    ? WS.escape(game.card_line)
    : `${catLabel} · ${brandLabel}`;
  const inner = `
      ${flag}
      <span class="game-card__media">
        <img src="${base}${WS.escape(game.thumbnail)}" alt="${WS.escape(game.title)} key art"
             loading="lazy" width="800" height="500">
      </span>
      <span class="game-card__meta">
        <span class="game-card__title">${WS.escape(game.title)}</span>
        <span class="game-card__tags">${line}</span>
      </span>`;
  /* A span, not a disabled anchor: there is no destination, so there should be
     no link in the accessibility tree and nothing for the keyboard to land on. */
  return isTeaser(game)
    ? `<span class="game-card game-card--teaser">${inner}</span>`
    : `<a class="game-card" href="${base}games/game.html?g=${encodeURIComponent(game.slug)}">${inner}</a>`;
};

/* The brochure's timeline runs three named games then four art-only teasers —
   a date and a picture, no title. NOTHING on this rail links: every card here is
   unreleased by definition, so the named three are teasers exactly like the
   unnamed four. The art-only ones are additionally hidden from assistive tech,
   since a picture with no title conveys nothing without the date beside it. */
const upcomingCard = (game, base) => {
  const d = WS.fmtDate(game.release_date);
  /* `art.cutout` is a transparent PNG of the subject alone, for the slots whose
     artwork is still a character render rather than a finished 3:2 tile. Those
     sit ON a purple ground at their own aspect ratio instead of being cropped
     to the tile — a square render forced through `object-fit: cover` showed a
     letterbox of its background and a sliver of the subject.
     No width/height attributes on this branch: the media box carries its own
     aspect-ratio, so it reserves the space, and hardcoding 800x500 here would
     hand the browser an intrinsic ratio none of the cutouts actually has. */
  const media = game.art?.cutout
    ? `<span class="game-card__media game-card__media--cutout">
         <img src="${base}${WS.escape(game.art.cutout)}"
              alt="${game.title ? WS.escape(game.title) + ' key art' : ''}" loading="lazy">
       </span>`
    : `<span class="game-card__media">
         <img src="${base}${WS.escape(game.thumbnail)}"
              alt="${game.title ? WS.escape(game.title) + ' key art' : ''}"
              loading="lazy" width="800" height="500">
       </span>`;
  const tile = `<span class="game-card game-card--teaser"${game.title ? '' : ' aria-hidden="true"'}>${media}</span>`;
  /* Art and a date, and nothing else. These titles are not out yet, so there is
     nothing to sell — the description that briefly sat here was explaining games
     nobody can play. The released cards keep their `card_line`; this rail does
     not need one. */
  return `
    <div class="upcoming-card">
      ${tile}
      <p class="upcoming-card__date">Available:<b>${d.month} ${d.day}<sup>${d.suffix}</sup> ${d.year}</b></p>
    </div>`;
};

async function renderLanding() {
  const data = await WS.loadData();
  const { site, games, base } = data;

  const set = (sel, html) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  };

  /* Personalisation band. The chips are the capability carousel's tab strip, so
     they are rendered from `capabilities` rather than their own copy list —
     that way a chip can never name a card that isn't there. Order matters:
     chip n drives card n. initCapabilityChips() maintains aria-pressed. */
  set('[data-personalisation-body]', site.personalisation.body);
  set('[data-personalisation-chips]', site.capabilities.map((c, i) => `
    <button class="btn" type="button" data-cap-chip
            aria-pressed="${i === 0}">${WS.escape(c.title)}</button>`).join(''));

  /* Capability carousel. `art` and `link` are both optional — a capability
     without either renders without it rather than leaving a hole.
     The link goes INSIDE the body paragraph, exactly like the value props'
     "Read more", so it reads as the end of that sentence rather than as a
     separate block; it shares .value-prop__link's styling for the same reason.
     Unlike the value props' in-page anchors this one points at another page, so
     it takes the `base` prefix the nav links use. */
  set('[data-capabilities]', site.capabilities.map((c) => `
    <article class="cap-card">
      <h3 class="display display--sm cap-card__title">${WS.escape(c.title)}</h3>
      <p class="cap-card__body">${c.body}${c.link ? `<a class="value-prop__link cap-card__link" href="${base}${WS.escape(c.link.href)}">${WS.escape(c.link.label)}<svg width="9" height="14" viewBox="0 0 14 22" fill="none" aria-hidden="true"><path d="M2 2l9 9-9 9" stroke="currentColor" stroke-width="2.5"/></svg></a>` : ''}</p>
      ${c.art ? `<img class="cap-card__art" src="${base}${WS.escape(c.art)}" alt=""
                      aria-hidden="true" loading="lazy">` : ''}
    </article>`).join(''));

  /* Value props. `link` is optional — a prop without one renders without it.
     It goes INSIDE the body paragraph so it reads as the end of that sentence
     rather than as a separate block beneath it. The href is a plain in-page
     anchor; html{scroll-behavior:smooth} already makes it glide to the
     section, so this needs no JS of its own. */
  set('[data-value-props]', site.value_props.map((v) => `
    <article class="value-prop">
      <h3 class="display display--xs value-prop__title">${WS.escape(v.title)}</h3>
      <p class="value-prop__body">${v.body}${v.link ? `<a class="value-prop__link" href="${WS.escape(v.link.href)}">${WS.escape(v.link.label)}<svg width="9" height="14" viewBox="0 0 14 22" fill="none" aria-hidden="true"><path d="M2 2l9 9-9 9" stroke="currentColor" stroke-width="2.5"/></svg></a>` : ''}</p>
    </article>`).join(''));

  /* Brand tiles — the mark is a white mask over the brand colour. `mark_hover`
     and `tagline` are both optional and both belong to the hover state only: at
     rest the tile is the full lockup, exactly as it was before they existed.
     They share one wrapper so the pair can be centred as a single block — see
     .brand-tile__hover in site.css. */
  set('[data-brand-tiles]', site.brand_tiles.map((t) => `
    <a class="brand-tile" href="${base}${t.href}" style="background:${t.colour}"
       aria-label="${WS.escape(t.label)}">
      <span class="mark brand-tile__mark--rest mark--${t.brand}" style="color:#fff"></span>
      ${t.mark_hover || t.tagline ? `<span class="brand-tile__hover">
        ${t.mark_hover ? `<span class="mark brand-tile__mark--hover mark--${WS.escape(t.mark_hover)}" style="color:#fff"></span>` : ''}
        ${t.tagline ? `<p class="brand-tile__tagline">${WS.escape(t.tagline)}</p>` : ''}
      </span>` : ''}
    </a>`).join(''));
  initBrandTiles();

  /* Hot games + upcomings */
  /* Both rails carry the brochure's real line-ups now — seven each — so the
     repeatTo() padding that used to pad three cards up to nine is gone.
     Order is explicit, not the order games.json happens to be written in:
     Hot Games runs newest first, matching the brochure's page order, and
     Upcomings runs soonest first, matching its release timeline. */
  const byDate = (a, b) => (a.release_date || '').localeCompare(b.release_date || '');
  const hot = games.filter((g) => g.featured).sort((a, b) => byDate(b, a));
  const upcoming = games.filter((g) => g.status === 'upcoming').sort(byDate);
  set('[data-hot-games]', hot.map((g) => gameCard(g, base)).join(''));
  set('[data-upcomings]', upcoming.map((g) => upcomingCard(g, base)).join(''));

  /* Promotion tools */
  /* `icon` is optional path data — an item without one renders without it. The
     stroke is styled in CSS so it stays locked to the card's own rule weight. */
  set('[data-promo-tools]', site.promotion_tools.items.map((p) => `
    <article class="promo-card">
      ${p.icon ? `<svg class="promo-card__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${WS.escape(p.icon)}"/></svg>` : ''}
      <h3 class="promo-card__title">${WS.escape(p.title)}</h3>
      <p class="promo-card__body">${WS.escape(p.body)}</p>
    </article>`).join(''));

  /* Contact form */
  renderContactFields(site);

  /* The hosting note is initFooter()'s job now — it runs on every page, so
     owning it here as well would give one element two writers. */

  initRails();
}

/* -------------------------------------------------- contact form fields   */
/* The one place the form's fields are built, so the landing page, the game
   page's rebrand form and the free-branded-game page all render the SAME list
   from site.json's `contact.fields`. Fills any [data-contact-fields] hook. */
function renderContactFields(site) {
  const form = document.querySelector('[data-contact-fields]');
  if (!form || !site?.contact?.fields) return;
  form.innerHTML = site.contact.fields.map((f) => `
    <div class="field${f.width === 'full' ? ' field--full' : ''}">
      ${f.type === 'textarea'
        ? `<textarea id="${f.name}" name="${f.name}" rows="3" placeholder=" "${f.required ? ' required' : ''}></textarea>`
        : `<input id="${f.name}" name="${f.name}" type="${f.type}" placeholder=" "${f.required ? ' required' : ''}>`}
      <label for="${f.name}">${WS.escape(f.label)}${f.required ? ' *' : ''}</label>
    </div>`).join('');
}

/* For pages that carry a form but are not the landing page. initContactForm()
   has to run AFTER the fields exist — site.js binds it on DOMContentLoaded,
   before this markup is rendered — which is the same ordering trap game.html
   documents. */
async function initStandaloneForm() {
  if (document.body.dataset.page === 'landing') return;
  if (!document.querySelector('[data-contact-fields]')) return;
  const { site } = await WS.loadData();
  renderContactFields(site);
  initContactForm();
}

/* The demo form has no backend in the static build; it validates and reports
   locally. Phase 2 wires this to WPForms / Gravity Forms. */
function initContactForm() {
  const form = document.querySelector('#request-demo-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    if (!form.reportValidity()) return;
    status.textContent =
      'Thanks — this is the static preview, so nothing was sent. The live site will deliver this to ' +
      (form.dataset.email || 'the sales inbox') + '.';
    status.style.color = 'var(--green-dark)';
  });
}

/* ------------------------------------------------- first-fold parallax    */
/* Sets ONE number on .hero — `--hero-p`, 0 at rest and 1 once the fold has
   scrolled away. site.css does the rest; see the note above .hero__type there
   for what moves and, more importantly, what deliberately does not.

   Written to cost as close to nothing as a scroll effect can:

   - ONE passive listener. `passive: true` promises we never preventDefault, so
     the browser never has to wait on this before scrolling — without it a
     scroll handler can block the gesture itself.
   - rAF-COALESCED. Scroll fires faster than the screen repaints; `ticking`
     collapses every burst into a single write per frame, so the work is bounded
     by the refresh rate rather than by how fast the wheel is spun.
   - WRITES NOTHING WHEN NOTHING CHANGED. Once the fold is behind you `p` pins
     at 1 and the `p === last` guard returns before touching the DOM, so
     scrolling the other 6000px of the page costs one float comparison a frame
     and no style invalidation at all.
   - ONE property on ONE element, and it drives only `transform` and `opacity` —
     both compositor properties, so a frame costs no layout and no repaint.

   Bails out entirely — leaving the static fold — with no .hero, or when the
   reader has asked for reduced motion. */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Which effect is on is decided by <html data-parallax> in the markup, and
     that attribute is the only switch — see the note on it in index.html. */
  const version = document.documentElement.dataset.parallax;

  /* ---- v2: pin the headline ---------------------------------------------
     The motion is entirely CSS `position: sticky`; all this does is tell it
     WHERE to pin, which is the headline's own resting offset so it is already
     in place on load rather than sliding up to meet a guessed value.
     Measured from .hero rather than from the headline itself, because once the
     headline is sticky its own rect is the stuck position, not the natural one —
     reading that would feed the value back into itself on every resize.
     Runs on load and on resize. There is NO scroll listener in this branch. */
  if (version === 'v2') {
    const type = hero.querySelector('.hero__type');
    if (!type) return;
    const measure = () => {
      const padTop = parseFloat(getComputedStyle(hero).paddingTop) || 0;
      const top = hero.getBoundingClientRect().top + window.scrollY + padTop;
      if (!Number.isFinite(top)) return;
      type.style.setProperty('--hero-stick-top', `${Math.round(top)}px`);
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return;
  }

  if (version !== 'v1') return;

  let ticking = false;
  let last = -1;

  const update = () => {
    ticking = false;
    /* The fold is done a little before a full viewport, so the type has
       finished receding by the time the dark band takes the screen. */
    const span = window.innerHeight * 0.85;
    /* A zero-height viewport is real — a prerendered or background document, a
       display:none iframe, the moment before an orientation change settles — and
       0/0 is NaN, not 0. Writing NaN here would make calc(NaN * 6rem) invalid and
       take the whole transform down with it, so bail before computing rather than
       after: leaving --hero-p at its last good value keeps the fold rendering. */
    if (!(span > 0)) return;
    const p = Math.min(1, Math.max(0, window.scrollY / span));
    if (p === last) return;
    last = p;
    hero.style.setProperty('--hero-p', p.toFixed(3));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  /* `span` is viewport-relative, so a resize (or a phone's address bar sliding
     away) changes the mapping and the current position has to be re-derived. */
  window.addEventListener('resize', onScroll, { passive: true });
  update();   /* deep-linked or restored scroll positions start correct */
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroParallax();
  initContactForm();
  /* Shared chrome, so it is not gated on which page this is. It fails quietly:
     the footer's static note stays put and the menu stays empty rather than the
     page erroring out over its own furniture. */
  initFooter().catch((err) => console.error('footer:', err));
  initStandaloneForm().catch((err) => console.error('form:', err));
  if (document.body.dataset.page === 'landing') {
    renderLanding().catch((err) => {
      console.error(err);
      document.querySelector('[data-personalisation-body]')?.replaceChildren(
        `Content failed to load (${err.message}). Serve this folder over HTTP rather than opening the file directly.`);
    });
  }
});

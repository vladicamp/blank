/* ==========================================================================
   Wild Sheep — game library page
   Filter / search / sort / paginate over the full catalogue. State lives in the
   URL so any view is shareable.
   ========================================================================== */

const PAGE_SIZE = 18;

const state = {
  filter: '',
  search: '',
  sort: 'newest',
  shown: PAGE_SIZE,
};

let allGames = [];
let base = '';

/* ------------------------------------------------------------ URL syncing */
function readURL() {
  const p = new URLSearchParams(window.location.search);
  state.filter = p.get('filter') || '';
  state.search = p.get('q') || '';
  state.sort = p.get('sort') || 'newest';
}

function writeURL() {
  const p = new URLSearchParams();
  if (state.filter) p.set('filter', state.filter);
  if (state.search) p.set('q', state.search);
  if (state.sort !== 'newest') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

/* -------------------------------------------------------------- rendering */
/* The Upcomings shelf above the grid. It holds every unreleased title — the
   three named ones and the four unnamed slots — so the grid below can be
   nothing but titles you can actually open.
   It answers to the filter chips through the same WS.matches() the grid uses,
   and stands down entirely during a search. Re-rendered on every render() pass
   rather than built once, because the rail has to be re-measured when the set
   of cards in it changes; initRail() reads card widths at construction. */
function renderUpcomings() {
  const section = document.querySelector('[data-upcomings-section]');
  const track = document.querySelector('[data-upcomings]');
  if (!section || !track) return;

  const upcoming = state.search.trim()
    ? []
    : allGames
        .filter((g) => g.status === 'upcoming' && WS.matches(g, state.filter))
        .sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));

  section.hidden = upcoming.length === 0;
  if (section.hidden) { track.innerHTML = ''; return; }

  track.innerHTML = upcoming.map((g) => upcomingCard(g, base)).join('');
  initRail(section.querySelector('[data-rail]'));
}

function render() {
  /* `released: true` — see the note on WS.query(). Unreleased titles are on the
     shelf above, not in this grid. */
  const results = WS.query(allGames, { ...state, released: true });
  const visible = results.slice(0, state.shown);

  const grid = document.querySelector('[data-library-grid]');
  const empty = document.querySelector('[data-no-results]');
  const count = document.querySelector('[data-result-count]');
  const more = document.querySelector('[data-show-more]');

  grid.innerHTML = visible.map((g) => gameCard(g, base)).join('');
  grid.hidden = results.length === 0;
  empty.hidden = results.length !== 0;

  /* Count against the catalogue as WS.query() sees it, with the SAME options
     the grid used — the unnamed teasers and now the unreleased titles are both
     filtered out there, so counting raw allGames would read "23 of 30" with no
     filter applied and nothing on the page to explain the gap. */
  const catalogueSize = WS.query(allGames, { released: true }).length;
  count.textContent = results.length === catalogueSize
    ? `${results.length} games`
    : `${results.length} of ${catalogueSize} games`;

  more.hidden = results.length <= state.shown;
  more.textContent = `Show More (${results.length - state.shown} left)`;

  // Filter chips reflect the active filter.
  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.filter === state.filter));
  });

  renderUpcomings();
}

/* ------------------------------------------------------------------ wiring */
function bind() {
  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Clicking the active chip clears it.
      state.filter = btn.dataset.filter === state.filter ? '' : btn.dataset.filter;
      state.shown = PAGE_SIZE;
      writeURL(); render();
    });
  });

  const search = document.querySelector('[data-search]');
  let timer;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.search = search.value;
      state.shown = PAGE_SIZE;
      writeURL(); render();
    }, 180);
  });

  const sort = document.querySelector('[data-sort]');
  sort.addEventListener('change', () => {
    state.sort = sort.value;
    writeURL(); render();
  });

  document.querySelector('[data-show-more]').addEventListener('click', () => {
    state.shown += PAGE_SIZE;
    render();
  });
}

async function init() {
  const data = await WS.loadData();
  allGames = data.games;
  base = data.base;

  readURL();
  document.querySelector('[data-search]').value = state.search;
  document.querySelector('[data-sort]').value = state.sort;

  bind();
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch((err) => {
    console.error(err);
    const empty = document.querySelector('[data-no-results]');
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = `<p>Could not load the catalogue (${WS.escape(err.message)}).<br>
        Serve this folder over HTTP rather than opening the file directly.</p>`;
    }
  });
});

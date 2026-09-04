/* ==========================================================================
   Wild Sheep — data store
   The one place the site reads content from. Everything else consumes these
   helpers, so the WordPress port only has to change loadData(): swap the two
   fetches for the REST endpoints and nothing downstream moves.
   See wp/HANDOVER.md.
   ========================================================================== */

const WS = (() => {
  let cache = null;

  /* Every page declares its own depth via <html data-root="…">, so the site
     works from any subdirectory. In WordPress this becomes the theme URI. */
  const root = () => document.documentElement.dataset.root ?? '';

  async function loadData() {
    if (cache) return cache;
    const base = root();
    const [games, site] = await Promise.all([
      fetch(`${base}data/games.json`).then((r) => {
        if (!r.ok) throw new Error(`games.json: ${r.status}`);
        return r.json();
      }),
      fetch(`${base}data/site.json`).then((r) => {
        if (!r.ok) throw new Error(`site.json: ${r.status}`);
        return r.json();
      }),
    ]);
    cache = { ...games, site, base };
    return cache;
  }

  /* Asset paths in the JSON are stored relative to the site root. */
  const asset = (path, base) => `${base ?? root()}${path}`;

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const suffix =
      day % 10 === 1 && day !== 11 ? 'st' :
      day % 10 === 2 && day !== 12 ? 'nd' :
      day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    const month = d.toLocaleString('en-GB', { month: 'long' });
    return { day, suffix, month, year: d.getFullYear(),
             full: `${month} ${day}${suffix} ${d.getFullYear()}` };
  };

  /* A game matches a filter slug if the slug is its category or its brand.
     This is what lets "Slots", "Mini Game", "Origins" and "Classic" all live
     in one filter row even though two are categories and two are brands. */
  const matches = (game, slug) =>
    !slug || game.category === slug || game.brand === slug;

  const sorters = {
    newest: (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
    oldest: (a, b) => (a.release_date || '').localeCompare(b.release_date || ''),
    az:     (a, b) => a.title.localeCompare(b.title),
    za:     (a, b) => b.title.localeCompare(a.title),
  };

  /* Teasers are the four unnamed slots at the end of the brochure's upcoming
     timeline — art and a date, no title and no slug. They belong on the landing
     page's Upcomings rail and nowhere else: with no title they cannot be
     searched, sorted by name, listed in the brochure's contents, or linked to.
     renderLanding() reads `games` directly, so the rail still gets them. */
  /* `released` drops anything not yet out. The library grid asks for it, because
     an unreleased title there is a dead tile — it can't be opened, and it sits
     in the same grid as 23 that can. Those titles get the Upcomings shelf above
     the grid instead. The brochure deliberately does NOT ask for it: it is the
     whole catalogue, and it has a "Coming soon" pill for exactly this. */
  function query(games, { filter = '', search = '', sort = 'newest', released = false } = {}) {
    const term = search.trim().toLowerCase();
    return games
      .filter((g) => !g.teaser)
      .filter((g) => !released || g.status !== 'upcoming')
      .filter((g) => matches(g, filter))
      .filter((g) => !term || `${g.title} ${g.tagline} ${g.summary}`.toLowerCase().includes(term))
      .sort(sorters[sort] || sorters.newest);
  }

  const escape = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  return { loadData, asset, root, fmtDate, query, matches, escape };
})();

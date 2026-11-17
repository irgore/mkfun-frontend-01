import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, leaderboard, profile } from './views.js';

const app = document.getElementById('app');
const search = document.getElementById('search');

function route() {
  const h = location.hash || '#/';
  // #/profile/:handle
  let m = h.match(/^#\/profile\/(.+)/);
  if (m) return { view: 'profile', handle: decodeURIComponent(m[1]) };
  // #/bounty/:slug/leaderboard
  m = h.match(/^#\/bounty\/([^/]+)\/leaderboard/);
  if (m) return { view: 'leaderboard', slug: decodeURIComponent(m[1]) };
  // #/bounty/:slug
  m = h.match(/^#\/bounty\/([^/]+)/);
  if (m) return { view: 'bounty', slug: decodeURIComponent(m[1]) };
  return { view: 'board' };
}

async function render() {
  window.__shotReady = false;
  const r = route();

  // prefetch sibling data
  if (r.view === 'bounty' || r.view === 'leaderboard') {
    getBounties('open'); // warm board cache
  }

  // highlight active nav
  document.querySelectorAll('#nav a[data-route]').forEach(a => {
    a.classList.toggle('active', a.dataset.route === `/${r.view}`);
  });

  try {
    if (r.view === 'board') {
      const data = await getBounties('open');
      document.title = 'make.fun — AI agent bounties';
      app.innerHTML = board(data);
    } else if (r.view === 'bounty') {
      const b = await getBounty(r.slug);
      document.title = `${b.title} | make.fun`;
      app.innerHTML = bounty(b);
      // prefetch leaderboard
      getLeaderboard(r.slug);
    } else if (r.view === 'leaderboard') {
      const [b, lb] = await Promise.all([getBounty(r.slug), getLeaderboard(r.slug)]);
      document.title = `Leaderboard · ${b.title} | make.fun`;
      app.innerHTML = leaderboard(lb, r.slug);
    } else if (r.view === 'profile') {
      const data = await getProfile(r.handle);
      document.title = `@${data.handle || r.handle} | make.fun`;
      app.innerHTML = profile(data);
    }
  } catch (e) {
    app.innerHTML = `<div class="page"><h1>Error</h1><p>${e.message}</p><a href="#/">← Board</a></div>`;
    document.title = 'Error | make.fun';
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);

// search
if (search) {
  search.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = search.value.trim();
      if (q) {
        location.hash = `#/profile/${encodeURIComponent(q)}`;
        search.value = '';
      }
    }
  });
}

render();
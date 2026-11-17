import { esc, money, date, timeLeft, nf, relative, percent, avatarUrl, bountyStatus } from './format.js';

const pot = b => money(b.potUsd ?? b.rewardAmount);
const fee = b => b.entryFeeUsd ? `${money(b.entryFeeUsd)} fee` : 'free';

// Leaderboard entries come in format: { rank, handle, title, values: { judge, judge_low, judge_high }, ... }
function lbRate(e) {
  if (e.values?.judge != null) return e.values.judge / 1_000_000;
  if (e.rate != null) return e.rate;
  if (e.score != null) return e.score;
  return null;
}

function card(b) {
  const s = bountyStatus(b);
  return `
  <a class="bounty-card" href="#/bounty/${esc(encodeURIComponent(b.slug))}">
    <div class="card-top">
      <span class="card-title">${esc(b.title)}</span>
      <span class="card-pot">${pot(b)}</span>
    </div>
    <div class="card-meta">
      <span class="tag tag-${s.cls}">${s.text}</span>
      <span>${fee(b)}</span>
      <span>${nf(b.submissionCount)} entries</span>
    </div>
  </a>`;
}

export function board(data) {
  const items = data.items || [];
  const open = items.filter(b => new Date(b.deadline).getTime() > Date.now());
  const ended = items.filter(b => new Date(b.deadline).getTime() <= Date.now());
  return `
  <div class="page board-page">
    <h1>Open bounties</h1>
    <p class="subtitle">${open.length} active · ${items.length} total</p>
    <div class="board-grid">${open.map(card).join('')}</div>
    ${ended.length ? `<h2>Ended</h2><div class="board-grid">${ended.map(card).join('')}</div>` : ''}
  </div>`;
}

export function bounty(b) {
  const s = bountyStatus(b);
  return `
  <div class="page bounty-page">
    <a href="#/" class="back-link">← All bounties</a>
    <div class="bounty-header">
      <h1>${esc(b.title)}</h1>
      <span class="tag tag-${s.cls}">${s.text}</span>
    </div>
    ${b.summary ? `<p class="summary">${esc(b.summary)}</p>` : ''}
    <div class="stat-grid">
      <div class="stat"><label>Reward</label><span>${pot(b)}</span></div>
      ${b.entryFeeUsd ? `<div class="stat"><label>Entry fee</label><span>${money(b.entryFeeUsd)}</span></div>` : ''}
      <div class="stat"><label>Deadline</label><span>${date(b.deadline)}</span></div>
      <div class="stat"><label>Entries</label><span>${nf(b.submissionCount)}</span></div>
      ${b.category ? `<div class="stat"><label>Category</label><span>${esc(b.category)}</span></div>` : ''}
      ${b.skills?.length ? `<div class="stat"><label>Skills</label><span>${b.skills.map(esc).join(', ')}</span></div>` : ''}
    </div>
    <div class="bounty-actions">
      <a href="#/bounty/${esc(encodeURIComponent(b.slug))}/leaderboard" class="btn">View leaderboard</a>
      <a href="${b.url || `https://make.fun/c/${esc(encodeURIComponent(b.slug))}`}" target="_blank" rel="noopener" class="btn btn-outline">Open on make.fun</a>
    </div>
    ${b.description ? `<div class="description"><h2>About</h2><div class="desc-body">${esc(b.description)}</div></div>` : ''}
  </div>`;
}

export function leaderboard(data, bountySlug) {
  const entries = data.entries || data.items || [];
  if (!entries.length) return `<div class="page"><a href="#/bounty/${esc(encodeURIComponent(bountySlug))}" class="back-link">← Bounty</a><h1>Leaderboard</h1><p>No entries yet.</p></div>`;
  return `
  <div class="page">
    <a href="#/bounty/${esc(encodeURIComponent(bountySlug))}" class="back-link">← Bounty</a>
    <h1>Leaderboard</h1>
    <p class="subtitle">${nf(entries.length)} entries</p>
    <div class="lb-list">
      <div class="lb-header">
        <span class="lb-rank">#</span>
        <span class="lb-handle">Entrant</span>
        <span class="lb-rate">Win rate</span>
        <span class="lb-title">Title</span>
      </div>
      ${entries.slice(0, 50).map((e, i) => `
      <a class="lb-row" href="#/profile/${esc(encodeURIComponent(e.handle || ''))}">
        <span class="lb-rank">${e.rank || i + 1}</span>
        <span class="lb-handle">${esc(e.handle || 'unknown')}</span>
        <span class="lb-rate">${percent(lbRate(e), 1)}</span>
        <span class="lb-title">${esc((e.title || '').slice(0, 50))}</span>
      </a>`).join('')}
    </div>
  </div>`;
}

export function profile(data) {
  if (!data || !data.handle) return `<div class="page"><h1>Profile not found</h1><a href="#/" class="back-link">← Board</a></div>`;
  return `
  <div class="page">
    <a href="#/" class="back-link">← Board</a>
    <div class="profile-header">
      ${data.avatar?.url ? `<img src="${avatarUrl(data.avatar.url)}" class="profile-avatar" crossorigin="anonymous" alt="">` : '<div class="profile-avatar placeholder"></div>'}
      <div>
        <h1>@${esc(data.handle)}</h1>
        ${data.bio ? `<p class="bio">${esc(data.bio)}</p>` : ''}
        ${data.name ? `<p class="name">${esc(data.name)}</p>` : ''}
      </div>
    </div>
    ${data.stats ? `
    <div class="stat-grid">
      ${data.stats.submissions != null ? `<div class="stat"><label>Submissions</label><span>${nf(data.stats.submissions)}</span></div>` : ''}
      ${data.stats.wins != null ? `<div class="stat"><label>Wins</label><span>${nf(data.stats.wins)}</span></div>` : ''}
      ${data.stats.earnings != null ? `<div class="stat"><label>Earnings</label><span>${money(data.stats.earnings)}</span></div>` : ''}
    </div>` : ''}
    <p class="view-full"><a href="https://make.fun/profile/${esc(encodeURIComponent(data.handle))}" target="_blank" rel="noopener">View full profile →</a></p>
  </div>`;
}
// Formatting helpers for make.fun data.

export function esc(value) {
  return String(value ?? '').replace(/[&<>\"']/g, c => `&#${c.charCodeAt(0)};`);
}

export function money(value) {
  const n = Number(value);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
}

export function date(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
}

export function timeLeft(iso) {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function nf(n) { return n?.toLocaleString('en-US') ?? '—'; }

export function relative(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function percent(n, digits = 0) {
  if (n == null) return '—';
  return (n * 100).toFixed(digits) + '%';
}

export function avatarUrl(url) {
  if (!url) return '';
  // make.fun avatars need crossorigin=anonymous
  return url.startsWith('http') ? url : 'https://make.fun' + url;
}

/** Status text + class for a bounty based on deadline and status. */
export function bountyStatus(b) {
  if (b.status === 'closed' || b.status === 'resolved') return { text: 'Closed', cls: 'ended' };
  const ms = new Date(b.deadline).getTime() - Date.now();
  if (ms <= 0) return { text: 'Ended', cls: 'ended' };
  const h = ms / 3600000;
  if (h < 1) return { text: `${Math.floor(ms / 60000)}m left`, cls: 'urgent' };
  if (h < 24) return { text: `${Math.floor(h)}h left`, cls: 'soon' };
  return { text: `${Math.floor(h / 24)}d left`, cls: 'open' };
}
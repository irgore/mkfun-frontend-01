// make.fun public API client — read-only GET, CORS open, ETag-aware cache.
const API = 'https://make.fun/api';
const cache = new Map();

async function fetchJSON(path, opts = {}) {
  const url = API + path;
  const key = opts.cacheKey || path;
  const entry = cache.get(key);
  const headers = {};
  if (entry && entry.etag && !opts.skipCache) {
    headers['If-None-Match'] = entry.etag;
  }
  const res = await fetch(url, { headers });
  if (res.status === 304 && entry) {
    entry.hits++;
    return entry.data;
  }
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  const data = await res.json();
  const etag = res.headers.get('ETag');
  const cc = res.headers.get('Cache-Control');
  cache.set(key, { data, etag, ts: Date.now(), hits: 0 });
  return data;
}

export const getBounties = (status = 'open') =>
  fetchJSON(`/competitions?status=${status}&activity=times`, { cacheKey: `bounties:${status}` });

export const getBounty = (slug) =>
  fetchJSON(`/competitions/${encodeURIComponent(slug)}`);

export const getLeaderboard = (slug) =>
  fetchJSON(`/competitions/${encodeURIComponent(slug)}/leaderboard`);

export const getProfile = (handle) =>
  fetchJSON(`/profiles/${encodeURIComponent(handle)}`);

export const getRankings = (handle) =>
  fetchJSON(`/rankings/${encodeURIComponent(handle)}`).catch(() => ({}));

export const getSubmissions = (id) =>
  fetchJSON(`/submissions/${id}`).catch(() => ({}));

export const clearCache = () => cache.clear();
export const cacheSize = () => cache.size;
/**
 * Filters for public project discovery (Khám phá dự án).
 * The non-premium API may return mixed statuses; discovery should only list vetted projects.
 */

/**
 * @param {unknown[]} items - Raw project rows from the API
 * @returns {object[]} Only projects with status Approved or Published (case-insensitive)
 */
export function filterProjectsForPublicDiscovery(items) {
  if (!Array.isArray(items)) return [];
  const allowed = new Set(['approved', 'published']);
  return items.filter((p) => {
    const s = String(p?.status ?? p?.Status ?? '').trim().toLowerCase();
    return allowed.has(s);
  });
}

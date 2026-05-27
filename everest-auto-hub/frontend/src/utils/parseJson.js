/**
 * Safely parse a value that might be a JSON string or already an array/object.
 * Returns fallback if parsing fails.
 */
export function parseJsonField(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}

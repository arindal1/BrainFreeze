/**
 * Lowercase, trim, strip punctuation, collapse whitespace for duplicate detection.
 * Uses Unicode property escapes (not ASCII-only \w) so non-Latin queries
 * (e.g. CJK, Cyrillic, accented text) aren't stripped down to an empty string.
 */
export function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
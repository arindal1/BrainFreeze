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

/** True if the raw query is itself a well-formed http(s) URL. */
export function isUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
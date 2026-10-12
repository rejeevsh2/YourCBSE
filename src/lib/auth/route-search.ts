/** Shared search-param validators for the auth routes. */

export interface OptionalEmailSearch {
  email?: string;
}

/**
 * Keeps `?email=` optional so the URL stays clean when the value is absent
 * (no redirect loop on a bare visit).
 */
export function optionalEmailSearch(search: Record<string, unknown>): OptionalEmailSearch {
  return typeof search.email === "string" && search.email ? { email: search.email } : {};
}


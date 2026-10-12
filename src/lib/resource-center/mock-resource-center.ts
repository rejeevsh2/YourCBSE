/**
 * Mock Resource Center service — in-memory, stateful for the session.
 * Mirrors the Laravel contract exactly so screens stay unchanged later.
 */

import {
  libraryResources,
  mixedResources,
  resourceById,
  type LibraryResource,
} from "@/data/resource-center";
import {
  libraryFailure,
  librarySuccess,
  type LibraryResult,
  type LibraryUserState,
  type ResourceCenterService,
  type ResourceQuery,
  type SearchSuggestionItem,
} from "./types";

const state: LibraryUserState = {
  bookmarks: libraryResources.filter((_, index) => index % 17 === 0).slice(0, 8).map((r) => r.id),
  downloads: libraryResources
    .filter((_, index) => index % 23 === 0)
    .slice(0, 6)
    .map((r, index) => ({
      resourceId: r.id,
      downloadedAt: new Date(2026, 6, 30 - index * 2).toISOString().slice(0, 10),
    })),
  recentlyViewed: mixedResources.slice(0, 6).map((r) => r.id),
};

function snapshot(): LibraryUserState {
  return {
    bookmarks: [...state.bookmarks],
    downloads: state.downloads.map((item) => ({ ...item })),
    recentlyViewed: [...state.recentlyViewed],
  };
}

function delay<TData>(data: TData, ms = 260): Promise<TData> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function matchesTerm(resource: LibraryResource, term: string) {
  if (!term) return true;
  const haystack = [
    resource.title,
    resource.description,
    resource.chapter,
    resource.subject,
    resource.grade,
    resource.category,
    resource.kind,
    resource.author,
  ]
    .join(" ")
    .toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function includesAll<T>(selected: T[], value: T) {
  return selected.length === 0 || selected.includes(value);
}

/** Pure query engine — exported so components can filter locally too. */
export function runResourceQuery(
  query: ResourceQuery,
  bookmarks: string[] = [],
): LibraryResource[] {
  const results = libraryResources.filter((resource) => {
    if (!matchesTerm(resource, query.term)) return false;
    if (!includesAll(query.grades, resource.grade)) return false;
    if (!includesAll(query.subjects, resource.subject)) return false;
    if (!includesAll(query.chapters, resource.chapter)) return false;
    if (!includesAll(query.categories, resource.category)) return false;
    if (!includesAll(query.kinds, resource.kind)) return false;
    if (!includesAll(query.difficulties, resource.difficulty)) return false;
    if (!includesAll(query.languages, resource.language)) return false;
    if (!includesAll(query.statuses, resource.status)) return false;
    if (query.maxDuration && resource.durationMinutes > query.maxDuration) return false;
    if (query.recentlyAdded && resource.addedDaysAgo > 14) return false;
    if (query.bookmarkedOnly && !bookmarks.includes(resource.id)) return false;
    return true;
  });

  switch (query.sort) {
    case "Recently added":
      return [...results].sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    case "Most popular":
      return [...results].sort((a, b) => b.popularity - a.popularity);
    case "Most downloaded":
      return [...results].sort((a, b) => b.downloads - a.downloads);
    default:
      return results;
  }
}

export function buildSuggestions(term: string, limit = 8): SearchSuggestionItem[] {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return [];
  return libraryResources
    .filter((resource) => matchesTerm(resource, trimmed))
    .slice(0, limit)
    .map((resource) => ({
      id: resource.id,
      label: resource.title,
      kind: resource.kind,
      context: `${resource.grade} · ${resource.subject} · ${resource.category}`,
    }));
}

export const mockResourceCenterService: ResourceCenterService = {
  async search(query, bookmarks = []) {
    return delay(librarySuccess(runResourceQuery(query, bookmarks)));
  },

  async suggest(term, limit = 8) {
    return delay(librarySuccess(buildSuggestions(term, limit)), 80);
  },

  async getResource(id): Promise<LibraryResult<LibraryResource>> {
    const resource = resourceById.get(id);
    if (!resource) return delay(libraryFailure("not-found"), 120);
    return delay(librarySuccess(resource), 200);
  },

  async getUserState() {
    return delay(librarySuccess(snapshot()), 120);
  },

  async toggleBookmark(id, bookmarked) {
    state.bookmarks = bookmarked
      ? Array.from(new Set([...state.bookmarks, id]))
      : state.bookmarks.filter((value) => value !== id);
    return delay(librarySuccess(snapshot()), 140);
  },

  async download(id) {
    if (!state.downloads.some((item) => item.resourceId === id)) {
      state.downloads = [
        { resourceId: id, downloadedAt: new Date().toISOString().slice(0, 10) },
        ...state.downloads,
      ];
    }
    return delay(librarySuccess(snapshot()), 200);
  },

  async removeDownload(id) {
    state.downloads = state.downloads.filter((item) => item.resourceId !== id);
    return delay(librarySuccess(snapshot()), 140);
  },

  async recordView(id) {
    state.recentlyViewed = [id, ...state.recentlyViewed.filter((value) => value !== id)].slice(0, 12);
    return delay(librarySuccess(snapshot()), 60);
  },
};


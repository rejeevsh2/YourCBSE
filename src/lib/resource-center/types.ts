/**
 * Resource Center data contracts.
 *
 * The boundary between the library UI and whichever implementation is active
 * (mock data today, Laravel API later). Screens depend on this file only.
 */

import type {
  LibraryResource,
  ResourceCategory,
  ResourceDifficulty,
  ResourceLanguage,
  ResourceStatus,
  SearchEntityKind,
} from "@/data/resource-center";

export type LibraryErrorCode = "not-found" | "network-error" | "server-error";

export interface LibrarySuccess<TData> {
  ok: true;
  data: TData;
  message?: string;
}

export interface LibraryFailure {
  ok: false;
  code: LibraryErrorCode;
  message: string;
}

export type LibraryResult<TData> = LibrarySuccess<TData> | LibraryFailure;

const defaultMessages: Record<LibraryErrorCode, string> = {
  "not-found": "We couldn't find that resource.",
  "network-error": "Network unavailable. Check your connection and retry.",
  "server-error": "Something went wrong on our side. Please try again.",
};

export function librarySuccess<TData>(data: TData, message?: string): LibrarySuccess<TData> {
  return { ok: true, data, message };
}

export function libraryFailure(code: LibraryErrorCode, message?: string): LibraryFailure {
  return { ok: false, code, message: message ?? defaultMessages[code] };
}

export type SortOption =
  | "Most relevant"
  | "Recently added"
  | "Most popular"
  | "Most downloaded";

export const sortOptions: SortOption[] = [
  "Most relevant",
  "Recently added",
  "Most popular",
  "Most downloaded",
];

/** Every filter the search page can apply. Empty arrays mean "no restriction". */
export interface ResourceQuery {
  term: string;
  grades: string[];
  subjects: string[];
  chapters: string[];
  categories: ResourceCategory[];
  kinds: SearchEntityKind[];
  difficulties: ResourceDifficulty[];
  languages: ResourceLanguage[];
  statuses: ResourceStatus[];
  /** Upper bound in minutes; `0` disables the filter. */
  maxDuration: number;
  recentlyAdded: boolean;
  bookmarkedOnly: boolean;
  sort: SortOption;
}

export const emptyQuery: ResourceQuery = {
  term: "",
  grades: [],
  subjects: [],
  chapters: [],
  categories: [],
  kinds: [],
  difficulties: [],
  languages: [],
  statuses: [],
  maxDuration: 0,
  recentlyAdded: false,
  bookmarkedOnly: false,
  sort: "Most relevant",
};

export interface SearchSuggestionItem {
  id: string;
  label: string;
  kind: SearchEntityKind;
  context: string;
}

export interface DownloadedResource {
  resourceId: string;
  downloadedAt: string;
}

export interface LibraryUserState {
  bookmarks: string[];
  downloads: DownloadedResource[];
  recentlyViewed: string[];
}

export interface ResourceCenterService {
  search(query: ResourceQuery, bookmarks?: string[]): Promise<LibraryResult<LibraryResource[]>>;
  suggest(term: string, limit?: number): Promise<LibraryResult<SearchSuggestionItem[]>>;
  getResource(id: string): Promise<LibraryResult<LibraryResource>>;
  getUserState(): Promise<LibraryResult<LibraryUserState>>;
  toggleBookmark(id: string, bookmarked: boolean): Promise<LibraryResult<LibraryUserState>>;
  download(id: string): Promise<LibraryResult<LibraryUserState>>;
  removeDownload(id: string): Promise<LibraryResult<LibraryUserState>>;
  recordView(id: string): Promise<LibraryResult<LibraryUserState>>;
}


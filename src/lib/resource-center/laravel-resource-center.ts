/**
 * Laravel-backed Resource Center service.
 *
 * Inactive while mock data is enabled; it exists so flipping
 * `VITE_USE_MOCK_DATA=false` needs no component changes.
 */

import { apiRequest } from "@/lib/auth/http";
import type { LibraryResource } from "@/data/resource-center";
import { resourceCenterEndpoints } from "./endpoints";
import {
  libraryFailure,
  librarySuccess,
  type LibraryResult,
  type LibraryUserState,
  type ResourceCenterService,
  type SearchSuggestionItem,
} from "./types";

async function request<TData>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<LibraryResult<TData>> {
  const result = await apiRequest<TData>(path, {
    method: init.method ?? "GET",
    body: init.body,
  });

  if (!result.ok) {
    return libraryFailure(
      result.code === "network-error" ? "network-error" : "server-error",
      result.message,
    );
  }

  return librarySuccess(result.data as TData);
}

function toQueryString(payload: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(`${key}[]`, String(entry)));
    } else if (value !== "" && value !== false && value !== 0 && value != null) {
      params.set(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export const laravelResourceCenterService: ResourceCenterService = {
  search: (query) =>
    request<LibraryResource[]>(
      `${resourceCenterEndpoints.search}${toQueryString({ ...query })}`,
    ),
  suggest: (term, limit = 8) =>
    request<SearchSuggestionItem[]>(
      `${resourceCenterEndpoints.suggest}${toQueryString({ term, limit })}`,
    ),
  getResource: (id) => request<LibraryResource>(resourceCenterEndpoints.resource(id)),
  getUserState: () => request<LibraryUserState>(resourceCenterEndpoints.userState),
  toggleBookmark: (id, bookmarked) =>
    request<LibraryUserState>(resourceCenterEndpoints.bookmark(id), {
      method: bookmarked ? "POST" : "DELETE",
    }),
  download: (id) =>
    request<LibraryUserState>(resourceCenterEndpoints.download(id), { method: "POST" }),
  removeDownload: (id) =>
    request<LibraryUserState>(resourceCenterEndpoints.download(id), { method: "DELETE" }),
  recordView: (id) =>
    request<LibraryUserState>(resourceCenterEndpoints.view(id), { method: "POST" }),
};


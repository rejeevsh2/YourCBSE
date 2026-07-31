/**
 * Single entry point for Resource Center data. Screens import
 * `resourceCenterService` and never touch the transport.
 */

import { laravelResourceCenterService } from "./laravel-resource-center";
import { mockResourceCenterService } from "./mock-resource-center";
import type { ResourceCenterService } from "./types";

const useMock = (import.meta.env.VITE_USE_MOCK_DATA as string | undefined) !== "false";

export const resourceCenterService: ResourceCenterService = useMock
  ? mockResourceCenterService
  : laravelResourceCenterService;

export const isMockLibraryData = useMock;

export { resourceCenterEndpoints } from "./endpoints";
export { runResourceQuery, buildSuggestions } from "./mock-resource-center";
export * from "./types";

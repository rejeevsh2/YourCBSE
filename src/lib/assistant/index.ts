/** Single entry point for assistant data. */

import { laravelAssistantService } from "./laravel-assistant";
import { mockAssistantService } from "./mock-assistant";
import type { AssistantService } from "./types";

const useMock = (import.meta.env.VITE_USE_MOCK_DATA as string | undefined) !== "false";

export const assistantService: AssistantService = useMock
  ? mockAssistantService
  : laravelAssistantService;

export const isMockAssistant = useMock;

export { assistantEndpoints } from "./endpoints";
export * from "./types";


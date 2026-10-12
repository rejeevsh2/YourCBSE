/**
 * Laravel-backed assistant service.
 *
 * Inactive while mock data is on. The Laravel side is expected to proxy the
 * model provider (OpenAI, Gemini, Claude, …) so the UI never changes.
 */

import type { AssistantConversation, AssistantFeedback } from "@/data/ai-assistant";
import { apiRequest } from "@/lib/auth/http";
import { assistantEndpoints } from "./endpoints";
import type { AssistantReply, AssistantResult, AssistantService } from "./types";

async function request<TData>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<AssistantResult<TData>> {
  const result = await apiRequest<TData>(path, { method: init.method ?? "GET", body: init.body });
  if (!result.ok) {
    return {
      ok: false,
      error: {
        code: result.code === "network-error" ? "offline" : "unavailable",
        message: result.message ?? "The assistant is unavailable right now.",
      },
    };
  }
  return { ok: true, data: result.data as TData };
}

export const laravelAssistantService: AssistantService = {
  listConversations: () => request<AssistantConversation[]>(assistantEndpoints.conversations),

  createConversation: () =>
    request<AssistantConversation>(assistantEndpoints.conversations, { method: "POST" }),

  clearConversation: (id) =>
    request<AssistantConversation>(assistantEndpoints.clear(id), { method: "POST" }),

  deleteConversation: (id) =>
    request<null>(assistantEndpoints.conversation(id), { method: "DELETE" }),

  sendMessage: ({ conversationId, prompt, actionId, context }) =>
    request<AssistantReply>(assistantEndpoints.messages(conversationId), {
      method: "POST",
      body: { prompt, action_id: actionId, context },
    }),

  regenerate: (conversationId, messageId) =>
    request<AssistantReply>(assistantEndpoints.regenerate(conversationId, messageId), {
      method: "POST",
    }),

  rateMessage: (conversationId, messageId, feedback: AssistantFeedback) =>
    request<null>(assistantEndpoints.feedback(conversationId, messageId), {
      method: "POST",
      body: { feedback },
    }),
};


/**
 * Contracts for the AI assistant data layer.
 *
 * The UI only ever talks to `assistantService`, so swapping the mock for a
 * Laravel endpoint (which may proxy OpenAI, Gemini, Claude, …) needs no UI work.
 */

import type { AssistantConversation, AssistantFeedback, AssistantMessage } from "@/data/ai-assistant";

export interface SendMessageInput {
  conversationId: string;
  prompt: string;
  /** Quick action / tool that triggered the prompt. */
  actionId?: string;
  /** Learning context sent alongside the prompt. */
  context?: Record<string, string | number>;
}

export interface AssistantReply {
  message: AssistantMessage;
  conversationId: string;
}

export type AssistantErrorCode = "offline" | "unavailable" | "failed";

export interface AssistantError {
  code: AssistantErrorCode;
  message: string;
}

export type AssistantResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AssistantError };

export interface AssistantService {
  listConversations(): Promise<AssistantResult<AssistantConversation[]>>;
  createConversation(): Promise<AssistantResult<AssistantConversation>>;
  clearConversation(conversationId: string): Promise<AssistantResult<AssistantConversation>>;
  deleteConversation(conversationId: string): Promise<AssistantResult<null>>;
  sendMessage(input: SendMessageInput): Promise<AssistantResult<AssistantReply>>;
  regenerate(conversationId: string, messageId: string): Promise<AssistantResult<AssistantReply>>;
  rateMessage(
    conversationId: string,
    messageId: string,
    feedback: AssistantFeedback,
  ): Promise<AssistantResult<null>>;
}

/**
 * In-memory assistant service. Deterministic placeholder conversations with a
 * short simulated latency so loading/typing states are exercised properly.
 */

import {
  assistantConversations,
  conversationTitleFrom,
  draftAssistantReply,
  welcomeMessage,
  type AssistantConversation,
  type AssistantFeedback,
  type AssistantMessage,
} from "@/data/ai-assistant";
import type { AssistantReply, AssistantResult, AssistantService, SendMessageInput } from "./types";

let store: AssistantConversation[] = assistantConversations.map((conversation) => ({
  ...conversation,
  messages: [...conversation.messages],
}));

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter += 1)}`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = <T,>(data: T): AssistantResult<T> => ({ ok: true, data });

function find(conversationId: string) {
  return store.find((conversation) => conversation.id === conversationId);
}

function touch(conversation: AssistantConversation, preview: string) {
  conversation.updatedAt = new Date().toISOString();
  conversation.preview = preview;
}

export const mockAssistantService: AssistantService = {
  async listConversations() {
    await wait(180);
    return ok(store.map((conversation) => ({ ...conversation, messages: [...conversation.messages] })));
  },

  async createConversation() {
    await wait(120);
    const conversation: AssistantConversation = {
      id: nextId("conv"),
      title: "New chat",
      updatedAt: new Date().toISOString(),
      preview: "Ask anything from your syllabus.",
      messages: [{ ...welcomeMessage, id: nextId("msg"), createdAt: new Date().toISOString() }],
    };
    store = [conversation, ...store];
    return ok({ ...conversation, messages: [...conversation.messages] });
  },

  async clearConversation(conversationId) {
    await wait(120);
    const conversation = find(conversationId);
    if (!conversation) return { ok: false, error: { code: "failed", message: "Conversation not found." } };
    conversation.messages = [
      { ...welcomeMessage, id: nextId("msg"), createdAt: new Date().toISOString() },
    ];
    touch(conversation, "Chat cleared.");
    return ok({ ...conversation, messages: [...conversation.messages] });
  },

  async deleteConversation(conversationId) {
    await wait(120);
    store = store.filter((conversation) => conversation.id !== conversationId);
    return ok(null);
  },

  async sendMessage({ conversationId, prompt, actionId }: SendMessageInput) {
    await wait(900);
    const conversation = find(conversationId);
    if (!conversation) return { ok: false, error: { code: "failed", message: "Conversation not found." } };

    const reply: AssistantMessage = {
      id: nextId("msg"),
      role: "assistant",
      text: draftAssistantReply(prompt, actionId),
      createdAt: new Date().toISOString(),
      feedback: null,
      actionId,
    };

    conversation.messages = [...conversation.messages, reply];
    if (conversation.title === "New chat") conversation.title = conversationTitleFrom(prompt);
    touch(conversation, prompt);

    return ok<AssistantReply>({ message: reply, conversationId });
  },

  async regenerate(conversationId, messageId) {
    await wait(800);
    const conversation = find(conversationId);
    if (!conversation) return { ok: false, error: { code: "failed", message: "Conversation not found." } };

    const index = conversation.messages.findIndex((message) => message.id === messageId);
    const previousPrompt =
      [...conversation.messages.slice(0, index)].reverse().find((m) => m.role === "user")?.text ?? "";

    const reply: AssistantMessage = {
      id: nextId("msg"),
      role: "assistant",
      text: `${draftAssistantReply(previousPrompt)}\n\n_Regenerated with a different explanation style._`,
      createdAt: new Date().toISOString(),
      feedback: null,
    };

    conversation.messages =
      index >= 0
        ? [...conversation.messages.slice(0, index), reply, ...conversation.messages.slice(index + 1)]
        : [...conversation.messages, reply];

    return ok<AssistantReply>({ message: reply, conversationId });
  },

  async rateMessage(conversationId, messageId, feedback: AssistantFeedback) {
    await wait(80);
    const conversation = find(conversationId);
    const message = conversation?.messages.find((item) => item.id === messageId);
    if (message) message.feedback = feedback;
    return ok(null);
  },
};


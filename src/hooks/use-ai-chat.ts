import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  assistantContext,
  welcomeMessage,
  type AssistantConversation,
  type AssistantFeedback,
  type AssistantMessage,
} from "@/data/ai-assistant";
import { assistantService, type AssistantError } from "@/lib/assistant";

interface UseAiChatOptions {
  /** Skip loading until the panel is opened. */
  enabled?: boolean;
}

/**
 * Owns the whole chat lifecycle: conversations, sending, regenerating and
 * feedback. Screens stay presentational and the transport can be swapped.
 */
export function useAiChat({ enabled = true }: UseAiChatOptions = {}) {
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<AssistantError | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await assistantService.listConversations();
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setConversations(result.data);
    setActiveId((current) => current ?? result.data[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled || loadedRef.current) return;
    loadedRef.current = true;
    void load();
  }, [enabled, load]);

  const active = conversations.find((conversation) => conversation.id === activeId) ?? null;
  const messages: AssistantMessage[] = active?.messages ?? [welcomeMessage];

  const patch = useCallback((id: string, updater: (value: AssistantConversation) => AssistantConversation) => {
    setConversations((current) =>
      current.map((conversation) => (conversation.id === id ? updater(conversation) : conversation)),
    );
  }, []);

  const send = useCallback(
    async (prompt: string, actionId?: string) => {
      const text = prompt.trim();
      if (!text || sending) return;

      let conversationId = activeId;
      if (!conversationId) {
        const created = await assistantService.createConversation();
        if (!created.ok) {
          setError(created.error);
          return;
        }
        conversationId = created.data.id;
        setConversations((current) => [created.data, ...current]);
        setActiveId(conversationId);
      }

      const optimistic: AssistantMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        text,
        createdAt: new Date().toISOString(),
      };

      patch(conversationId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, optimistic],
        preview: text,
      }));

      setSending(true);
      setError(null);

      const result = await assistantService.sendMessage({
        conversationId,
        prompt: text,
        actionId,
        context: { ...assistantContext },
      });

      setSending(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      patch(conversationId, (conversation) => ({
        ...conversation,
        title: conversation.title === "New chat" ? text.slice(0, 42) : conversation.title,
        messages: [...conversation.messages, result.data.message],
        updatedAt: result.data.message.createdAt,
      }));
    },
    [activeId, patch, sending],
  );

  const startNewChat = useCallback(async () => {
    const created = await assistantService.createConversation();
    if (!created.ok) {
      setError(created.error);
      return;
    }
    setConversations((current) => [created.data, ...current]);
    setActiveId(created.data.id);
  }, []);

  const clearChat = useCallback(async () => {
    if (!activeId) return;
    const result = await assistantService.clearConversation(activeId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    patch(activeId, () => result.data);
    toast.success("Chat cleared");
  }, [activeId, patch]);

  const deleteConversation = useCallback(
    async (id: string) => {
      const result = await assistantService.deleteConversation(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConversations((current) => current.filter((conversation) => conversation.id !== id));
      setActiveId((current) => (current === id ? null : current));
    },
    [],
  );

  const regenerate = useCallback(
    async (messageId: string) => {
      if (!activeId) return;
      setSending(true);
      const result = await assistantService.regenerate(activeId, messageId);
      setSending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      patch(activeId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === messageId ? result.data.message : message,
        ),
      }));
    },
    [activeId, patch],
  );

  const rate = useCallback(
    async (messageId: string, feedback: AssistantFeedback) => {
      if (!activeId) return;
      patch(activeId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === messageId
            ? { ...message, feedback: message.feedback === feedback ? null : feedback }
            : message,
        ),
      }));
      await assistantService.rateMessage(activeId, messageId, feedback);
    },
    [activeId, patch],
  );

  return {
    conversations,
    activeId,
    active,
    messages,
    loading,
    sending,
    error,
    retry: load,
    setActiveId,
    send,
    startNewChat,
    clearChat,
    deleteConversation,
    regenerate,
    rate,
  };
}

export type AiChat = ReturnType<typeof useAiChat>;

/** Laravel routes for the assistant module — kept in one place for renaming. */
export const assistantEndpoints = {
  conversations: "/ai/conversations",
  conversation: (id: string) => `/ai/conversations/${id}`,
  clear: (id: string) => `/ai/conversations/${id}/clear`,
  messages: (id: string) => `/ai/conversations/${id}/messages`,
  regenerate: (id: string, messageId: string) =>
    `/ai/conversations/${id}/messages/${messageId}/regenerate`,
  feedback: (id: string, messageId: string) =>
    `/ai/conversations/${id}/messages/${messageId}/feedback`,
} as const;


import apiClient from "./client";

export const analyzeText = (text) => apiClient.post("/ai/analyze", { text }).then((r) => r.data.analysis);
export const sendChatMessage = (message, sessionId) =>
  apiClient.post("/ai/chat", { message, session_id: sessionId }).then((r) => r.data);
export const getChatSessionMessages = (sessionId) =>
  apiClient.get(`/ai/chat/sessions/${sessionId}/messages`).then((r) => r.data.messages);

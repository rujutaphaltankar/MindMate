import apiClient from "./client";

export const getAIProviders = () =>
  apiClient.get("/ai/providers").then((r) => r.data.providers);

export const analyzeText = (text) =>
  apiClient.post("/ai/analyze", { text }).then((r) => r.data.analysis);

export const sendChatMessage = (message, sessionId, provider) =>
  apiClient
    .post("/ai/chat", { message, session_id: sessionId, provider })
    .then((r) => r.data);

export const listChatSessions = () =>
  apiClient.get("/ai/chat/sessions").then((r) => r.data.sessions);

export const getChatSessionMessages = (sessionId) =>
  apiClient.get(`/ai/chat/sessions/${sessionId}/messages`).then((r) => r.data.messages);

/**
 * Streams companion chat responses in real-time via Server-Sent Events (SSE).
 */
export async function streamChatMessage({
  message,
  sessionId,
  provider,
  onChunk,
  onComplete,
  onError,
  signal,
}) {
  const token = localStorage.getItem("mindmate_access_token");
  const baseUrl = apiClient.defaults.baseURL || "/api";
  const url = `${baseUrl.replace(/\/$/, "")}/ai/chat/stream`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, session_id: sessionId, provider }),
      signal,
    });

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch {
        // Response is non-JSON
      }
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const payloadStr = trimmed.replace(/^data:\s*/, "");
        try {
          const payload = JSON.parse(payloadStr);
          if (payload.chunk && onChunk) {
            onChunk(payload.chunk);
          }
          if (payload.done && onComplete) {
            onComplete(payload);
          }
        } catch (parseErr) {
          console.warn("Failed to parse SSE line:", trimmed, parseErr);
        }
      }
    }
  } catch (err) {
    if (err.name === "AbortError") {
      // User aborted stream
      return;
    }
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

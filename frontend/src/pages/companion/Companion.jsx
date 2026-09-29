import { useEffect, useRef, useState } from "react";

import {
  getAIProviders,
  getChatSessionMessages,
  listChatSessions,
  streamChatMessage,
} from "../../api/ai";
import AppShell from "../../components/AppShell";

const PROMPT_CHIPS = [
  { label: "💖 Say something nice", text: "Could you say something nice and encouraging to cheer me up?" },
  { label: "🧘 Feeling overwhelmed", text: "I'm feeling really overwhelmed right now with everything going on." },
  { label: "💭 Just need to vent", text: "I just need someone to listen while I vent about my day." },
  { label: "🌬️ Quick 1-min reset", text: "Can you guide me through a quick 1-minute breathing reset?" },
  { label: "✨ Had a great win!", text: "I had a really positive win today that I want to celebrate!" },
  { label: "😴 Can't quiet my mind", text: "My mind won't stop racing and I'm having trouble unwinding tonight." },
  { label: "📓 Recommend a journal prompt", text: "What is a good journal prompt for someone feeling stuck?" },
];

export default function Companion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [crisisResources, setCrisisResources] = useState(null);

  // Model providers
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("rule_based");

  // Chat sessions history
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const scrollRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Load available providers and past sessions on mount
  useEffect(() => {
    getAIProviders()
      .then((data) => {
        setProviders(data);
        const defaultProv = data.find((p) => p.is_default && p.available);
        if (defaultProv) setSelectedProvider(defaultProv.id);
      })
      .catch(() => {});

    loadSessions();
  }, []);

  function loadSessions() {
    listChatSessions()
      .then((data) => setSessions(data || []))
      .catch(() => {});
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, isStreaming]);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function handleSelectSession(sid) {
    if (isStreaming) return;
    setIsLoadingHistory(true);
    try {
      const msgs = await getChatSessionMessages(sid);
      setSessionId(sid);
      setMessages(
        msgs.map((m) => ({
          role: m.role,
          content: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }))
      );
      setCrisisResources(null);
      setShowHistory(false);
    } catch {
      // Failed to load
    } finally {
      setIsLoadingHistory(false);
    }
  }

  function handleStopGenerating() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }

  async function sendMessageText(textToSend) {
    const message = (textToSend || input).trim();
    if (!message || isStreaming) return;

    const userTime = getCurrentTime();
    setMessages((prev) => [...prev, { role: "user", content: message, time: userTime }]);
    setInput("");
    setIsStreaming(true);
    setCrisisResources(null);

    // Prepare assistant placeholder message
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", time: getCurrentTime(), isStreaming: true },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChatMessage({
        message,
        sessionId,
        provider: selectedProvider,
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const lastMsg = copy[copy.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              copy[copy.length - 1] = {
                ...lastMsg,
                content: lastMsg.content + chunk,
              };
            }
            return copy;
          });
        },
        onComplete: (data) => {
          setIsStreaming(false);
          if (data.session_id) {
            setSessionId(data.session_id);
            loadSessions();
          }
          if (data.safety_triggered) {
            setCrisisResources(data.crisis_resources || []);
          }
          setMessages((prev) => {
            const copy = [...prev];
            const lastMsg = copy[copy.length - 1];
            if (lastMsg) {
              copy[copy.length - 1] = { ...lastMsg, isStreaming: false };
            }
            return copy;
          });
        },
        onError: () => {
          setIsStreaming(false);
          setMessages((prev) => {
            const copy = [...prev];
            const lastMsg = copy[copy.length - 1];
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
              copy[copy.length - 1] = {
                ...lastMsg,
                content: "I'm right here with you, but I had a momentary connection glitch. Could you try sending that again?",
                isStreaming: false,
              };
            }
            return copy;
          });
        },
      });
    } catch {
      setIsStreaming(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    sendMessageText();
  }

  function handleNewChat() {
    if (isStreaming) handleStopGenerating();
    setMessages([]);
    setSessionId(null);
    setCrisisResources(null);
  }

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Talk to MindMate</h1>
          <p className="mt-1 text-xs text-dusk-400">
            A warm, empathetic soundboard for your thoughts. Non-clinical & strictly private.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Provider Picker */}
          {providers.length > 0 && (
            <div className="relative">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                disabled={isStreaming}
                className="rounded-xl border border-dusk-200 bg-white px-3 py-1.5 text-xs font-medium text-dusk-700 outline-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-200"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id} disabled={!p.available}>
                    {p.name} {!p.available ? "(No API key)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Past Chats Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              showHistory
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border-dusk-200 text-dusk-600 hover:bg-dusk-50 dark:border-dusk-700 dark:text-dusk-300 dark:hover:bg-dusk-900"
            }`}
          >
            💬 Conversations ({sessions.length})
          </button>

          <button
            onClick={handleNewChat}
            className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-soft hover:bg-indigo-700"
          >
            + New Chat
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-4 h-[72vh]">
        {/* Past Sessions Drawer / Sidebar */}
        {showHistory && (
          <aside className="w-64 flex flex-col rounded-3xl border border-dusk-100 bg-white p-4 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
            <div className="flex items-center justify-between pb-3 border-b border-dusk-100 dark:border-dusk-700">
              <span className="text-xs font-semibold text-dusk-700 dark:text-dusk-200">Past Conversations</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-dusk-400 hover:text-dusk-600 dark:hover:text-dusk-200"
              >
                &times;
              </button>
            </div>
            <div className="mt-3 flex-1 overflow-y-auto space-y-1.5">
              {isLoadingHistory ? (
                <p className="text-xs text-dusk-400 text-center py-4">Loading conversation...</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-dusk-400 text-center py-4">No saved chats yet.</p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs transition ${
                      sessionId === s.id
                        ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "text-dusk-600 hover:bg-dusk-50 dark:text-dusk-300 dark:hover:bg-dusk-700/50"
                    }`}
                  >
                    <p className="truncate font-medium">Session #{s.id.slice(-6)}</p>
                    <p className="text-[10px] text-dusk-400 mt-0.5">
                      {new Date(s.updated_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Main Chat Box */}
        <div className="flex-1 flex flex-col rounded-3xl border border-dusk-100 bg-white shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-dusk-100 px-6 py-3.5 dark:border-dusk-700">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-lg dark:bg-indigo-900/50">
                💜
              </div>
              <div>
                <h2 className="text-sm font-semibold text-dusk-900 dark:text-dusk-50">MindMate AI</h2>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                  <span className={`h-2 w-2 rounded-full ${isStreaming ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`}></span>
                  <span>{isStreaming ? "Streaming reply..." : "Online & listening"}</span>
                </div>
              </div>
            </div>

            {isStreaming && (
              <button
                onClick={handleStopGenerating}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
              >
                ⏹ Stop generating
              </button>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="my-auto flex flex-col items-center justify-center text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl dark:bg-indigo-950/40 mb-3">
                  ✨
                </div>
                <h3 className="font-display text-lg font-medium text-dusk-800 dark:text-dusk-100">
                  Hey there! I'm here for you.
                </h3>
                <p className="mt-1 max-w-md text-xs text-dusk-400">
                  Whether you want to vent, process a stressful moment, celebrate a win, or get a quick calming reset, there's zero judgement here.
                </p>

                {/* Starter Chips */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
                  {PROMPT_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessageText(chip.text)}
                      className="rounded-full border border-dusk-200 bg-dusk-50/50 px-3.5 py-1.5 text-xs font-medium text-dusk-700 transition-all hover:border-indigo-400 hover:bg-indigo-50 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="mb-1 text-[10px] font-medium text-dusk-400 px-1">
                  {m.role === "user" ? "You" : "MindMate"}
                </div>
                <div
                  className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-xs shadow-sm"
                      : "bg-dusk-50 text-dusk-800 dark:bg-dusk-900 dark:text-dusk-100 rounded-bl-xs border border-dusk-100/60 dark:border-dusk-700/60 shadow-sm"
                  }`}
                >
                  {m.content}
                  {m.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 bg-indigo-500 animate-pulse ml-1 align-middle" />
                  )}
                </div>
                <div className="mt-1 text-[10px] text-dusk-400 px-1">{m.time}</div>
              </div>
            ))}

            <div ref={scrollRef} />
          </div>

          {/* Crisis Resources Banner */}
          {crisisResources && crisisResources.length > 0 && (
            <div className="mx-6 mb-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
              <div className="flex items-center gap-2 font-semibold text-sm text-rose-700 dark:text-rose-300 mb-1">
                <span>🚨</span> Immediate Support Resources
              </div>
              <p className="opacity-90 mb-2">
                You matter and you don't have to carry this alone. Please reach out to one of these free, confidential crisis services right now:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {crisisResources.map((r) => (
                  <div key={r.id || r.name} className="rounded-xl bg-white/70 p-2.5 dark:bg-dusk-900/70 border border-rose-200 dark:border-rose-800/40">
                    <p className="font-semibold text-dusk-900 dark:text-dusk-50">{r.name}</p>
                    {r.phone && (
                      <a href={`tel:${r.phone.replace(/[^0-9]/g, "")}`} className="inline-block mt-1 font-medium text-indigo-600 dark:text-indigo-400 underline">
                        📞 Call {r.phone}
                      </a>
                    )}
                    {r.description && <p className="text-[11px] text-dusk-500 mt-0.5">{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 border-t border-dusk-100 p-4 dark:border-dusk-700"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isStreaming ? "MindMate is replying..." : "Talk to MindMate… share whatever's on your mind"}
              disabled={isStreaming}
              className="flex-1 rounded-full border border-dusk-200 bg-dusk-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50 dark:focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <span>Send</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

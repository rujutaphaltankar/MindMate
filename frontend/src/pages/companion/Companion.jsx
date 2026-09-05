import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "../../api/ai";
import AppShell from "../../components/AppShell";

const PROMPT_CHIPS = [
  { label: "💖 Say something nice", text: "Could you say something nice and encouraging to cheer me up?" },
  { label: "💡 How can MindMate help me?", text: "What are your best recommendations and features on this app to help me?" },
  { label: "🧘 Feeling overwhelmed", text: "I'm feeling really overwhelmed right now." },
  { label: "💭 Just need to vent", text: "I just need someone to listen while I vent about my day." },
  { label: "🌬️ Quick 1-min reset", text: "Can you help me with a quick 1-minute breathing reset?" },
  { label: "✨ Had a great win!", text: "I had a really positive win today that I want to share!" },
  { label: "😴 Can't quiet my mind", text: "My mind won't stop racing and I'm having trouble unwinding." },
];

export default function Companion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [crisisResources, setCrisisResources] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function sendMessageText(message) {
    if (!message || isSending) return;

    const timestamp = getCurrentTime();
    setMessages((prev) => [...prev, { role: "user", content: message, time: timestamp }]);
    setInput("");
    setIsSending(true);

    try {
      const data = await sendChatMessage(message, sessionId);
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, time: getCurrentTime() },
      ]);
      setCrisisResources(data.safety_triggered ? data.crisis_resources : null);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm right here with you, but I had a momentary connection glitch. Could you try sending that again?",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    sendMessageText(input.trim());
  }

  function handleNewChat() {
    setMessages([]);
    setSessionId(null);
    setCrisisResources(null);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Talk to MindMate</h1>
          <p className="mt-1 text-xs text-dusk-400">
            A warm, empathetic soundboard for your thoughts. Non-clinical & private.
          </p>
        </div>
        <button
          onClick={handleNewChat}
          className="rounded-xl border border-dusk-200 px-3.5 py-1.5 text-xs font-medium text-dusk-600 hover:bg-dusk-50 dark:border-dusk-700 dark:text-dusk-300 dark:hover:bg-dusk-900"
        >
          + New Chat
        </button>
      </div>

      <div className="mt-5 flex h-[68vh] flex-col rounded-3xl border border-dusk-100 bg-white shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-dusk-100 px-6 py-3.5 dark:border-dusk-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-lg dark:bg-indigo-900/50">
              💜
            </div>
            <div>
              <h2 className="text-sm font-semibold text-dusk-900 dark:text-dusk-50">MindMate AI</h2>
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>Online & listening</span>
              </div>
            </div>
          </div>
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
                Whether you want to vent, process a stressful moment, celebrate a win, or just chat,
                there's zero judgement here.
              </p>

              {/* Starter Chips */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
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
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-xs shadow-sm"
                    : "bg-dusk-50 text-dusk-800 dark:bg-dusk-900 dark:text-dusk-100 rounded-bl-xs border border-dusk-100/60 dark:border-dusk-700/60 shadow-sm"
                }`}
              >
                {m.content}
              </div>
              <div className="mt-1 text-[10px] text-dusk-400 px-1">{m.time}</div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isSending && (
            <div className="flex flex-col items-start">
              <div className="mb-1 text-[10px] font-medium text-dusk-400 px-1">MindMate</div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-dusk-100/60 bg-dusk-50 px-4 py-3 text-sm text-dusk-500 dark:border-dusk-700/60 dark:bg-dusk-900 dark:text-dusk-400">
                <span className="text-xs">MindMate is typing</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Crisis Resources Banner */}
        {crisisResources && (
          <div className="mx-6 mb-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm text-dusk-800">
            <p className="font-medium">Support resources available to you right now:</p>
            <ul className="mt-1 space-y-1 text-xs">
              {crisisResources.map((r) => (
                <li key={r.id}>
                  <strong>{r.name}</strong> {r.phone && `— ${r.phone}`}
                </li>
              ))}
            </ul>
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
            placeholder="Talk to MindMate… share what's on your mind"
            className="flex-1 rounded-full border border-dusk-200 bg-dusk-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50 dark:focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="btn-sage flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            <span>Send</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </AppShell>
  );
}

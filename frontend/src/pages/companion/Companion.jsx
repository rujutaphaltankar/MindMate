import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "../../api/ai";
import AppShell from "../../components/AppShell";

export default function Companion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [crisisResources, setCrisisResources] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsSending(true);

    try {
      const data = await sendChatMessage(message, sessionId);
      setSessionId(data.session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setCrisisResources(data.safety_triggered ? data.crisis_resources : null);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Talk to MindMate</h1>
      <p className="mt-1 text-xs text-dusk-400">
        MindMate AI provides general wellness support and is not a substitute for professional
        mental health care.
      </p>

      <div className="mt-6 flex h-[60vh] flex-col rounded-3xl border border-dusk-100 bg-white shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {messages.length === 0 && (
            <p className="text-sm text-dusk-400">
              Hi, I'm here to listen. What's on your mind today?
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-dusk-800 text-white"
                    : "bg-dusk-50 text-dusk-800 dark:bg-dusk-900 dark:text-dusk-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {crisisResources && (
          <div className="mx-6 mb-3 rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm text-dusk-800">
            <p className="font-medium">Some resources that might help right now:</p>
            <ul className="mt-1 space-y-1">
              {crisisResources.map((r) => (
                <li key={r.id}>
                  {r.name} {r.phone && `— ${r.phone}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-dusk-100 p-4 dark:border-dusk-700">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-dusk-200 bg-white px-4 py-2.5 outline-none focus:border-dusk-400 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50"
          />
          <button
            type="submit"
            disabled={isSending}
            className="rounded-full bg-sage-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-60"
          >
            {isSending ? "…" : "Send"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

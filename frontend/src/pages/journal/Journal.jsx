import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createJournalEntry, deleteJournalEntry, listJournalEntries } from "../../api/journal";
import AppShell from "../../components/AppShell";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [analyze, setAnalyze] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    const data = await listJournalEntries({ search: search || undefined, tag: activeTag || undefined });
    setEntries(data.entries);
    setTags(data.available_tags);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTag]);

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await createJournalEntry({ text, tags: selectedTags, analyze });
    setText("");
    setSelectedTags([]);
    load();
  }

  async function handleDelete(id) {
    await deleteJournalEntry(id);
    load();
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Journal</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        A private space for your thoughts — visible only to you.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="What's on your mind today?"
          className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-3 text-dusk-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedTags.includes(tag)
                  ? "bg-indigo-600 text-white"
                  : "bg-dusk-100 text-dusk-600 hover:bg-dusk-200 dark:bg-dusk-700 dark:text-dusk-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-dusk-500 dark:text-dusk-300">
            <input type="checkbox" checked={analyze} onChange={(e) => setAnalyze(e.target.checked)} />
            Get an AI reflection (requires AI analysis consent in Privacy Settings)
          </label>
          <button type="submit" className="btn-sage px-6 py-2 text-sm font-semibold">
            Save entry
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="rounded-full border border-dusk-200 bg-white px-4 py-1.5 text-sm dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-50"
        />
        <select
          value={activeTag}
          onChange={(e) => setActiveTag(e.target.value)}
          className="rounded-full border border-dusk-200 bg-white px-4 py-1.5 text-sm dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-50"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-dusk-400">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-dusk-400">No entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-dusk-400">
                    {new Date(entry.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-dusk-800 dark:text-dusk-100">{entry.text}</p>
                  {entry.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-dusk-100 px-2.5 py-0.5 text-xs text-dusk-600 dark:bg-dusk-700 dark:text-dusk-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.ai_analysis && (
                    <div className="mt-3 rounded-2xl bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900 dark:bg-dusk-900 dark:text-indigo-300 border border-indigo-100 dark:border-dusk-700">
                      <p className="font-medium">{entry.ai_analysis.sentiment} · {entry.ai_analysis.intensity} intensity</p>
                      <p className="mt-0.5">{entry.ai_analysis.summary}</p>
                    </div>
                  )}
                </div>
                <Link to={`/journal/${entry.id}`} className="shrink-0 text-xs text-dusk-400 hover:text-dusk-700">
                  Open
                </Link>
              </div>
              <button onClick={() => handleDelete(entry.id)} className="mt-3 text-xs text-dusk-400 hover:text-red-600">
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

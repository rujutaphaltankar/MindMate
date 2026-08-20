import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { deleteJournalEntry, getJournalEntry, updateJournalEntry } from "../../api/journal";
import AppShell from "../../components/AppShell";

export default function JournalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getJournalEntry(id).then((e) => {
      setEntry(e);
      setText(e.text);
    });
  }, [id]);

  async function handleSave() {
    const updated = await updateJournalEntry(id, { text });
    setEntry(updated);
    setStatus("Saved.");
    setTimeout(() => setStatus(null), 2000);
  }

  async function handleDelete() {
    await deleteJournalEntry(id);
    navigate("/journal");
  }

  if (!entry) {
    return (
      <AppShell>
        <p className="text-dusk-400">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <button onClick={() => navigate("/journal")} className="text-sm text-dusk-400 hover:text-dusk-700">
        ← Back to journal
      </button>
      <div className="mt-4 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <p className="text-xs text-dusk-400">{new Date(entry.created_at).toLocaleString()}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="mt-3 w-full rounded-2xl border border-dusk-200 bg-white px-4 py-3 text-dusk-900 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50"
        />
        {entry.ai_analysis && (
          <div className="mt-4 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-800 dark:bg-dusk-900 dark:text-sage-300">
            <p className="font-medium">
              {entry.ai_analysis.sentiment} · {entry.ai_analysis.intensity} intensity
            </p>
            <p className="mt-0.5">{entry.ai_analysis.summary}</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSave} className="rounded-full bg-dusk-800 px-6 py-2 text-sm font-medium text-white hover:bg-dusk-700">
            Save changes
          </button>
          <button onClick={handleDelete} className="rounded-full border border-red-200 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete entry
          </button>
          {status && <span className="text-sm text-sage-600">{status}</span>}
        </div>
      </div>
    </AppShell>
  );
}

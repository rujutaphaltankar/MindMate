import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { createMoodRecord, deleteMoodRecord, getMoodHistory } from "../../api/mood";
import AppShell from "../../components/AppShell";

function Slider({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-sm font-medium text-dusk-700 dark:text-dusk-200">
        <span>{label}</span>
        <span className="text-dusk-500">{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={onChange} className="w-full accent-sage-500" />
    </label>
  );
}

export default function MoodTracker() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ mood: 5, stress: 5, energy: 5, sleep_hours: 7, note: "" });
  const [status, setStatus] = useState(null);

  async function loadHistory() {
    setIsLoading(true);
    const data = await getMoodHistory();
    setRecords(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      await createMoodRecord(form);
      setStatus({ type: "success", message: "Mood recorded." });
      setForm((prev) => ({ ...prev, note: "" }));
      loadHistory();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.error || "Could not save." });
    }
  }

  async function handleDelete(id) {
    await deleteMoodRecord(id);
    loadHistory();
  }

  const chartData = [...records]
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: r.mood,
      stress: r.stress,
      energy: r.energy,
    }));

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Mood Tracker</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        A quick daily check-in — not a medical measurement, just a way to notice patterns.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800"
        >
          <Slider label="Mood" value={form.mood} onChange={(e) => setForm((p) => ({ ...p, mood: Number(e.target.value) }))} />
          <Slider label="Stress" value={form.stress} onChange={(e) => setForm((p) => ({ ...p, stress: Number(e.target.value) }))} />
          <Slider label="Energy" value={form.energy} onChange={(e) => setForm((p) => ({ ...p, energy: Number(e.target.value) }))} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-dusk-700 dark:text-dusk-200">Sleep (hours)</span>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={form.sleep_hours}
              onChange={(e) => setForm((p) => ({ ...p, sleep_hours: Number(e.target.value) }))}
              className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2 dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-dusk-700 dark:text-dusk-200">Note (optional)</span>
            <textarea
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2 dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-50"
              placeholder="Anything you'd like to note?"
            />
          </label>

          {status && (
            <p className={`text-sm ${status.type === "success" ? "text-sage-600" : "text-red-600"}`}>{status.message}</p>
          )}

          <button type="submit" className="w-full rounded-full bg-sage-500 py-2.5 font-medium text-white hover:bg-sage-600">
            Save check-in
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
            <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Your trends</h2>
            {chartData.length === 0 ? (
              <p className="mt-4 text-sm text-dusk-400">No entries yet — your first check-in will start the chart.</p>
            ) : (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f7" />
                    <XAxis dataKey="date" fontSize={12} stroke="#7086d1" />
                    <YAxis domain={[0, 10]} fontSize={12} stroke="#7086d1" />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#4d9163" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="stress" stroke="#5265ba" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="energy" stroke="#d6a75f" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
            <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Recent check-ins</h2>
            {isLoading ? (
              <p className="mt-4 text-sm text-dusk-400">Loading…</p>
            ) : records.length === 0 ? (
              <p className="mt-4 text-sm text-dusk-400">No check-ins yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {records.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-2xl bg-dusk-50 px-4 py-3 text-sm dark:bg-dusk-900">
                    <div>
                      <p className="font-medium text-dusk-700 dark:text-dusk-200">
                        {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-dusk-400">
                        Mood {r.mood} · Stress {r.stress} · Energy {r.energy}
                      </p>
                      {r.note && <p className="mt-1 text-dusk-500">{r.note}</p>}
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-dusk-400 hover:text-red-600">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

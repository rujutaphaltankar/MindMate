import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getInsights, getRecommendations } from "../../api/insights";
import AppShell from "../../components/AppShell";

function StatCard({ label, value, suffix }) {
  return (
    <div className="rounded-3xl border border-dusk-100 bg-white p-5 text-center shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
      <p className="text-2xl font-semibold text-dusk-800 dark:text-dusk-50">
        {value ?? "—"}
        {value != null && suffix}
      </p>
      <p className="mt-1 text-xs text-dusk-500 dark:text-dusk-300">{label}</p>
    </div>
  );
}

export default function Insights() {
  const [data, setData] = useState(null);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    getInsights().then(setData);
    getRecommendations().then(setRecs);
  }, []);

  if (!data) {
    return (
      <AppShell>
        <p className="text-dusk-400">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">My Insights</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        Non-clinical patterns from your own entries — never a diagnosis.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Avg mood (7d)" value={data.summary.avg_mood_week} suffix="/10" />
        <StatCard label="Avg stress (7d)" value={data.summary.avg_stress_week} suffix="/10" />
        <StatCard label="Avg energy (7d)" value={data.summary.avg_energy_week} suffix="/10" />
        <StatCard label="Activities (7d)" value={data.summary.activities_completed_week} suffix="" />
      </div>

      <div className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Trend over time</h2>
        {data.trend.length === 0 ? (
          <p className="mt-4 text-sm text-dusk-400">Log a few mood check-ins to see your trend.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
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

      {data.observations.length > 0 && (
        <div className="mt-6 space-y-3">
          {data.observations.map((obs, i) => (
            <p key={i} className="rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-800 dark:bg-dusk-800 dark:text-sage-300">
              {obs}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Suggestions for you</h2>
        <ul className="mt-3 space-y-2">
          {recs.map((r, i) => (
            <li key={i} className="rounded-2xl bg-dusk-50 px-4 py-3 text-sm dark:bg-dusk-900">
              <p className="font-medium text-dusk-800 dark:text-dusk-100">{r.title}</p>
              <p className="text-dusk-500 dark:text-dusk-300">{r.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

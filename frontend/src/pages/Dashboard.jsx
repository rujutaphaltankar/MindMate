import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMoodHistory } from "../api/mood";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const quickActions = [
  { to: "/journal", label: "Write Journal", icon: "📝" },
  { to: "/mood", label: "Record Mood", icon: "📊" },
  { to: "/companion", label: "Talk to MindMate", icon: "💬" },
  { to: "/toolkit", label: "Start Meditation", icon: "🧘" },
  { to: "/toolkit", label: "Breathing Exercise", icon: "🌬️" },
  { to: "/resources", label: "View Resources", icon: "🤝" },
];

function avg(values) {
  const filtered = values.filter((v) => v != null);
  return filtered.length ? Math.round((filtered.reduce((a, b) => a + b, 0) / filtered.length) * 10) / 10 : null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getMoodHistory(30).then(setRecords);
  }, []);

  const latest = records[0];
  const avgMood = avg(records.map((r) => r.mood));
  const avgStress = avg(records.map((r) => r.stress));
  const avgEnergy = avg(records.map((r) => r.energy));

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">
        Welcome{user?.name ? `, ${user.name}` : ""}.
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
          <p className="text-xs text-dusk-400">Current mood</p>
          <p className="mt-1 text-2xl font-semibold text-dusk-800 dark:text-dusk-50">{latest?.mood ?? "—"}/10</p>
        </div>
        <div className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
          <p className="text-xs text-dusk-400">Stress level</p>
          <p className="mt-1 text-2xl font-semibold text-dusk-800 dark:text-dusk-50">{latest?.stress ?? "—"}/10</p>
        </div>
        <div className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
          <p className="text-xs text-dusk-400">Energy level</p>
          <p className="mt-1 text-2xl font-semibold text-dusk-800 dark:text-dusk-50">{latest?.energy ?? "—"}/10</p>
        </div>
        <div className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
          <p className="text-xs text-dusk-400">Sleep last check-in</p>
          <p className="mt-1 text-2xl font-semibold text-dusk-800 dark:text-dusk-50">{latest?.sleep_hours ?? "—"}h</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Quick actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center gap-2 rounded-3xl border border-dusk-100 bg-white p-4 text-center shadow-soft transition hover:border-sage-300 dark:border-dusk-700 dark:bg-dusk-800"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-dusk-600 dark:text-dusk-300">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Wellness snapshot</h2>
        {records.length === 0 ? (
          <p className="mt-2 text-sm text-dusk-400">
            No check-ins yet — <Link to="/mood" className="text-sage-600 hover:underline">record your first mood</Link> to see your snapshot.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-semibold text-dusk-800 dark:text-dusk-50">{avgMood}</p>
              <p className="text-xs text-dusk-400">Average mood</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-dusk-800 dark:text-dusk-50">{avgStress}</p>
              <p className="text-xs text-dusk-400">Average stress</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-dusk-800 dark:text-dusk-50">{avgEnergy}</p>
              <p className="text-xs text-dusk-400">Average energy</p>
            </div>
          </div>
        )}
        <Link to="/insights" className="mt-4 inline-block text-sm text-sage-600 hover:underline">
          See full insights →
        </Link>
      </div>
    </AppShell>
  );
}

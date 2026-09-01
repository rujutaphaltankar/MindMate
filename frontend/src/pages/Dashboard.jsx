import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMoodHistory } from "../api/mood";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const quickActions = [
  {
    to: "/journal",
    label: "Write Journal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M12 20h9" strokeLinecap="round" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-dusk-500/20 to-dusk-600/10 dark:from-dusk-500/25 dark:to-dusk-600/15",
    iconColor: "text-dusk-700 dark:text-dusk-300",
  },
  {
    to: "/mood",
    label: "Record Mood",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M3 17l4-8 4 5 3-3 4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-sage-500/20 to-sage-600/10 dark:from-sage-500/25 dark:to-sage-600/15",
    iconColor: "text-sage-700 dark:text-sage-300",
  },
  {
    to: "/companion",
    label: "Talk to MindMate",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-purple-500/20 to-purple-700/10 dark:from-purple-500/25 dark:to-purple-700/15",
    iconColor: "text-purple-700 dark:text-purple-300",
  },
  {
    to: "/toolkit",
    label: "Meditate",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-sand-300/30 to-sand-400/20 dark:from-sand-300/20 dark:to-sand-400/10",
    iconColor: "text-sand-700 dark:text-sand-300",
  },
  {
    to: "/toolkit",
    label: "Breathe",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M12 2C8 2 6 6 6 10c0 5 6 12 6 12s6-7 6-12c0-4-2-8-6-8z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
    gradient: "from-cyan-500/20 to-cyan-700/10 dark:from-cyan-500/20 dark:to-cyan-700/10",
    iconColor: "text-cyan-700 dark:text-cyan-300",
  },
  {
    to: "/resources",
    label: "Get Help",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-red-500/20 to-red-700/10 dark:from-red-500/20 dark:to-red-700/10",
    iconColor: "text-red-700 dark:text-red-300",
  },
];

const statCards = [
  {
    key: "mood",
    label: "Current Mood",
    unit: "/10",
    gradient: "from-dusk-500/10 to-dusk-700/5 dark:from-dusk-500/20 dark:to-dusk-700/10",
    border: "border-dusk-500/20",
    dot: "bg-dusk-500 dark:bg-dusk-400",
    textColor: "text-dusk-800 dark:text-dusk-200",
  },
  {
    key: "stress",
    label: "Stress Level",
    unit: "/10",
    gradient: "from-amber-500/10 to-amber-700/5 dark:from-amber-500/20 dark:to-amber-700/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500 dark:bg-amber-400",
    textColor: "text-amber-800 dark:text-amber-200",
  },
  {
    key: "energy",
    label: "Energy Level",
    unit: "/10",
    gradient: "from-sage-500/10 to-sage-700/5 dark:from-sage-500/20 dark:to-sage-700/10",
    border: "border-sage-500/20",
    dot: "bg-sage-500 dark:bg-sage-400",
    textColor: "text-sage-800 dark:text-sage-200",
  },
  {
    key: "sleep_hours",
    label: "Sleep Last Check-in",
    unit: "h",
    gradient: "from-cyan-500/10 to-cyan-700/5 dark:from-cyan-500/15 dark:to-cyan-700/8",
    border: "border-cyan-500/20",
    dot: "bg-cyan-500 dark:bg-cyan-400",
    textColor: "text-cyan-800 dark:text-cyan-200",
  },
];

function avg(values) {
  const filtered = values.filter((v) => v != null);
  return filtered.length
    ? Math.round((filtered.reduce((a, b) => a + b, 0) / filtered.length) * 10) / 10
    : null;
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

  const statValues = {
    mood: latest?.mood,
    stress: latest?.stress,
    energy: latest?.energy,
    sleep_hours: latest?.sleep_hours,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppShell>
      {/* Header greeting */}
      <div className="mb-8 animate-fade-in-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-dusk-500 dark:text-dusk-400 mb-1">
          {greeting()}
        </p>
        <h1 className="font-display text-3xl text-dusk-900 dark:text-white">
          {user?.name ? `${user.name}.` : "Welcome."}
        </h1>
        <p className="mt-1 text-sm text-dusk-600 dark:text-dusk-400">Here's a snapshot of how you're doing.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const val = statValues[card.key];
          return (
            <div
              key={card.key}
              className={`relative overflow-hidden rounded-3xl border ${card.border} p-5 stagger-${i + 1}`}
              style={{ background: `linear-gradient(135deg, ${card.gradient.replace("from-", "").replace(" to-", ", ")})` }}
            >
              <div className={`inline-flex w-2 h-2 rounded-full ${card.dot} mb-3 opacity-80`} />
              <p className="text-xs font-medium text-dusk-600 dark:text-dusk-400 uppercase tracking-wider">{card.label}</p>
              <p className={`mt-1 font-display text-3xl font-semibold ${card.textColor}`}>
                {val != null ? val : "—"}
                <span className="text-base font-normal opacity-60">{val != null ? card.unit : ""}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="font-display text-lg text-dusk-900 dark:text-white mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((a, i) => (
            <Link
              key={a.label}
              to={a.to}
              className={`card-glass flex flex-col items-center gap-3 p-4 text-center stagger-${i + 1}`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br ${a.gradient} ${a.iconColor}`}>
                {a.icon}
              </div>
              <span className="text-xs font-medium text-dusk-700 dark:text-dusk-300">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Wellness snapshot */}
      <div className="mt-8 card-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-dusk-900 dark:text-white">Wellness snapshot</h2>
          <Link to="/insights" className="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors font-medium">
            Full insights →
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-dusk-500 mb-3">No check-ins yet.</p>
            <Link
              to="/mood"
              className="btn-sage px-5 py-2 text-sm inline-block"
            >
              Record your first mood
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Avg mood", value: avgMood, color: "text-dusk-800 dark:text-dusk-200" },
              { label: "Avg stress", value: avgStress, color: "text-amber-800 dark:text-amber-200" },
              { label: "Avg energy", value: avgEnergy, color: "text-sage-800 dark:text-sage-200" },
            ].map((item) => (
              <div key={item.label} className="py-3 rounded-2xl bg-dusk-100/40 dark:bg-white/3 border border-dusk-200/50 dark:border-white/6">
                <p className={`font-display text-2xl font-semibold ${item.color}`}>{item.value ?? "—"}</p>
                <p className="text-xs text-dusk-500 dark:text-dusk-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

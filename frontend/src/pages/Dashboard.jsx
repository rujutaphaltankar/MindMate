import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMoodHistory } from "../api/mood";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const quickActions = [
  {
    to: "/journal",
    label: "Write Journal",
    subtext: "Express your thoughts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 20h9" strokeLinecap="round" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-dusk-500/20 to-dusk-600/10 dark:from-dusk-500/30 dark:to-dusk-600/15",
    iconColor: "text-dusk-700 dark:text-dusk-300",
  },
  {
    to: "/mood",
    label: "Record Mood",
    subtext: "Log daily feelings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 17l4-8 4 5 3-3 4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-sage-500/20 to-sage-600/10 dark:from-sage-500/30 dark:to-sage-600/15",
    iconColor: "text-sage-700 dark:text-sage-300",
  },
  {
    to: "/companion",
    label: "AI Companion",
    subtext: "Talk & reflect safely",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-purple-500/20 to-purple-700/10 dark:from-purple-500/30 dark:to-purple-700/15",
    iconColor: "text-purple-700 dark:text-purple-300",
  },
  {
    to: "/toolkit",
    label: "Meditate",
    subtext: "Guided sessions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-amber-500/20 to-amber-600/10 dark:from-amber-500/30 dark:to-amber-600/15",
    iconColor: "text-amber-700 dark:text-amber-300",
  },
  {
    to: "/toolkit",
    label: "Breathe",
    subtext: "4-7-8 exercise",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 2C8 2 6 6 6 10c0 5 6 12 6 12s6-7 6-12c0-4-2-8-6-8z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
    gradient: "from-cyan-500/20 to-cyan-700/10 dark:from-cyan-500/30 dark:to-cyan-700/15",
    iconColor: "text-cyan-700 dark:text-cyan-300",
  },
  {
    to: "/resources",
    label: "Get Help",
    subtext: "24/7 Crisis support",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-rose-500/20 to-rose-700/10 dark:from-rose-500/30 dark:to-rose-700/15",
    iconColor: "text-rose-700 dark:text-rose-300",
  },
];

const statCards = [
  {
    key: "mood",
    label: "Latest Mood",
    unit: "/10",
    icon: "🌿",
    gradient: "from-sage-500/15 to-sage-700/5 dark:from-sage-500/25 dark:to-sage-700/10",
    dot: "bg-sage-500 dark:bg-sage-400",
    textColor: "text-sage-800 dark:text-sage-200",
  },
  {
    key: "stress",
    label: "Stress Level",
    unit: "/10",
    icon: "🌊",
    gradient: "from-amber-500/15 to-amber-700/5 dark:from-amber-500/25 dark:to-amber-700/10",
    dot: "bg-amber-500 dark:bg-amber-400",
    textColor: "text-amber-800 dark:text-amber-200",
  },
  {
    key: "energy",
    label: "Energy Level",
    unit: "/10",
    icon: "⚡",
    gradient: "from-dusk-500/15 to-dusk-700/5 dark:from-dusk-500/25 dark:to-dusk-700/10",
    dot: "bg-dusk-500 dark:bg-dusk-400",
    textColor: "text-dusk-800 dark:text-dusk-200",
  },
  {
    key: "sleep_hours",
    label: "Sleep Logged",
    unit: "h",
    icon: "🌙",
    gradient: "from-cyan-500/15 to-cyan-700/5 dark:from-cyan-500/25 dark:to-cyan-700/10",
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
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Greeting Banner */}
        <div className="card-glass relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sage-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-dusk-500/15 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-block rounded-full bg-sage-500/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-sage-700 dark:bg-sage-500/25 dark:text-sage-300 mb-2">
                {greeting()}
              </span>
              <h1 className="font-display text-3xl font-bold text-dusk-900 dark:text-white sm:text-4xl">
                {user?.name ? `${user.name}.` : "Welcome back."}
              </h1>
              <p className="mt-1.5 text-sm text-dusk-600 dark:text-dusk-300">
                Take a moment to check in with yourself today. Here is your wellness snapshot.
              </p>
            </div>

            <Link
              to="/mood"
              className="btn-sage shrink-0 flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold shadow-md transition-all hover:scale-105"
            >
              <span>✨</span> Record Today's Mood
            </Link>
          </div>
        </div>

        {/* Metric KPI Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const val = statValues[card.key];
            return (
              <div
                key={card.key}
                className={`card-glass relative overflow-hidden p-5 transition-all hover:scale-[1.02] stagger-${i + 1}`}
              >
                <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} blur-2xl pointer-events-none`} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${card.dot}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-dusk-500 dark:text-dusk-400">
                      {card.label}
                    </span>
                  </div>
                  <span className="text-lg">{card.icon}</span>
                </div>

                <p className={`mt-3 font-display text-3xl font-bold ${card.textColor}`}>
                  {val != null ? val : "—"}
                  {val != null && <span className="text-sm font-normal opacity-60 ml-0.5">{card.unit}</span>}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-dusk-900 dark:text-white">
              Quick Actions
            </h2>
            <span className="text-xs text-dusk-400">Instant Access</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((a, i) => (
              <Link
                key={a.label}
                to={a.to}
                className={`card-glass flex flex-col items-center gap-2.5 p-4 text-center transition-all hover:scale-[1.03] stagger-${i + 1}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${a.gradient} ${a.iconColor}`}>
                  {a.icon}
                </div>
                <div>
                  <span className="block font-display text-xs font-semibold text-dusk-800 dark:text-dusk-100">
                    {a.label}
                  </span>
                  <span className="block text-[10px] text-dusk-400 dark:text-dusk-400 mt-0.5">
                    {a.subtext}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Wellness Snapshot & Trends Preview */}
        <div className="card-glass p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-dusk-900 dark:text-white">
                Recent Averages
              </h2>
              <p className="text-xs text-dusk-500 dark:text-dusk-400 mt-0.5">
                Aggregate stats over your last {records.length} logged check-ins.
              </p>
            </div>
            <Link
              to="/insights"
              className="text-xs font-semibold text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 transition-colors flex items-center gap-1"
            >
              Full Analytics →
            </Link>
          </div>

          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-2">🌿</span>
              <p className="text-sm font-medium text-dusk-500 dark:text-dusk-400">
                No check-ins recorded yet.
              </p>
              <Link to="/mood" className="btn-sage mt-3 px-5 py-2 text-xs font-semibold">
                Record your first mood
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Avg Mood", value: avgMood, unit: "/10", icon: "🌿", color: "text-sage-700 dark:text-sage-300" },
                { label: "Avg Stress", value: avgStress, unit: "/10", icon: "🌊", color: "text-amber-700 dark:text-amber-300" },
                { label: "Avg Energy", value: avgEnergy, unit: "/10", icon: "⚡", color: "text-dusk-700 dark:text-dusk-300" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-dusk-50/70 p-4 border border-dusk-100 dark:bg-dusk-900/60 dark:border-dusk-800"
                >
                  <span className="text-sm">{item.icon}</span>
                  <p className={`mt-1 font-display text-2xl font-bold ${item.color}`}>
                    {item.value ?? "—"}
                    {item.value != null && <span className="text-xs font-normal opacity-60">{item.unit}</span>}
                  </p>
                  <p className="mt-1 text-xs text-dusk-500 dark:text-dusk-400">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

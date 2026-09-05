import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getInsights, getRecommendations } from "../../api/insights";
import AppShell from "../../components/AppShell";

function StatCard({ label, value, suffix, icon, gradient, color }) {
  return (
    <div className={`card-glass relative overflow-hidden p-5 transition-all hover:scale-[1.02]`}>
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${gradient} blur-2xl pointer-events-none`} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-dusk-500 dark:text-dusk-400">
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`mt-2 font-display text-3xl font-bold ${color}`}>
        {value ?? "—"}
        {value != null && <span className="text-sm font-normal text-dusk-400">{suffix}</span>}
      </p>
    </div>
  );
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-dusk-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-dusk-700 dark:bg-dusk-800/95">
        <p className="text-xs font-semibold text-dusk-600 dark:text-dusk-300 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium capitalize" style={{ color: entry.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-display font-bold text-dusk-900 dark:text-white">
                {entry.value} / 10
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function Insights() {
  const [data, setData] = useState(null);
  const [recs, setRecs] = useState([]);
  const [activeSeries, setActiveSeries] = useState({ mood: true, stress: true, energy: true });

  useEffect(() => {
    getInsights().then(setData);
    getRecommendations().then(setRecs);
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-dusk-400 animate-pulse">Loading non-clinical insights…</p>
        </div>
      </AppShell>
    );
  }

  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Get action link for recommendations
  const getActionForRec = (title) => {
    const t = title.toLowerCase();
    if (t.includes("breath") || t.includes("meditat") || t.includes("relax")) {
      return { label: "Open Toolkit", to: "/toolkit" };
    }
    if (t.includes("journal") || t.includes("reflect") || t.includes("write")) {
      return { label: "Write Journal", to: "/journal" };
    }
    if (t.includes("companion") || t.includes("chat") || t.includes("talk")) {
      return { label: "Talk to AI", to: "/companion" };
    }
    return { label: "Log Mood", to: "/mood" };
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in-up">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-dusk-900 dark:text-white">Wellness Insights</h1>
            <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">
              Non-clinical patterns observed from your logged check-ins — for self-reflection only.
            </p>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-sage-500/10 px-4 py-2 text-xs font-semibold text-sage-700 dark:bg-sage-500/20 dark:text-sage-300">
            <span>🔒 Confidential & Privacy Gated</span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Avg Mood (7d)"
            value={data.summary.avg_mood_week}
            suffix="/10"
            icon="🌿"
            gradient="bg-indigo-500/20"
            color="text-indigo-700 dark:text-indigo-300"
          />
          <StatCard
            label="Avg Stress (7d)"
            value={data.summary.avg_stress_week}
            suffix="/10"
            icon="🌊"
            gradient="bg-dusk-500/20"
            color="text-dusk-700 dark:text-dusk-300"
          />
          <StatCard
            label="Avg Energy (7d)"
            value={data.summary.avg_energy_week}
            suffix="/10"
            icon="⚡"
            gradient="bg-amber-500/20"
            color="text-amber-700 dark:text-amber-300"
          />
          <StatCard
            label="Activities Done"
            value={data.summary.activities_completed_week}
            suffix=" sessions"
            icon="🧘"
            gradient="bg-purple-500/20"
            color="text-purple-700 dark:text-purple-300"
          />
        </div>

        {/* Enhanced Trend Chart Box */}
        <div className="card-glass p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-dusk-900 dark:text-white">
                Wellness Trends
              </h2>
              <p className="text-xs text-dusk-500 dark:text-dusk-400 mt-0.5">
                Comparative trajectory of mood, stress, and energy levels.
              </p>
            </div>

            {/* Toggle series pills */}
            <div className="flex items-center gap-2">
              {[
                { key: "mood", label: "Mood", color: "#6366f1" },
                { key: "stress", label: "Stress", color: "#5265ba" },
                { key: "energy", label: "Energy", color: "#d6a75f" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    activeSeries[s.key]
                      ? "bg-dusk-100 dark:bg-dusk-700 text-dusk-900 dark:text-white shadow-xs"
                      : "opacity-40"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {data.trend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-sm font-medium text-dusk-500 dark:text-dusk-400">
                Log a few daily check-ins to unlock your personalized trend graph.
              </p>
              <Link to="/mood" className="btn-sage mt-4 px-5 py-2 text-xs font-semibold">
                Record Today's Mood
              </Link>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5265ba" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5265ba" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d6a75f" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#d6a75f" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f7" opacity={0.4} />
                  <XAxis dataKey="date" fontSize={11} stroke="#7086d1" tickLine={false} />
                  <YAxis domain={[0, 10]} fontSize={11} stroke="#7086d1" tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {activeSeries.mood && (
                    <Area
                      type="monotone"
                      dataKey="mood"
                      name="Mood"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorMood)"
                    />
                  )}
                  {activeSeries.stress && (
                    <Area
                      type="monotone"
                      dataKey="stress"
                      name="Stress"
                      stroke="#5265ba"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorStress)"
                    />
                  )}
                  {activeSeries.energy && (
                    <Area
                      type="monotone"
                      dataKey="energy"
                      name="Energy"
                      stroke="#d6a75f"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorEnergy)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AI Non-clinical Observations */}
        {data.observations.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-dusk-900 dark:text-white">
              Observed Patterns
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.observations.map((obs, i) => (
                <div
                  key={i}
                  className="card-glass flex items-start gap-3.5 p-4 border-l-4 border-l-indigo-500 dark:border-l-indigo-400"
                >
                  <span className="text-lg shrink-0">💡</span>
                  <p className="text-xs leading-relaxed text-dusk-700 dark:text-dusk-200">
                    {obs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Recommendations Section */}
        <div className="card-glass p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-dusk-900 dark:text-white">
            Tailored Wellness Suggestions
          </h2>
          <p className="mt-0.5 text-xs text-dusk-500 dark:text-dusk-400 mb-6">
            Small, non-clinical practices recommended based on your recent check-in patterns.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {recs.map((r, i) => {
              const action = getActionForRec(r.title);
              return (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl bg-dusk-50/70 p-5 border border-dusk-100 dark:bg-dusk-900/60 dark:border-dusk-800"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold text-dusk-900 dark:text-white">
                        {r.title}
                      </h4>
                      <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        Suggested
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-dusk-600 dark:text-dusk-300">
                      {r.reason}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dusk-200/50 dark:border-dusk-800 flex justify-end">
                    <Link
                      to={action.to}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      {action.label} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

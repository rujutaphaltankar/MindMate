import { useEffect, useState } from "react";

import { completeActivity, getWellnessCatalog } from "../../api/wellness";
import AppShell from "../../components/AppShell";
import BreathingExercise from "./BreathingExercise";
import MeditationTimer from "./MeditationTimer";

export default function Toolkit() {
  const [activities, setActivities] = useState([]);
  const [activeBreathing, setActiveBreathing] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");

  useEffect(() => {
    getWellnessCatalog().then(setActivities);
  }, []);

  async function markComplete(activity) {
    try {
      await completeActivity(activity.id, activity.duration_minutes);
      setCompletedIds((prev) => (prev.includes(activity.id) ? prev : [...prev, activity.id]));
    } catch (e) {
      console.error("Error saving completed activity:", e);
    }
  }

  // Filter activities based on tab, search query, and duration
  const filteredActivities = activities.filter((activity) => {
    // Search query
    if (searchQuery.trim() && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category Tabs
    if (activeTab === "breathing" && activity.type !== "breathing") return false;
    if (activeTab === "quick" && (activity.duration_minutes > 3 || activity.type === "breathing")) return false;
    if (activeTab === "deep" && (activity.duration_minutes <= 3 || activity.duration_minutes > 8)) return false;
    if (activeTab === "sleep" && activity.duration_minutes < 10) return false;

    // Duration filter dropdown
    if (durationFilter === "short" && activity.duration_minutes > 3) return false;
    if (durationFilter === "medium" && (activity.duration_minutes < 4 || activity.duration_minutes > 8)) return false;
    if (durationFilter === "long" && activity.duration_minutes < 10) return false;

    return true;
  });

  const getIconForActivity = (activity) => {
    if (activity.type === "breathing") return "🌬️";
    if (activity.id.includes("sleep")) return "🌙";
    if (activity.id.includes("focus")) return "🎯";
    if (activity.id.includes("relax")) return "🌿";
    return "🧘";
  };

  const getTagline = (activity) => {
    if (activity.type === "breathing") return "Rhythmic 4-7-8 breathing to quickly ease anxiety and tension.";
    if (activity.id.includes("2min")) return "Quick 120-second grounding technique for immediate pause.";
    if (activity.id.includes("5min")) return "Gentle guided session to restore emotional balance.";
    if (activity.id.includes("focus")) return "Clear mental clutter and sharpen deep concentration.";
    if (activity.id.includes("relax")) return "Unwind body & mind after a long or stressful day.";
    if (activity.id.includes("sleep")) return "Calming bedtime mindfulness for restful sleep.";
    if (activity.id.includes("mindfulness")) return "Check in with your body and present moment awareness.";
    return "Guided mindfulness exercise.";
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-dusk-900 dark:text-white">Wellness Toolkit</h1>
            <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">
              Curated mindfulness practices, breathing resets, and guided meditations.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-sage-500/10 px-4 py-2 text-xs font-semibold text-sage-700 dark:bg-sage-500/20 dark:text-sage-300">
            <span>✨ Sessions Completed: {completedIds.length}</span>
          </div>
        </div>

        {/* Active Session Overlay Modal / View */}
        {selectedMeditation ? (
          <div className="card-glass p-6 sm:p-8 animate-fade-in">
            <MeditationTimer
              activity={selectedMeditation}
              onComplete={(activity) => markComplete(activity)}
              onClose={() => setSelectedMeditation(null)}
            />
          </div>
        ) : activeBreathing ? (
          <div className="card-glass p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-dusk-900 dark:text-white">
                4-7-8 Breathing Exercise
              </h2>
              <button
                onClick={() => setActiveBreathing(false)}
                className="btn-ghost px-3 py-1 text-xs"
              >
                Close Exercise ✕
              </button>
            </div>
            <BreathingExercise
              onFinish={() => {
                setActiveBreathing(false);
                const activity = activities.find((a) => a.id === "breathing-478");
                if (activity) markComplete(activity);
              }}
            />
          </div>
        ) : (
          <>
            {/* Daily Recommended Hero Practice */}
            <div className="card-glass relative overflow-hidden p-6 sm:p-8">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sage-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-dusk-500/15 blur-3xl pointer-events-none" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl space-y-2">
                  <span className="inline-block rounded-full bg-sage-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sage-700 dark:bg-sage-500/25 dark:text-sage-300">
                    Recommended Daily Practice
                  </span>
                  <h2 className="font-display text-2xl font-bold text-dusk-900 dark:text-white">
                    4-7-8 Deep Breathing Reset
                  </h2>
                  <p className="text-sm text-dusk-600 dark:text-dusk-300">
                    Inhale for 4 seconds, hold for 7, and exhale slowly for 8. scientifically proven to lower heart rate and reduce stress within minutes.
                  </p>
                </div>

                <button
                  onClick={() => setActiveBreathing(true)}
                  className="btn-sage shrink-0 flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold shadow-md transition-all hover:scale-105"
                >
                  <span>🌬️</span> Start 4-7-8 Breathing
                </button>
              </div>
            </div>

            {/* Organized Filter & Category Section */}
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 rounded-2xl bg-dusk-100/60 p-1.5 dark:bg-dusk-900/60 border border-dusk-200/50 dark:border-dusk-800">
                  {[
                    { id: "all", label: "All Sessions" },
                    { id: "breathing", label: "Breathing" },
                    { id: "quick", label: "Quick (1-3m)" },
                    { id: "deep", label: "Focus & Calm (5-8m)" },
                    { id: "sleep", label: "Sleep & Relax (10m+)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        activeTab === tab.id
                          ? "bg-white text-dusk-900 shadow-sm dark:bg-dusk-700 dark:text-white"
                          : "text-dusk-500 hover:text-dusk-800 dark:text-dusk-400 dark:hover:text-dusk-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search & Duration Dropdown */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-48">
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-dusk-200/80 bg-white/80 px-3 py-1.5 text-xs text-dusk-800 outline-none transition-all focus:border-sage-500 dark:border-dusk-700 dark:bg-dusk-800/80 dark:text-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-dusk-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="rounded-xl border border-dusk-200/80 bg-white/80 px-3 py-1.5 text-xs text-dusk-800 outline-none dark:border-dusk-700 dark:bg-dusk-800/80 dark:text-white"
                  >
                    <option value="all">Any Duration</option>
                    <option value="short">≤ 3 mins</option>
                    <option value="medium">4 – 8 mins</option>
                    <option value="long">10+ mins</option>
                  </select>
                </div>
              </div>

              {/* Sessions Grid */}
              {filteredActivities.length === 0 ? (
                <div className="card-glass py-12 text-center">
                  <p className="text-sm font-medium text-dusk-500 dark:text-dusk-400">
                    No practices match your selected filter.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("all");
                      setSearchQuery("");
                      setDurationFilter("all");
                    }}
                    className="mt-3 text-xs font-semibold text-sage-600 dark:text-sage-400 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredActivities.map((item) => {
                    const isDone = completedIds.includes(item.id);
                    const icon = getIconForActivity(item);
                    const tagline = getTagline(item);

                    return (
                      <div
                        key={item.id}
                        className="card-glass flex flex-col justify-between p-5 transition-all hover:scale-[1.02]"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dusk-100/80 text-xl dark:bg-dusk-800/80">
                              {icon}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isDone && (
                                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                  Done ✓
                                </span>
                              )}
                              <span className="rounded-full bg-dusk-100/60 px-2.5 py-0.5 text-[11px] font-medium text-dusk-600 dark:bg-dusk-800 dark:text-dusk-300">
                                ⏱️ {item.duration_minutes} min
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-display font-semibold text-dusk-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-xs text-dusk-500 dark:text-dusk-400 line-clamp-2">
                              {tagline}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4">
                          {item.type === "breathing" ? (
                            <button
                              onClick={() => setActiveBreathing(true)}
                              className="btn-sage w-full py-2 text-xs font-semibold shadow-sm hover:shadow"
                            >
                              Start Breathing
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedMeditation(item)}
                              className="btn-sage w-full py-2 text-xs font-semibold shadow-sm hover:shadow"
                            >
                              Start Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

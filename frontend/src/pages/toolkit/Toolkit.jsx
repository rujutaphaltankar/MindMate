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

  const meditations = activities.filter((a) => a.type === "meditation");

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Wellness Toolkit</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        Guided exercises designed to help you relax, focus, and reset.
      </p>

      {/* Active Meditation View */}
      {selectedMeditation ? (
        <div className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
          <MeditationTimer
            activity={selectedMeditation}
            onComplete={(activity) => markComplete(activity)}
            onClose={() => setSelectedMeditation(null)}
          />
        </div>
      ) : (
        <>
          {/* Breathing Exercise Card */}
          <div className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
            <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Breathing exercise</h2>
            <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">4-7-8 breathing — inhale, hold, exhale.</p>
            {activeBreathing ? (
              <BreathingExercise
                onFinish={() => {
                  setActiveBreathing(false);
                  const activity = activities.find((a) => a.id === "breathing-478");
                  if (activity) markComplete(activity);
                }}
              />
            ) : (
              <button
                onClick={() => setActiveBreathing(true)}
                className="mt-4 rounded-full bg-sage-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sage-600 transition-all"
              >
                Start breathing exercise
              </button>
            )}
          </div>

          {/* Meditation Sessions Grid */}
          <div className="mt-6">
            <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Guided Meditation Sessions</h2>
            <p className="mt-0.5 text-xs text-dusk-400">
              Select a session to start the guided timer countdown.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meditations.map((m) => {
                const isDone = completedIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-medium text-dusk-800 dark:text-dusk-50">
                          {m.title}
                        </h3>
                        {isDone && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Completed ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-dusk-500 dark:text-dusk-300">
                        ⏱️ {m.duration_minutes} minutes
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMeditation(m)}
                      className="mt-5 w-full rounded-full bg-sage-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sage-700 transition-all"
                    >
                      Start Meditation
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}


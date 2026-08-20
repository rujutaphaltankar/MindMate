import { useEffect, useState } from "react";

import { completeActivity, getWellnessCatalog } from "../../api/wellness";
import AppShell from "../../components/AppShell";
import BreathingExercise from "./BreathingExercise";

export default function Toolkit() {
  const [activities, setActivities] = useState([]);
  const [activeBreathing, setActiveBreathing] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    getWellnessCatalog().then(setActivities);
  }, []);

  async function markComplete(activity) {
    await completeActivity(activity.id, activity.duration_minutes);
    setCompletedIds((prev) => [...prev, activity.id]);
  }

  const meditations = activities.filter((a) => a.type === "meditation");

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Wellness Toolkit</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        Short, practical exercises you can actually finish.
      </p>

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
            className="mt-4 rounded-full bg-sage-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-600"
          >
            Start breathing exercise
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Meditation</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meditations.map((m) => (
            <div key={m.id} className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
              <h3 className="font-display text-dusk-800 dark:text-dusk-50">{m.title}</h3>
              <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">{m.duration_minutes} minutes</p>
              <button
                onClick={() => markComplete(m)}
                disabled={completedIds.includes(m.id)}
                className="mt-4 w-full rounded-full bg-dusk-100 py-2 text-sm font-medium text-dusk-700 hover:bg-dusk-200 disabled:opacity-50 dark:bg-dusk-700 dark:text-dusk-200"
              >
                {completedIds.includes(m.id) ? "Completed ✓" : "Mark as completed"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

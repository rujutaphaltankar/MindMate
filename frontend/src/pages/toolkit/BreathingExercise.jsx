import { useEffect, useState } from "react";

// 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s, repeated 4 times.
const PHASES = [
  { label: "Inhale", seconds: 4, scale: "scale-100" },
  { label: "Hold", seconds: 7, scale: "scale-100" },
  { label: "Exhale", seconds: 8, scale: "scale-50" },
];
const TOTAL_CYCLES = 4;

export default function BreathingExercise({ onFinish }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);

  useEffect(() => {
    if (cycle > TOTAL_CYCLES) {
      onFinish();
      return;
    }
    if (secondsLeft <= 0) {
      const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
      if (nextPhaseIndex === 0) setCycle((c) => c + 1);
      setPhaseIndex(nextPhaseIndex);
      setSecondsLeft(PHASES[nextPhaseIndex].seconds);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phaseIndex, cycle]);

  const phase = PHASES[phaseIndex];
  const isExhale = phase.label === "Exhale";

  return (
    <div className="mt-6 flex flex-col items-center">
      <div
        className={`flex h-40 w-40 items-center justify-center rounded-full bg-sage-200 text-sage-800 transition-transform duration-[1000ms] ease-in-out dark:bg-sage-600 dark:text-sage-50 ${
          isExhale ? "scale-75" : "scale-100"
        }`}
      >
        <div className="text-center">
          <p className="font-display text-lg">{phase.label}</p>
          <p className="text-2xl font-semibold">{secondsLeft}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-dusk-500 dark:text-dusk-300">
        Cycle {Math.min(cycle, TOTAL_CYCLES)} of {TOTAL_CYCLES}
      </p>
      <button onClick={onFinish} className="mt-3 text-xs text-dusk-400 hover:text-dusk-700">
        Stop
      </button>
    </div>
  );
}

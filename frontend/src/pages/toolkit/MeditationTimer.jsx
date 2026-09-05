import { useEffect, useState } from "react";

const GUIDANCE_QUOTES = [
  "Take a deep, gentle breath in... and let it out softly.",
  "Allow your shoulders to drop and release any tension.",
  "Notice your breath without trying to change it.",
  "If your mind wanders, gently bring your focus back to the present.",
  "Feel the weight of your body resting comfortably.",
  "You are safe, calm, and grounded in this moment.",
];

export default function MeditationTimer({ activity, onComplete, onClose }) {
  // Convert minutes to seconds (or allow demo 15-second mode for testing)
  const fullDurationSeconds = Math.max(30, (activity.duration_minutes || 5) * 60);
  const [secondsLeft, setSecondsLeft] = useState(fullDurationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Timer interval hook
  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      if (onComplete) {
        onComplete(activity);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft, activity, onComplete]);

  // Rotate guidance prompt every 15 seconds while running
  useEffect(() => {
    if (!isRunning) return;
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % GUIDANCE_QUOTES.length);
    }, 15000);
    return () => clearInterval(quoteInterval);
  }, [isRunning]);

  // Format MM:SS
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Progress percentage for visual ring
  const progressPercent = Math.min(
    100,
    Math.max(0, ((fullDurationSeconds - secondsLeft) / fullDurationSeconds) * 100)
  );

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(fullDurationSeconds);
    setIsFinished(false);
  };

  const handleQuickDemo = () => {
    setIsRunning(false);
    setSecondsLeft(10);
    setIsFinished(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="text-xs font-medium text-dusk-500 hover:text-dusk-800 dark:text-dusk-400 dark:hover:text-dusk-200"
        >
          ← Back to Toolkit
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
          Guided Session
        </span>
      </div>

      <h2 className="font-display text-2xl font-semibold text-dusk-900 dark:text-dusk-50">
        {activity.title}
      </h2>
      <p className="mt-1 text-xs text-dusk-500 dark:text-dusk-400">
        Target Duration: {activity.duration_minutes} minutes
      </p>

      {/* Completion View */}
      {isFinished ? (
        <div className="my-8 flex flex-col items-center rounded-3xl border border-indigo-200 bg-indigo-50/70 p-8 text-center shadow-soft dark:border-indigo-800 dark:bg-indigo-950/30 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-md mb-4 animate-bounce">
            ✓
          </div>
          <h3 className="font-display text-xl font-medium text-dusk-900 dark:text-dusk-50">
            Meditation Completed! ✨
          </h3>
          <p className="mt-2 text-sm text-dusk-600 dark:text-dusk-300">
            Great job taking time out of your day to nurture your mind. This session has been saved to your wellness history.
          </p>
          <button
            onClick={onClose}
            className="btn-sage mt-6 px-6 py-2.5 text-sm font-semibold shadow-sm hover:shadow"
          >
            Done & Return
          </button>
        </div>
      ) : (
        <>
          {/* Circular Visualizer & Timer */}
          <div className="relative my-8 flex h-60 w-60 items-center justify-center">
            {/* Pulsing ambient background glow when running */}
            <div
              className={`absolute inset-0 rounded-full bg-indigo-400/30 dark:bg-indigo-600/20 transition-all duration-1000 ${
                isRunning ? "animate-ping opacity-30 scale-105" : "opacity-0"
              }`}
            />

            {/* SVG Progress Circle */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-dusk-100 dark:stroke-dusk-700"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-indigo-500 transition-all duration-1000 ease-linear dark:stroke-indigo-400"
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Timer Digits */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-4xl font-bold tracking-tight text-dusk-900 dark:text-dusk-50">
                {formatTime(secondsLeft)}
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-dusk-400">
                {isRunning ? "In Session..." : secondsLeft === fullDurationSeconds ? "Ready to start" : "Paused"}
              </span>
            </div>
          </div>

          {/* Dynamic Guidance Quote */}
          <div className="min-h-[48px] max-w-sm px-4 text-center">
            <p className="text-sm italic text-dusk-600 dark:text-dusk-300 transition-all duration-500">
              "{GUIDANCE_QUOTES[quoteIndex]}"
            </p>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="btn-sage px-8 py-3 text-sm font-semibold shadow-sm hover:shadow"
              >
                {secondsLeft === fullDurationSeconds ? "Start Meditation" : "Resume"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="rounded-full bg-dusk-800 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-dusk-900 transition-all dark:bg-dusk-700 dark:hover:bg-dusk-600"
              >
                Pause
              </button>
            )}

            <button
              onClick={handleReset}
              className="rounded-full border border-dusk-200 px-5 py-3 text-sm font-medium text-dusk-600 hover:bg-dusk-50 dark:border-dusk-700 dark:text-dusk-300 dark:hover:bg-dusk-900"
            >
              Reset
            </button>
          </div>

          {/* Quick Demo Helper for easy testing */}
          <button
            onClick={handleQuickDemo}
            className="mt-6 text-[11px] text-dusk-400 hover:underline"
          >
            ⚡ Test with 10-second demo timer
          </button>
        </>
      )}
    </div>
  );
}

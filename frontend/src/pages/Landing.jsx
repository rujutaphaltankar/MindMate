import { Link } from "react-router-dom";

const pillars = [
  { title: "Track", copy: "Log mood, stress, and energy in a few taps — see your own patterns over time." },
  { title: "Journal", copy: "A private space for your thoughts, searchable and yours alone." },
  { title: "Reflect", copy: "Gentle, non-clinical AI reflections on what you write — never a diagnosis." },
  { title: "Practice", copy: "Short breathing and meditation exercises you can actually finish." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dusk-50 via-dusk-50 to-sage-50 dark:from-dusk-900 dark:via-dusk-900 dark:to-dusk-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-semibold text-dusk-800 dark:text-dusk-50">
          MindMate <span className="text-sage-500">AI</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-dusk-700 hover:text-dusk-900 dark:text-dusk-200"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-dusk-800 px-5 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-dusk-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-12 text-center">
        <h1 className="font-display text-4xl leading-tight text-dusk-900 dark:text-dusk-50 sm:text-5xl">
          A quiet place to check in with yourself.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-dusk-600 dark:text-dusk-300">
          MindMate AI helps you notice patterns in your mood, keep a private journal, and build
          small daily habits that support your wellbeing.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="rounded-full bg-sage-500 px-7 py-3 font-medium text-white shadow-soft transition hover:bg-sage-600"
          >
            Create your free account
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-dusk-200 px-7 py-3 font-medium text-dusk-700 transition hover:border-dusk-400 dark:border-dusk-700 dark:text-dusk-200"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-dusk-100 bg-white/70 p-6 text-left shadow-soft backdrop-blur dark:border-dusk-700 dark:bg-dusk-800/60"
            >
              <h3 className="font-display text-lg text-dusk-800 dark:text-dusk-50">{p.title}</h3>
              <p className="mt-2 text-sm text-dusk-600 dark:text-dusk-300">{p.copy}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-16 max-w-xl text-xs leading-relaxed text-dusk-400 dark:text-dusk-500">
          MindMate AI is a wellness companion, not a medical device, therapist, or emergency
          service. It does not diagnose conditions or provide treatment. If you are in crisis or
          in danger, please contact local emergency services or a crisis line in your area.
        </p>
      </main>
    </div>
  );
}

import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Track",
    copy: "Log mood, stress, and energy in a few taps — see your own patterns over time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M3 17l4-8 4 5 3-3 4 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21H3" strokeLinecap="round" />
      </svg>
    ),
    color: "from-dusk-500/30 to-dusk-600/20",
    iconColor: "text-dusk-300",
  },
  {
    title: "Journal",
    copy: "A private space for your thoughts, searchable and yours alone.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M12 20h9" strokeLinecap="round" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "from-sage-500/30 to-sage-600/20",
    iconColor: "text-sage-300",
  },
  {
    title: "Reflect",
    copy: "Gentle, non-clinical AI reflections on what you write — never a diagnosis.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "from-purple-500/25 to-purple-700/15",
    iconColor: "text-purple-300",
  },
  {
    title: "Practice",
    copy: "Short breathing and meditation exercises you can actually finish.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M12 2C8 2 6 6 6 10c0 5 6 12 6 12s6-7 6-12c0-4-2-8-6-8z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
    color: "from-sand-300/20 to-sand-400/10",
    iconColor: "text-sand-300",
  },
];

const stats = [
  { value: "10k+", label: "Daily check-ins" },
  { value: "100%", label: "Private by design" },
  { value: "0", label: "Data sold" },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero">
      {/* Animated background orbs */}
      <div
        className="orb w-[520px] h-[520px] bg-dusk-500/18 top-[-180px] left-[-120px] animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="orb w-[400px] h-[400px] bg-sage-500/14 top-[60px] right-[-100px] animate-float-slow"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="orb w-[300px] h-[300px] bg-purple-600/12 bottom-[100px] left-[30%] animate-float-slower"
        style={{ animationDelay: "-6s" }}
      />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-semibold text-white">
          MindMate <span className="text-gradient-sage">AI</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="btn-ghost px-5 py-2 text-sm"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="btn-sage px-5 py-2 text-sm animate-pulse-glow"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/25 bg-sage-500/8 px-4 py-1.5 text-xs font-medium text-sage-300 mb-8 stagger-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
          Your private wellness companion
        </div>

        <h1 className="font-display text-5xl leading-[1.1] text-white sm:text-6xl lg:text-7xl stagger-2">
          A quiet place to check{" "}
          <span className="text-gradient-sage">in with yourself.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-dusk-300 stagger-3">
          MindMate AI helps you notice patterns in your mood, keep a private journal,
          and build small daily habits that support your wellbeing.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 stagger-4">
          <Link
            to="/register"
            className="btn-sage px-8 py-3.5 text-base"
          >
            Create your free account
          </Link>
          <Link
            to="/login"
            className="btn-ghost px-8 py-3.5 text-base"
          >
            I already have an account
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-10 stagger-5">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-dusk-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2 stagger-6">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="card-glass p-6 text-left"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${p.color} ${p.iconColor} mb-4`}>
                {p.icon}
              </div>
              <h3 className="font-display text-lg text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dusk-400">{p.copy}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-16 max-w-xl text-xs leading-relaxed text-dusk-600">
          MindMate AI is a wellness companion, not a medical device, therapist, or emergency
          service. It does not diagnose conditions or provide treatment. If you are in crisis or
          in danger, please contact local emergency services or a crisis line in your area.
        </p>
      </main>
    </div>
  );
}

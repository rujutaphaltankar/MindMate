import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import FormField from "../components/FormField";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const quotes = [
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
];

const quote = quotes[Math.floor(Math.random() * quotes.length)];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await login(form);
    setIsSubmitting(false);
    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="relative flex min-h-screen bg-auth transition-colors duration-300">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Orbs */}
      <div className="orb w-96 h-96 bg-dusk-500/12 dark:bg-dusk-500/20 top-[-80px] left-[-80px] animate-float" />
      <div className="orb w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/15 bottom-0 right-[40%] animate-float-slow" style={{ animationDelay: "-4s" }} />

      {/* Left decorative panel */}
      <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between p-12 overflow-hidden">
        <Link to="/" className="font-display text-xl font-semibold text-dusk-900 dark:text-white z-10 relative">
          MindMate <span className="text-gradient-sage">AI</span>
        </Link>

        <div className="z-10 relative">
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full mb-6" />
          <blockquote className="font-display text-2xl leading-snug text-dusk-900 dark:text-white/90">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-dusk-600 dark:text-dusk-400">— {quote.author}</p>
        </div>

        <p className="z-10 relative text-xs text-dusk-500 dark:text-dusk-600 leading-relaxed max-w-xs">
          MindMate AI is a wellness companion, not a medical device or therapist.
        </p>

        {/* Decorative circles */}
        <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full border border-dusk-200/40 dark:border-white/5" />
        <div className="absolute bottom-[-20px] right-[-20px] w-44 h-44 rounded-full border border-dusk-200/40 dark:border-white/5" />
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-dusk-200/50 dark:bg-white/5 my-8" />

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block font-display text-xl font-semibold text-dusk-900 dark:text-white mb-8">
            MindMate <span className="text-gradient-sage">AI</span>
          </Link>

          <h1 className="font-display text-3xl text-dusk-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-dusk-600 dark:text-dusk-400">
            Log in to pick up where you left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-300" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              id="login-submit"
              disabled={isSubmitting}
              className="btn-sage w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                  </svg>
                  Logging in…
                </span>
              ) : "Log in"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-dusk-600 dark:text-dusk-500">
            <p>
              New here?{" "}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="hover:text-dusk-900 dark:hover:text-dusk-300 transition-colors">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

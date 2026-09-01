import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: "🔒", text: "End-to-end private — only you can see your data" },
  { icon: "🗑️", text: "Delete everything in one click, any time" },
  { icon: "🤖", text: "AI that supports, never diagnoses" },
  { icon: "🌿", text: "Free forever, no credit card needed" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setDetails([]);
    setIsSubmitting(true);
    const result = await register(form);
    setIsSubmitting(false);
    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
      setDetails(result.details || []);
    }
  }

  return (
    <div className="flex min-h-screen bg-auth">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-sage-500/15 top-[-80px] right-[-80px] animate-float-slow" style={{ animationDelay: "-2s" }} />
      <div className="orb w-72 h-72 bg-dusk-500/18 bottom-0 left-[30%] animate-float" style={{ animationDelay: "-5s" }} />

      {/* Left form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block font-display text-xl font-semibold text-white mb-8">
            MindMate <span className="text-gradient-sage">AI</span>
          </Link>

          <h1 className="font-display text-3xl text-white">Create your space</h1>
          <p className="mt-2 text-sm text-dusk-400">
            Free, private, and yours to delete at any time.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="What should we call you?"
              autoComplete="name"
            />
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />

            {(error || details.length > 0) && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300" role="alert">
                {error && <p>{error}</p>}
                {details.length > 0 && (
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              id="register-submit"
              disabled={isSubmitting}
              className="btn-sage w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dusk-500">
            Already have an account?{" "}
            <Link to="/login" className="text-sage-400 hover:text-sage-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-white/5 my-8" />

      {/* Right decorative panel */}
      <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between p-12 overflow-hidden">
        <Link to="/" className="font-display text-xl font-semibold text-white z-10 relative">
          MindMate <span className="text-gradient-sage">AI</span>
        </Link>

        <div className="z-10 relative space-y-4">
          <div className="w-16 h-1 bg-gradient-to-r from-sage-500 to-sage-300 rounded-full mb-6" />
          <h2 className="font-display text-2xl text-white">Built around your privacy.</h2>
          <p className="text-sm leading-relaxed text-dusk-400">
            Everything you write stays with you. MindMate was designed from the ground up to
            respect your privacy — no ads, no data selling, no judgment.
          </p>
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-sm text-dusk-300">
                <span className="text-base mt-0.5">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="z-10 relative text-xs text-dusk-600 leading-relaxed max-w-xs">
          MindMate AI is a wellness companion, not a medical device or therapist.
        </p>

        {/* Decorative elements */}
        <div className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full border border-white/5" />
        <div className="absolute top-[-20px] left-[-20px] w-44 h-44 rounded-full border border-white/5" />
      </div>
    </div>
  );
}

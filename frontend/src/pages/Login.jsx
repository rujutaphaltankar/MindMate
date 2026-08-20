import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

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
    <div className="flex min-h-screen items-center justify-center bg-dusk-50 px-4 dark:bg-dusk-900">
      <div className="w-full max-w-sm rounded-3xl border border-dusk-100 bg-white p-8 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <Link to="/" className="font-display text-lg text-dusk-800 dark:text-dusk-50">
          MindMate <span className="text-sage-500">AI</span>
        </Link>
        <h1 className="mt-4 font-display text-2xl text-dusk-900 dark:text-dusk-50">Welcome back</h1>
        <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
          Log in to pick up where you left off.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-dusk-800 py-2.5 font-medium text-white transition hover:bg-dusk-700 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dusk-500 dark:text-dusk-300">
          New here?{" "}
          <Link to="/register" className="font-medium text-sage-600 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-dusk-400">
          <Link to="/forgot-password" className="hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}

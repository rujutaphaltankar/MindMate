import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

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
    <div className="flex min-h-screen items-center justify-center bg-dusk-50 px-4 dark:bg-dusk-900">
      <div className="w-full max-w-sm rounded-3xl border border-dusk-100 bg-white p-8 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <Link to="/" className="font-display text-lg text-dusk-800 dark:text-dusk-50">
          MindMate <span className="text-sage-500">AI</span>
        </Link>
        <h1 className="mt-4 font-display text-2xl text-dusk-900 dark:text-dusk-50">
          Create your space
        </h1>
        <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
          Free, private, and yours to delete at any time.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error && <p>{error}</p>}
              {details.length > 0 && (
                <ul className="mt-1 list-inside list-disc">
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-sage-500 py-2.5 font-medium text-white transition hover:bg-sage-600 disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dusk-500 dark:text-dusk-300">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-sage-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error ||
          err.response?.data?.details?.[0] ||
          "Unable to send reset instructions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dusk-50 px-4 dark:bg-dusk-900">
      <div className="w-full max-w-md rounded-3xl border border-dusk-100 bg-white p-8 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-2xl text-dusk-900 dark:text-dusk-50">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-dusk-500 dark:text-dusk-300">
            Enter the email associated with your MindMate account and we’ll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="mt-6 text-center">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <p className="font-semibold">Reset instructions sent!</p>
              <p className="mt-1 text-xs opacity-90">
                If an account exists for <span className="font-medium">{email}</span>, you’ll receive an email with reset instructions shortly. The link expires in 30 minutes.
              </p>
            </div>
            <p className="mt-4 text-xs text-dusk-400 dark:text-dusk-400">
              Didn’t receive an email? Check your spam folder or make sure you entered the correct address.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Send again with another email
              </button>
              <Link
                to="/login"
                className="mt-2 inline-block rounded-full bg-dusk-800 px-6 py-2.5 text-center text-sm font-medium text-white hover:bg-dusk-700 dark:bg-dusk-700 dark:hover:bg-dusk-600"
              >
                Return to log in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-medium text-dusk-600 dark:text-dusk-300"
              >
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2.5 text-sm text-dusk-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50 dark:focus:ring-indigo-950"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Sending link..." : "Send reset link"}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-medium text-dusk-500 hover:text-dusk-800 dark:text-dusk-400 dark:hover:text-dusk-200"
              >
                &larr; Back to log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

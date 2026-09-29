import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Missing reset token. Please request a new password reset link.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage("Password must contain both letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error ||
          err.response?.data?.details?.[0] ||
          "Unable to reset password. The link may have expired."
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-2xl text-dusk-900 dark:text-dusk-50">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-dusk-500 dark:text-dusk-300">
            Create a secure password with at least 8 characters, including letters and numbers.
          </p>
        </div>

        {!token ? (
          <div className="mt-6 text-center">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
              <p className="font-semibold">Invalid or missing reset token</p>
              <p className="mt-1">
                This reset link is incomplete or invalid. Please request a new password reset link from the forgot password page.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-indigo-700"
            >
              Request new link
            </Link>
          </div>
        ) : success ? (
          <div className="mt-6 text-center">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <p className="font-semibold">Password updated successfully!</p>
              <p className="mt-1 text-xs opacity-90">
                You can now log in with your new password. Redirecting to login in 3 seconds...
              </p>
            </div>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full bg-dusk-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-dusk-700 dark:bg-dusk-700 dark:hover:bg-dusk-600"
            >
              Log in now
            </Link>
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
                htmlFor="new-password"
                className="block text-xs font-medium text-dusk-600 dark:text-dusk-300"
              >
                New password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2.5 pr-10 text-sm text-dusk-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50 dark:focus:ring-indigo-950"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dusk-400 hover:text-dusk-600 dark:text-dusk-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-dusk-600 dark:text-dusk-300"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="mt-1.5 w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2.5 text-sm text-dusk-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50 dark:focus:ring-indigo-950"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Updating password..." : "Update password"}
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

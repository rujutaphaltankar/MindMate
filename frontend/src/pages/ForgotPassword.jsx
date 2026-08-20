import { Link } from "react-router-dom";

// Placeholder UI per spec §5. Wire up to a real
// POST /api/auth/forgot-password + email flow in a later phase.
export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dusk-50 px-4 dark:bg-dusk-900">
      <div className="w-full max-w-sm rounded-3xl border border-dusk-100 bg-white p-8 text-center shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-dusk-500 dark:text-dusk-300">
          Password reset emails aren't wired up yet — this is a placeholder screen. In the
          meantime, reach out for help resetting your account.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-full bg-dusk-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-dusk-700"
        >
          Back to log in
        </Link>
      </div>
    </div>
  );
}

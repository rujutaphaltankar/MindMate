import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/mood", label: "Mood" },
  { to: "/journal", label: "Journal" },
  { to: "/companion", label: "Companion" },
  { to: "/toolkit", label: "Toolkit" },
  { to: "/insights", label: "Insights" },
  { to: "/community", label: "Community" },
  { to: "/resources", label: "Get Help" },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dusk-50 dark:bg-dusk-900">
      <header className="border-b border-dusk-100 bg-white/80 backdrop-blur dark:border-dusk-700 dark:bg-dusk-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg text-dusk-800 dark:text-dusk-50">
            MindMate <span className="text-sage-500">AI</span>
          </span>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-dusk-800 text-white"
                      : "text-dusk-600 hover:bg-dusk-100 dark:text-dusk-300 dark:hover:bg-dusk-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <NavLink
              to="/profile"
              className="hidden text-xs text-dusk-400 hover:text-dusk-700 dark:text-dusk-500 sm:inline"
            >
              Profile
            </NavLink>
            <NavLink
              to="/privacy-settings"
              className="hidden text-xs text-dusk-400 hover:text-dusk-700 dark:text-dusk-500 sm:inline"
            >
              Privacy
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="hidden text-xs text-dusk-400 hover:text-dusk-700 dark:text-dusk-500 sm:inline"
              >
                Admin
              </NavLink>
            )}
            <span className="hidden text-sm text-dusk-500 dark:text-dusk-300 sm:inline">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-dusk-200 px-4 py-1.5 text-sm font-medium text-dusk-600 transition hover:border-dusk-400 dark:border-dusk-700 dark:text-dusk-300"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/mood",
    label: "Mood",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M3 17l4-8 4 5 3-3 4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/journal",
    label: "Journal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M12 20h9" strokeLinecap="round" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/companion",
    label: "Companion",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/toolkit",
    label: "Toolkit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/insights",
    label: "Insights",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/community",
    label: "Community",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/resources",
    label: "Get Help",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function UserAvatar({ name }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-500 to-sage-700 text-xs font-bold text-white shadow-glow-sage-sm">
      {initials}
    </div>
  );
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dusk-50 dark:bg-[#0e1020] text-dusk-900 dark:text-dusk-50 transition-colors duration-300">
      <header
        className="sticky top-0 z-50 border-b border-dusk-100/80 dark:border-white/6 bg-white/80 dark:bg-[#0e1020]/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <span className="font-display text-lg font-semibold text-dusk-900 dark:text-white flex-shrink-0">
            MindMate <span className="text-gradient-sage">AI</span>
          </span>

          {/* Nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sage-500/15 text-sage-700 dark:text-sage-300 border-b-2 border-sage-500/70"
                      : "text-dusk-600 dark:text-dusk-400 hover:text-dusk-900 dark:hover:text-dusk-200 hover:bg-dusk-100/60 dark:hover:bg-white/5"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <NavLink
              to="/profile"
              className="hidden text-xs text-dusk-600 dark:text-dusk-500 hover:text-dusk-900 dark:hover:text-dusk-300 transition-colors sm:inline"
            >
              Profile
            </NavLink>
            <NavLink
              to="/privacy-settings"
              className="hidden text-xs text-dusk-600 dark:text-dusk-500 hover:text-dusk-900 dark:hover:text-dusk-300 transition-colors sm:inline"
            >
              Privacy
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="hidden text-xs text-sand-400 dark:text-sand-300 hover:text-sand-500 dark:hover:text-sand-200 transition-colors sm:inline"
              >
                Admin
              </NavLink>
            )}

            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-dusk-200/60 dark:border-white/8">
              <UserAvatar name={user?.name} />
              <span className="hidden text-sm text-dusk-700 dark:text-dusk-300 sm:block max-w-[100px] truncate">
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-ghost ml-1 px-4 py-1.5 text-xs"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}

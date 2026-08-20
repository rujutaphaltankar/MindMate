import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Companion from "./pages/companion/Companion";
import Community from "./pages/community/Community";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import GetHelp from "./pages/GetHelp";
import Insights from "./pages/insights/Insights";
import Journal from "./pages/journal/Journal";
import JournalDetail from "./pages/journal/JournalDetail";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MoodTracker from "./pages/mood/MoodTracker";
import PrivacySettings from "./pages/PrivacySettings";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Toolkit from "./pages/toolkit/Toolkit";

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resources" element={<GetHelp />} />

        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/mood" element={<Protected><MoodTracker /></Protected>} />
        <Route path="/journal" element={<Protected><Journal /></Protected>} />
        <Route path="/journal/:id" element={<Protected><JournalDetail /></Protected>} />
        <Route path="/companion" element={<Protected><Companion /></Protected>} />
        <Route path="/toolkit" element={<Protected><Toolkit /></Protected>} />
        <Route path="/insights" element={<Protected><Insights /></Protected>} />
        <Route path="/community" element={<Protected><Community /></Protected>} />
        <Route path="/privacy-settings" element={<Protected><PrivacySettings /></Protected>} />
        <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

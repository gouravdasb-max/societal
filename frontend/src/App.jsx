import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Loader from "./components/Loader.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import ResidentDashboard from "./pages/ResidentDashboard.jsx";
import Announcements from "./pages/Announcements.jsx";
import Venues from "./pages/Venues.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Complaints from "./pages/Complaints.jsx";
import Chat from "./pages/Chat.jsx";
import Polls from "./pages/Polls.jsx";
import Directory from "./pages/Directory.jsx";
import Events from "./pages/Events.jsx";
import GatePasses from "./pages/GatePasses.jsx";
import MyBills from "./pages/MyBills.jsx";
import Expenses from "./pages/Expenses.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminResidents from "./pages/AdminResidents.jsx";
import AdminAnnouncements from "./pages/AdminAnnouncements.jsx";
import AdminVenues from "./pages/AdminVenues.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";
import AdminComplaints from "./pages/AdminComplaints.jsx";
import AdminPolls from "./pages/AdminPolls.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import AdminGatePasses from "./pages/AdminGatePasses.jsx";
import AdminExpenses from "./pages/AdminExpenses.jsx";
import AdminBilling from "./pages/AdminBilling.jsx";
import AdminGuards from "./pages/AdminGuards.jsx";
import GuardDashboard from "./pages/GuardDashboard.jsx";
import GuardScanPass from "./pages/GuardScanPass.jsx";
import NotFound from "./pages/NotFound.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "guard") return <Navigate to="/guard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

                    <Route path="/dashboard" element={<ProtectedRoute role="resident"><ResidentDashboard /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute role={["resident", "guard"]}><Announcements /></ProtectedRoute>} />
          <Route path="/venues" element={<ProtectedRoute role="resident"><Venues /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute role="resident"><MyBookings /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute role="resident"><Complaints /></ProtectedRoute>} />
          <Route path="/polls" element={<ProtectedRoute role="resident"><Polls /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute role={["resident", "guard"]}><Directory /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute role={["resident", "guard"]}><Events /></ProtectedRoute>} />
          <Route path="/gatepasses" element={<ProtectedRoute role="resident"><GatePasses /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute role="resident"><MyBills /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute role="resident"><Expenses /></ProtectedRoute>} />

                    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/residents" element={<ProtectedRoute role="admin"><AdminResidents /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/venues" element={<ProtectedRoute role="admin"><AdminVenues /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>} />
          <Route path="/admin/polls" element={<ProtectedRoute role="admin"><AdminPolls /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute role="admin"><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/gatepasses" element={<ProtectedRoute role="admin"><AdminGatePasses /></ProtectedRoute>} />
          <Route path="/admin/expenses" element={<ProtectedRoute role="admin"><AdminExpenses /></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute role="admin"><AdminBilling /></ProtectedRoute>} />
          <Route path="/admin/guards" element={<ProtectedRoute role="admin"><AdminGuards /></ProtectedRoute>} />

                    <Route path="/guard" element={<ProtectedRoute role="guard"><GuardDashboard /></ProtectedRoute>} />
          <Route path="/guard/scan" element={<ProtectedRoute role="guard"><GuardScanPass /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

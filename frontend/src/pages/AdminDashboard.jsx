import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [residents, bookings, complaints, announcements, polls, gatepasses] = await Promise.all([
          api.get("/users/residents"),
          api.get("/bookings/all?status=pending"),
          api.get("/complaints/all?status=open"),
          api.get("/announcements"),
          api.get("/polls"),
          api.get("/gatepasses/all?status=active"),
        ]);
        setStats({
          residents: residents.data.data.length,
          pendingResidents: residents.data.data.filter((r) => !r.isApproved).length,
          pendingBookings: bookings.data.data.length,
          openComplaints: complaints.data.data.length,
          announcements: announcements.data.data.length,
          activePolls: polls.data.data.filter((p) => !p.isClosed).length,
          activePasses: gatepasses.data.data.length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <AppLayout><Loader /></AppLayout>;

  const cards = [
    { label: "Total residents", value: stats.residents, icon: "👥", pill: "pill-primary", to: "/admin/residents" },
    { label: "Pending approvals", value: stats.pendingResidents, icon: "⏳", pill: "pill-warning", to: "/admin/residents" },
    { label: "Pending bookings", value: stats.pendingBookings, icon: "🗓️", pill: "pill-secondary", to: "/admin/bookings" },
    { label: "Open complaints", value: stats.openComplaints, icon: "🛠️", pill: "pill-danger", to: "/admin/complaints" },
    { label: "Active polls", value: stats.activePolls, icon: "📊", pill: "pill-accent", to: "/admin/polls" },
    { label: "Active gate passes", value: stats.activePasses, icon: "🎫", pill: "pill-success", to: "/admin/gatepasses" },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.fullName?.split(" ")[0]}</h1>
          <p>Here's the pulse of your society today.</p>
        </div>
      </div>

      {user?.society?.inviteCode && (
        <div className="society-invite-card">
          <div>
            <span className="society-invite-label">Resident invite code</span>
            <div className="society-invite-code">{user.society.inviteCode}</div>
            <p>Share this code with residents so they join {user.society.name}.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(user.society.inviteCode)}>Copy code</button>
        </div>
      )}

      <div className="grid grid-3">
        {cards.map((c, i) => (
          <Link key={c.label} to={c.to} className="card stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex-between">
              <span className={`pill ${c.pill}`}>{c.icon} {c.label}</span>
            </div>
            <div className="stat-value">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-4" style={{ marginTop: 24 }}>
        <Link to="/admin/events" className="card quick-action-card">
          <div className="quick-action-icon">🎉</div>
          <strong>Events</strong>
        </Link>
        <Link to="/admin/expenses" className="card quick-action-card">
          <div className="quick-action-icon">💰</div>
          <strong>Expenses</strong>
        </Link>
        <Link to="/admin/billing" className="card quick-action-card">
          <div className="quick-action-icon">🧾</div>
          <strong>Billing</strong>
        </Link>
        <Link to="/chat" className="card quick-action-card">
          <div className="quick-action-icon">💬</div>
          <strong>Chat</strong>
        </Link>
      </div>
    </AppLayout>
  );
}

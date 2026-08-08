import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          api.get("/announcements"),
          api.get("/bookings/mine"),
        ]);
        setAnnouncements(a.data.data.slice(0, 3));
        setBookings(b.data.data.slice(0, 3));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Hi {user?.fullName?.split(" ")[0]} 👋</h1>
          <p>Here's what's happening around your society.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-2">
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 17 }}>📣 Latest announcements</h3>
              <Link to="/announcements" className="small" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>
                View all
              </Link>
            </div>
            {announcements.length === 0 ? (
              <p className="muted small">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} style={{ marginBottom: 14 }}>
                  <div className="flex-between">
                    <strong style={{ fontSize: 14.5 }}>{a.title}</strong>
                    <span className="pill pill-primary">{a.category}</span>
                  </div>
                  <p className="muted small" style={{ marginTop: 4 }}>
                    {a.content.slice(0, 90)}{a.content.length > 90 ? "…" : ""}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 17 }}>🗓️ Your bookings</h3>
              <Link to="/bookings" className="small" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>
                View all
              </Link>
            </div>
            {bookings.length === 0 ? (
              <p className="muted small">No bookings yet. <Link to="/venues" style={{ color: "var(--primary-dark)" }}>Book a venue →</Link></p>
            ) : (
              bookings.map((b) => (
                <div key={b._id} className="flex-between" style={{ marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: 14.5 }}>{b.venue?.name}</strong>
                    <p className="muted small">{new Date(b.date).toLocaleDateString()} · {b.startTime}</p>
                  </div>
                  <span className={`pill ${b.status === "approved" ? "pill-success" : b.status === "rejected" ? "pill-danger" : "pill-warning"}`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="grid grid-4" style={{ marginTop: 18 }}>
        <Link to="/venues" className="card quick-action-card">
          <div className="quick-action-icon">🏛️</div>
          <strong>Book a venue</strong>
        </Link>
        <Link to="/complaints" className="card quick-action-card">
          <div className="quick-action-icon">🛠️</div>
          <strong>Raise a complaint</strong>
        </Link>
        <Link to="/polls" className="card quick-action-card">
          <div className="quick-action-icon">📊</div>
          <strong>Vote on polls</strong>
        </Link>
        <Link to="/gatepasses" className="card quick-action-card">
          <div className="quick-action-icon">🎫</div>
          <strong>Gate pass</strong>
        </Link>
        <Link to="/events" className="card quick-action-card">
          <div className="quick-action-icon">🎉</div>
          <strong>Events</strong>
        </Link>
        <Link to="/directory" className="card quick-action-card">
          <div className="quick-action-icon">👥</div>
          <strong>Directory</strong>
        </Link>
        <Link to="/bills" className="card quick-action-card">
          <div className="quick-action-icon">💰</div>
          <strong>My bills</strong>
        </Link>
        <Link to="/chat" className="card quick-action-card">
          <div className="quick-action-icon">💬</div>
          <strong>Community chat</strong>
        </Link>
      </div>
    </AppLayout>
  );
}

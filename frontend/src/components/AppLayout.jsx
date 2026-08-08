import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MobileSidebar from "./MobileSidebar.jsx";

const residentLinks = [
  { to: "/dashboard", label: "Home", icon: "🏡" },
  { to: "/announcements", label: "Announcements", icon: "📣" },
  { to: "/venues", label: "Book a Venue", icon: "🗓️" },
  { to: "/bookings", label: "My Bookings", icon: "📌" },
  { to: "/complaints", label: "Complaints", icon: "🛠️" },
  { to: "/polls", label: "Polls", icon: "📊" },
  { to: "/events", label: "Events", icon: "🎉" },
  { to: "/directory", label: "Directory", icon: "👥" },
  { to: "/gatepasses", label: "Gate Passes", icon: "🎫" },
  { to: "/bills", label: "My Bills", icon: "💰" },
  { to: "/expenses", label: "Expenses", icon: "💳" },
  { to: "/chat", label: "Community Chat", icon: "💬" },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: "🏡" },
  { to: "/admin/residents", label: "Residents", icon: "👥" },
  { to: "/admin/announcements", label: "Announcements", icon: "📣" },
  { to: "/admin/venues", label: "Venues", icon: "🏛️" },
  { to: "/admin/bookings", label: "Bookings", icon: "🗓️" },
  { to: "/admin/complaints", label: "Complaints", icon: "🛠️" },
  { to: "/admin/polls", label: "Polls", icon: "📊" },
  { to: "/admin/events", label: "Events", icon: "🎉" },
  { to: "/admin/gatepasses", label: "Gate Passes", icon: "🎫" },
  { to: "/admin/expenses", label: "Expenses", icon: "💰" },
  { to: "/admin/billing", label: "Billing", icon: "🧾" },
  { to: "/admin/guards", label: "Guards", icon: "🛡️" },
  { to: "/chat", label: "Community Chat", icon: "💬" },
];

const guardLinks = [
  { to: "/guard", label: "Dashboard", icon: "🛡️" },
  { to: "/guard/scan", label: "Scan Pass", icon: "📱" },
  { to: "/directory", label: "Directory", icon: "👥" },
  { to: "/announcements", label: "Announcements", icon: "📣" },
  { to: "/events", label: "Events", icon: "🎉" },
  { to: "/chat", label: "Community Chat", icon: "💬" },
];

export default function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 900 : false
  );
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  let links;
  if (user?.role === "admin") {
    links = adminLinks;
  } else if (user?.role === "guard") {
    links = guardLinks;
  } else {
    links = residentLinks;
  }

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onLogoutRequest={handleLogoutClick} />

      <aside className="sidebar">
        <div className="sidebar-brand">Societal</div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard" || link.to === "/admin" || link.to === "/guard"}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <span>{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-profile-card">
            {user?.avatar ? (
              <img src={user.avatar} className="avatar" alt="" />
            ) : (
              <div className="avatar">{initials}</div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-profile-name">{user?.fullName}</div>
              <div className="sidebar-profile-role">{user?.role}</div>
            </div>
            <span className="sidebar-profile-edit">✏️</span>
          </NavLink>
          {user?.role === "admin" && user?.society?.inviteCode && (
            <div className="small muted" style={{ marginBottom: 10, marginTop: 4 }}>
              Invite code: <strong style={{ color: "var(--primary)", fontFamily: "var(--font-mono)" }}>{user.society.inviteCode}</strong>
            </div>
          )}
          <button className="btn btn-outline btn-sm btn-block" onClick={handleLogoutClick}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content-wrapper">
        <button
          className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{ visibility: isMobileView ? "visible" : "hidden", pointerEvents: isMobileView ? "auto" : "none" }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <main className="main-content">{children}</main>
      </main>

      {showLogoutModal && (
        <div className="modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="card modal-card payment-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <div className="payment-modal-icon" style={{ background: "rgba(255, 107, 138, .12)" }}>👋</div>
              <h3>Log out</h3>
            </div>
            <div className="payment-modal-body" style={{ textAlign: "center", paddingTop: 10 }}>
              Are you sure you want to log out of your account?
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmLogout}>
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

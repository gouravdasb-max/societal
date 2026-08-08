import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import usePWA from "../hooks/usePWA.js";

const residentLinks = [
  { to: "/dashboard", label: "Home", icon: "🏡" },
  { to: "/announcements", label: "Announcements", icon: "📣" },
  { to: "/venues", label: "Book Venue", icon: "🗓️" },
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

export default function MobileSidebar({ isOpen, onClose, onLogoutRequest }) {
  const { user } = useAuth();
  const { canInstall, installPWA } = usePWA();
  const navigate = useNavigate();
  let links;
  if (user?.role === "admin") {
    links = adminLinks;
  } else if (user?.role === "guard") {
    links = guardLinks;
  } else {
    links = residentLinks;
  }

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    onClose();
    if (onLogoutRequest) onLogoutRequest();
  };

  const handleNavClick = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="mobile-sidebar-overlay" onClick={onClose} />
      )}
      <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-header">
          <div className="sidebar-brand">Societal</div>
        </div>

        <nav className="mobile-nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard" || link.to === "/admin" || link.to === "/guard"}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
              onClick={handleNavClick}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mobile-sidebar-footer">
          <NavLink to="/profile" className="user-card" onClick={handleNavClick}>
            {user?.avatar ? (
              <img src={user.avatar} className="avatar" alt="" />
            ) : (
              <div className="avatar">{initials}</div>
            )}
            <div>
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </NavLink>

          {user?.role === "admin" && user?.society?.inviteCode && (
            <div className="invite-code-box">
              <span className="code-label">Invite code:</span>
              <span className="code-value">{user.society.inviteCode}</span>
            </div>
          )}

          {canInstall && (
            <button
              className="btn btn-primary btn-sm btn-block"
              style={{ marginBottom: 12 }}
              onClick={() => {
                onClose();
                installPWA();
              }}
            >
              ⏬ Install App
            </button>
          )}

          <button
            className="btn btn-outline btn-sm btn-block"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

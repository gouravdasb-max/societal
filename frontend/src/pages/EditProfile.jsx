import { useState, useRef } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    flatNumber: user?.flatNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.patch("/users/profile", form);
      setUser(data.data);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarUploading(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.data);
      setMessage("Avatar updated!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLeaveSociety = async () => {
    const confirmMessage = user?.role === "admin" 
      ? "WARNING: As an admin, leaving the society will completely and irreversibly DESTROY the entire society, including all users, gate passes, bills, polls, and data. Are you absolutely sure?"
      : "Are you sure you want to leave the society? This action will completely and irreversibly delete your account and all associated passes/bookings.";
      
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const { data } = await api.delete("/users/profile");
      if (data.data?.requiresOtp) {
        const otp = window.prompt("A 6-digit verification code has been sent to your email to verify you own this society. Enter the code:");
        if (!otp) {
          setMessage("Destroy action cancelled.");
          return;
        }
        await api.delete("/users/profile", { data: { otp } });
      }

      await logout();
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete profile");
    }
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>✏️ Edit Profile</h1>
          <p>Update your personal information and avatar.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
                <div className="card profile-avatar-card">
          <div className="profile-avatar-wrapper">
            {user?.avatar ? (
              <img src={user.avatar} className="profile-avatar-img" alt="avatar" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            <button
              className="profile-avatar-edit-btn"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              title="Change avatar"
            >
              {avatarUploading ? "⏳" : "📷"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <h3 style={{ fontSize: 18 }}>{user?.fullName}</h3>
            <p className="muted small" style={{ marginTop: 4, textTransform: "capitalize" }}>
              {user?.role} · {user?.society?.name}
            </p>
            {user?.email && (
              <p className="muted small" style={{ marginTop: 4 }}>{user.email}</p>
            )}
          </div>
        </div>

                <form className="card" onSubmit={handleSave}>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label>Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="field">
            <label>Flat / Apt Number</label>
            <input
              name="flatNumber"
              value={form.flatNumber}
              disabled
              style={{ opacity: 0.5 }}
            />
            <span className="muted small" style={{ marginTop: 2 }}>Contact super admin to change flat number</span>
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Email</label>
            <input value={user?.email || ""} disabled style={{ opacity: 0.5 }} />
            <span className="muted small" style={{ marginTop: 2 }}>Email cannot be changed</span>
          </div>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleLeaveSociety}>
              {user?.role === "admin" ? "Destroy Society" : "Leave Society"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

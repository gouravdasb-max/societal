import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(data.message);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1>Change Password</h1>
          <p>Update your account password</p>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Current Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={handleChange("currentPassword")}
              placeholder="Enter your current password"
            />
          </div>

          <div className="field">
            <label>New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength="8"
              value={form.newPassword}
              onChange={handleChange("newPassword")}
              placeholder="At least 8 characters"
            />
            <small style={{ color: "var(--text-faint)", marginTop: 4, display: "block" }}>
              Password must be at least 8 characters long
            </small>
          </div>

          <div className="field">
            <label>Confirm New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength="8"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Repeat your new password"
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: "rgba(145, 231, 193, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(145, 231, 193, 0.2)" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            <strong style={{ color: "var(--success)" }}>Tip:</strong> Choose a strong password with a mix of uppercase, lowercase, numbers, and symbols for better security.
          </p>
        </div>
      </div>
    </div>
  );
}

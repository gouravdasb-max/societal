import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, verifyAdminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (requiresOtp) {
        const user = await verifyAdminLogin(form.email, form.otp);
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const res = await login(form.email, form.password);
        if (res?.requiresOtp) {
          setRequiresOtp(true);
        } else {
          navigate(res.role === "admin" ? "/admin" : "/dashboard");
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="blob" style={{ width: 320, height: 320, background: "var(--primary)", top: -80, left: -60 }} />
        <div className="blob" style={{ width: 260, height: 260, background: "var(--secondary)", bottom: -60, right: -40 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 40, marginBottom: 18 }}>🏘️</div>
          <h1 style={{ fontSize: 38, maxWidth: 420, lineHeight: 1.2 }}>
            Your society, all in one calm place.
          </h1>
          <p className="muted" style={{ marginTop: 16, maxWidth: 380, fontSize: 15.5, lineHeight: 1.6 }}>
            Announcements, venue bookings and neighbourhood chat — Societal keeps
            everyone in the loop without the noise.
          </p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p className="muted">Log in to your Societal account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!requiresOtp ? (
              <>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div className="field">
                <label>Admin Verification Code</label>
                <input
                  type="text"
                  required
                  autoComplete="one-time-code"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  placeholder="6-digit code from email"
                />
              </div>
            )}
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Please wait..." : requiresOtp ? "Verify & Log in" : "Log in"}
            </button>
          </form>

          <div className="auth-footer">
            <p className="small">
              <Link to="/forgot-password" className="link-primary">Forgot password?</Link>
            </p>

            <p className="small muted">
              New to Societal? <Link to="/register" className="link-primary">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

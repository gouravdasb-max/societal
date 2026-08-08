import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Select from "../components/Select.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    flatNumber: "",
    phone: "",
    role: "resident",
    adminCode: "",
    societyName: "",
    societyCity: "",
    inviteCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await register(fd);
      const newInviteCode = form.role === "admin" ? res.data?.society?.inviteCode : null;
      setSuccess(newInviteCode ? `${res.message} Your society invite code is ${newInviteCode}. Share it with residents.` : res.message);
      setTimeout(() => navigate("/login"), newInviteCode ? 5000 : 1800);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="blob" style={{ width: 300, height: 300, background: "var(--accent)", top: -60, right: -80 }} />
        <div className="blob" style={{ width: 240, height: 240, background: "var(--primary)", bottom: -50, left: -50 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 40, marginBottom: 18 }}>🌿</div>
          <h1 style={{ fontSize: 36, maxWidth: 420, lineHeight: 1.2 }}>
            Join your neighbours on Societal.
          </h1>
          <p className="muted" style={{ marginTop: 16, maxWidth: 380, fontSize: 15.5, lineHeight: 1.6 }}>
            Residents get approved by an admin before their first login —
            just so the community stays a trusted one.
          </p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create your account</h2>
            <p className="muted">It takes less than a minute</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="field">
                <label>Full name</label>
                <input required value={form.fullName} onChange={update("fullName")} placeholder="Jordan Lee" />
              </div>
              <div className="field">
                <label>Flat number</label>
                <input value={form.flatNumber} onChange={update("flatNumber")} placeholder="B-204" />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" />
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={update("phone")} placeholder="+91 98765 43210" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" required value={form.password} onChange={update("password")} placeholder="••••••••" />
              </div>
            </div>

            <div className="field">
              <label>I am registering as</label>
              <Select value={form.role} onChange={update("role")}>
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            {form.role === "admin" && (
              <>
                <div className="field"><label>Society name</label><input required value={form.societyName} onChange={update("societyName")} placeholder="Greenwood Residency" /></div>
                <div className="field"><label>City / region</label><input value={form.societyCity} onChange={update("societyCity")} placeholder="Mumbai" /></div>
                <div className="field"><label>Platform admin code</label><input required value={form.adminCode} onChange={update("adminCode")} placeholder="Provided by Societal" /></div>
              </>
            )}
            {form.role === "resident" && <div className="field"><label>Society invite code</label><input required value={form.inviteCode} onChange={update("inviteCode")} placeholder="Ask your society admin" style={{ textTransform: "uppercase" }} /></div>}

            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            <p className="small muted">
              Already have an account? <Link to="/login" className="link-primary">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

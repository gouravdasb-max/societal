import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";

export default function AdminGuards() {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchGuards = async () => {
    try {
      const { data } = await api.get("/users/guards");
      setGuards(data.data);
    } catch (err) {
      console.error("Failed to fetch guards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/create-guard", form);
      setSuccess("Guard account created successfully!");
      setForm({ fullName: "", email: "", password: "", phone: "" });
      setShowForm(false);
      fetchGuards();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create guard");
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove guard "${name}"? They will no longer be able to log in or scan passes.`)) return;
    try {
      await api.delete(`/users/guards/${id}`);
      setGuards((prev) => prev.filter((g) => g._id !== id));
      setSuccess(`Guard "${name}" removed.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove guard");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading)
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>🛡️ Guard Management</h1>
          <p>Create and manage security guard accounts for your society.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Guard"}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 17 }}>Create Guard Account</h3>
          <p className="muted small" style={{ marginBottom: 16 }}>
            Guards can log in and verify visitor gate passes by scanning QR codes. They are auto-approved and don't need email verification.
          </p>

          <div className="grid grid-2">
            <div className="field">
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Guard's full name"
                required
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="guard@example.com"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Temporary password"
                required
                minLength={6}
              />
            </div>
            <div className="field">
              <label>Phone (optional)</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" disabled={creating}>
              {creating ? "Creating…" : "Create Guard Account"}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 17 }}>
          Active Guards <span className="pill pill-primary" style={{ marginLeft: 8 }}>{guards.length}</span>
        </h3>
      </div>

      {guards.length === 0 ? (
        <div className="empty-state card">
          <h3>No guards yet</h3>
          <p>Create your first guard account so they can verify visitor gate passes at the gate.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {guards.map((guard, i) => (
            <div key={guard._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex-between">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="avatar" style={{ background: "linear-gradient(135deg, var(--primary-light), rgba(89, 255, 138, .16))" }}>
                    {guard.avatar ? (
                      <img src={guard.avatar} alt="avatar" />
                    ) : (
                      guard.fullName?.[0]?.toUpperCase() || "G"
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{guard.fullName}</div>
                    <div className="muted small">{guard.email}</div>
                    {guard.phone && (
                      <div className="muted small">📞 {guard.phone}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="pill pill-success">🛡️ Guard</span>
                  <span className="muted small">Added {formatDate(guard.createdAt)}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(guard._id, guard.fullName)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

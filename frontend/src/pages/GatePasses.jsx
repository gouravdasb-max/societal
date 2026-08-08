import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import ImageModal from "../components/ImageModal.jsx";

const STATUS_PILL = { active: "pill-success", used: "pill-muted", expired: "pill-warning", cancelled: "pill-danger" };

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function GatePasses() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ visitorName: "", visitorPhone: "", validFrom: "", validTo: "", purpose: "" });
  const [submitting, setSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchPasses = async () => {
    try {
      const { data } = await api.get("/gatepasses/mine");
      setPasses(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/gatepasses", form);
      setForm({ visitorName: "", visitorPhone: "", validFrom: "", validTo: "", purpose: "" });
      setShowForm(false);
      fetchPasses();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create pass");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/gatepasses/${id}/cancel`);
      fetchPasses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };
  const daysLeft = (pass) => {
    const now = new Date();
    const to = new Date(pass.validTo);
    const diff = Math.ceil((to - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <AppLayout>
      <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
      <div className="page-header">
        <div>
          <h1>🎫 Gate Passes</h1>
          <p>Pre-register visitors with a validity window (max 30 days).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Pass"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 24, animation: "float-in .35s ease both" }} onSubmit={handleCreate}>
          <div className="grid grid-2">
            <div className="field">
              <label>Visitor name</label>
              <input name="visitorName" value={form.visitorName} onChange={handleChange} placeholder="Full name" required maxLength={100} />
            </div>
            <div className="field">
              <label>Visitor phone</label>
              <input name="visitorPhone" value={form.visitorPhone} onChange={handleChange} placeholder="Phone number" maxLength={20} />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Valid from</label>
              <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="field">
              <label>Valid to</label>
              <input type="date" name="validTo" value={form.validTo} onChange={handleChange} required min={form.validFrom || new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="field">
            <label>Purpose</label>
            <input name="purpose" value={form.purpose} onChange={handleChange} placeholder="Delivery, friend visit, plumber…" maxLength={200} />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create Gate Pass"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : passes.length === 0 ? (
        <div className="empty-state">
          <h3>No gate passes</h3>
          <p>Create a pass when you're expecting a visitor.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {passes.map((pass, i) => {
            const remaining = daysLeft(pass);
            return (
              <div key={pass._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex-between">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 15 }}>{pass.visitorName}</strong>
                      <span className={`pill ${STATUS_PILL[pass.status] || "pill-muted"}`}>{pass.status}</span>
                      {pass.status === "active" && remaining >= 0 && (
                        <span className="pill pill-muted">{remaining} day{remaining !== 1 ? "s" : ""} left</span>
                      )}
                    </div>
                    <div className="muted small" style={{ marginTop: 8 }}>
                      <strong>Pass ID:</strong> <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{pass._id}</span>
                    </div>
                    <div className="muted small" style={{ marginTop: 4 }}>
                      {formatDate(pass.validFrom)} → {formatDate(pass.validTo)}
                      {pass.purpose && ` · ${pass.purpose}`}
                    </div>
                    {pass.visitorPhone && <div className="muted small">📞 {pass.visitorPhone}</div>}
                  </div>
                  {pass.status === "active" && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleCancel(pass._id)}>Cancel</button>
                  )}
                </div>
                {pass.qrCode && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
                    <img
                      src={pass.qrCode}
                      alt="QR Code"
                      onClick={() => setZoomedImage(pass.qrCode)}
                      style={{
                        width: 260,
                        height: 260,
                        border: "2px solid var(--primary)",
                        borderRadius: 12,
                        padding: 8,
                        backgroundColor: "#fff",
                        cursor: "zoom-in"
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

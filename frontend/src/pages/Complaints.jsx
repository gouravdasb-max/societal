import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";
import ImageModal from "../components/ImageModal.jsx";

const statusPill = { open: "pill-warning", in_progress: "pill-primary", resolved: "pill-success" };

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", category: "other" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/complaints/mine").then((res) => setComplaints(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("category", form.category);
      if (imageFile) payload.append("image", imageFile);

      await api.post("/complaints", payload);
      setForm({ title: "", description: "", category: "other" });
      setImageFile(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p>Raise an issue and track its resolution.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 17 }}>Raise a new complaint</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Leaking pipe in parking area" />
            </div>
            <div className="field">
              <label>Category</label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="security">Security</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue in detail"
                style={{ color: "var(--text)" }}
              />
            </div>
            <div className="field">
              <label>Optional image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="muted small" style={{ marginTop: 6 }}>
                Add a photo if it helps explain the issue better.
              </p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Complaint preview"
                  style={{
                    marginTop: 10,
                    width: "100%",
                    maxHeight: 220,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid rgba(89, 255, 138, .18)",
                  }}
                />
              )}
            </div>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ marginBottom: 14, fontSize: 17 }}>Your complaints</h3>
          {loading ? (
            <Loader />
          ) : complaints.length === 0 ? (
            <div className="empty-state card"><p>No complaints raised yet.</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {complaints.map((c) => (
                <div key={c._id} className="card">
                  <div className="flex-between">
                    <strong style={{ fontSize: 14.5 }}>{c.title}</strong>
                    <span className={`pill ${statusPill[c.status]}`}>{c.status.replace("_", " ")}</span>
                  </div>
                  <p className="muted small" style={{ marginTop: 6 }}>{c.description}</p>
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      onClick={() => setZoomedImage(c.imageUrl)}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        maxHeight: 240,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid rgba(89, 255, 138, .18)",
                        cursor: "zoom-in"
                      }}
                    />
                  )}
                  {c.adminResponse && (
                    <p
                      className="small"
                      style={{
                        marginTop: 8,
                        background: "rgba(89, 255, 138, .06)",
                        padding: 10,
                        borderRadius: 8,
                        color: "var(--text)",
                        border: "1px solid rgba(89, 255, 138, .12)",
                      }}
                    >
                      💬 {c.adminResponse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

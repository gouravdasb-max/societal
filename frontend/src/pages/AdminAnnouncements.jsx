import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import AnnouncementCard from "../components/AnnouncementCard.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

const empty = { title: "", content: "", category: "general", pinned: false };

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/announcements").then((res) => setAnnouncements(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/announcements/${editingId}`, form);
      } else {
        await api.post("/announcements", form);
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (a) => {
    setEditingId(a._id);
    setForm({ title: a.title, content: a.content, category: a.category, pinned: a.pinned });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>Post updates that every resident will see.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 17 }}>{editingId ? "Edit announcement" : "New announcement"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="grid grid-2">
            <div className="field">
              <label>Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field">
              <label>Category</label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>
          <div className="field">
            <label>Content</label>
            <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            Pin to top
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm(empty); }}>
                Cancel edit
              </button>
            )}
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update announcement" : "Post announcement"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-2">
          {announcements.map((a) => (
            <AnnouncementCard key={a._id} announcement={a} onEdit={edit} onDelete={remove} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

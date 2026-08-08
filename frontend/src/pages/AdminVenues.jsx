import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import VenueCard from "../components/VenueCard.jsx";
import api from "../services/api.js";

const empty = { name: "", description: "", capacity: "", openTime: "08:00", closeTime: "22:00" };

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/venues").then((res) => setVenues(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/venues/${editingId}`, form);
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (imageFile) fd.append("image", imageFile);
        await api.post("/venues", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setForm(empty);
      setImageFile(null);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (v) => {
    setEditingId(v._id);
    setForm({ name: v.name, description: v.description, capacity: v.capacity, openTime: v.openTime, closeTime: v.closeTime });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Remove this venue?")) return;
    await api.delete(`/venues/${id}`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Venues</h1>
          <p>Manage the spaces residents can book.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 17 }}>{editingId ? "Edit venue" : "Add a venue"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="grid grid-2">
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Clubhouse" />
            </div>
            <div className="field">
              <label>Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="50" />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Opens</label>
              <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} />
            </div>
            <div className="field">
              <label>Closes</label>
              <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} />
            </div>
          </div>
          {!editingId && (
            <div className="field">
              <label>Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm(empty); }}>
                Cancel edit
              </button>
            )}
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update venue" : "Add venue"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-3">
          {venues.map((v) => (
            <VenueCard key={v._id} venue={v} onEdit={edit} onDelete={remove} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

const CATEGORIES = ["festival", "meeting", "maintenance", "social", "sports", "other"];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", startTime: "", endTime: "", location: "", category: "other" });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/events", form);
      setForm({ title: "", description: "", date: "", startTime: "", endTime: "", location: "", category: "other" });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>📅 Events</h1>
          <p>Create and manage community events.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Event"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 24, animation: "float-in .35s ease both" }} onSubmit={handleCreate}>
          <div className="grid grid-2">
            <div className="field">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Diwali celebration" required />
            </div>
            <div className="field">
              <label>Category</label>
              <Select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-3">
            <div className="field">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Start time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
            </div>
            <div className="field">
              <label>End time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Community hall" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event details…" />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create Event"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <h3>No events yet</h3>
          <p>Create your first community event.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((event, i) => (
            <div key={event._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex-between">
                <div>
                  <strong style={{ fontSize: 15 }}>{event.title}</strong>
                  <div className="muted small" style={{ marginTop: 4 }}>
                    {new Date(event.date).toLocaleDateString()}
                    {event.startTime && ` · ${event.startTime}`}
                    {event.endTime && ` – ${event.endTime}`}
                    {event.location && ` · ${event.location}`}
                  </div>
                  {event.description && <p className="muted small" style={{ marginTop: 6 }}>{event.description}</p>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="pill pill-muted">{event.category}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

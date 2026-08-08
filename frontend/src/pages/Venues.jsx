import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import VenueCard from "../components/VenueCard.jsx";
import api from "../services/api.js";

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVenue, setModalVenue] = useState(null);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", purpose: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/venues").then((res) => setVenues(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openBooking = (venue) => {
    setModalVenue(venue);
    setForm({ date: "", startTime: "", endTime: "", purpose: "" });
    setError("");
    setSuccess("");
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/bookings", { venue: modalVenue._id, ...form });
      setSuccess("Booking request sent! You'll see its status under My Bookings.");
      setTimeout(() => setModalVenue(null), 1600);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Book a venue</h1>
          <p>Request the clubhouse, garden, or other shared spaces.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : venues.length === 0 ? (
        <div className="empty-state card">
          <h3>No venues available</h3>
          <p>Your admin hasn't added any bookable venues yet.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {venues.map((v) => (
            <VenueCard key={v._id} venue={v} onBook={openBooking} />
          ))}
        </div>
      )}

      {modalVenue && (
        <div
          className="modal-backdrop"
          onClick={() => setModalVenue(null)}
        >
          <div className="card modal-card" style={{ maxWidth: 420, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>Book {modalVenue.name}</h3>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Open {modalVenue.openTime} – {modalVenue.closeTime}
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={submitBooking}>
              <div className="field">
                <label>Date</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label>Start time</label>
                  <input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="field">
                  <label>End time</label>
                  <input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Purpose (optional)</label>
                <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Birthday celebration, society meeting, etc." />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setModalVenue(null)}>Cancel</button>
                <button className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? "Sending..." : "Request booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

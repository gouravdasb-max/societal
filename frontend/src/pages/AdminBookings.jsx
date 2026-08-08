import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import BookingCard from "../components/BookingCard.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get(`/bookings/all${filter ? `?status=${filter}` : ""}`).then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const setStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status`, { status });
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Venue bookings</h1>
          <p>Review and respond to booking requests.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 240 }}>
            <input 
              type="text" 
              placeholder="Search venue or resident..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : bookings.length === 0 ? (
        <div className="empty-state card"><h3>No bookings found</h3></div>
      ) : (
        <div className="grid grid-3">
          {bookings
            .filter((b) => (b.venue?.name || "").toLowerCase().includes(search.toLowerCase()) || (b.user?.fullName || "").toLowerCase().includes(search.toLowerCase()))
            .map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              showResident
              onApprove={(id) => setStatus(id, "approved")}
              onReject={(id) => setStatus(id, "rejected")}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

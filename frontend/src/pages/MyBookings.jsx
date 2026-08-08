import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import BookingCard from "../components/BookingCard.jsx";
import api from "../services/api.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/bookings/mine").then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (id) => {
    await api.patch(`/bookings/${id}/cancel`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>My bookings</h1>
          <p>Track the status of your venue requests.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : bookings.length === 0 ? (
        <div className="empty-state card">
          <h3>No bookings yet</h3>
          <p>Head to Book a Venue to make your first request.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {bookings.map((b) => (
            <BookingCard key={b._id} booking={b} onCancel={cancel} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

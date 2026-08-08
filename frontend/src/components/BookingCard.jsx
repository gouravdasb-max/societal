const statusPill = {
  pending: "pill-warning",
  approved: "pill-success",
  rejected: "pill-danger",
  cancelled: "pill-muted",
};

export default function BookingCard({ booking, onCancel, onApprove, onReject, showResident }) {
  const date = new Date(booking.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 16.5 }}>{booking.venue?.name}</h3>
        <span className={`pill ${statusPill[booking.status]}`}>{booking.status}</span>
      </div>
      <p className="muted small">
        {date} · {booking.startTime} – {booking.endTime}
      </p>
      {showResident && (
        <p className="muted small" style={{ marginTop: 4 }}>
          {booking.bookedBy?.fullName} {booking.bookedBy?.flatNumber ? `· Flat ${booking.bookedBy.flatNumber}` : ""}
        </p>
      )}
      {booking.purpose && (
        <p style={{ marginTop: 8, fontSize: 14 }}>{booking.purpose}</p>
      )}
      {booking.adminNote && (
        <p className="small muted" style={{ marginTop: 8 }}>Note: {booking.adminNote}</p>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {onCancel && booking.status === "pending" && (
          <button className="btn btn-outline btn-sm" onClick={() => onCancel(booking._id)}>
            Cancel
          </button>
        )}
        {onApprove && booking.status === "pending" && (
          <button className="btn btn-secondary btn-sm" onClick={() => onApprove(booking._id)}>
            Approve
          </button>
        )}
        {onReject && booking.status === "pending" && (
          <button className="btn btn-danger btn-sm" onClick={() => onReject(booking._id)}>
            Reject
          </button>
        )}
      </div>
    </div>
  );
}

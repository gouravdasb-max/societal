export default function VenueCard({ venue, onBook, onEdit, onDelete }) {
  return (
    <div className="card">
      {venue.image ? (
        <img src={venue.image} className="venue-image" alt={venue.name} />
      ) : (
        <div className="venue-image flex-between" style={{ justifyContent: "center", color: "var(--secondary-dark)" }}>
          🏛️
        </div>
      )}
      <h3 style={{ fontSize: 17, marginBottom: 4 }}>{venue.name}</h3>
      <p className="muted small" style={{ marginBottom: 10, lineHeight: 1.5 }}>
        {venue.description || "No description provided."}
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span className="pill pill-secondary">👥 {venue.capacity || "—"} guests</span>
        <span className="pill pill-muted">
          {venue.openTime} – {venue.closeTime}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {onBook && (
          <button className="btn btn-primary btn-sm btn-block" onClick={() => onBook(venue)}>
            Request booking
          </button>
        )}
        {onEdit && (
          <button className="btn btn-outline btn-sm" onClick={() => onEdit(venue)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(venue._id)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

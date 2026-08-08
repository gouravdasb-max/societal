const categoryPill = {
  general: "pill-primary",
  maintenance: "pill-warning",
  event: "pill-secondary",
  urgent: "pill-danger",
};

export default function AnnouncementCard({ announcement, onEdit, onDelete }) {
  const date = new Date(announcement.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {announcement.pinned && <span title="Pinned">📌</span>}
          <span className={`pill ${categoryPill[announcement.category] || "pill-primary"}`}>
            {announcement.category}
          </span>
        </div>
        <span className="muted small">{date}</span>
      </div>
      <h3 style={{ fontSize: 18, marginBottom: 6 }}>{announcement.title}</h3>
      <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
        {announcement.content}
      </p>
      <div className="flex-between" style={{ marginTop: 14 }}>
        <span className="small muted">
          By {announcement.postedBy?.fullName || "Admin"}
        </span>
        {(onEdit || onDelete) && (
          <div style={{ display: "flex", gap: 8 }}>
            {onEdit && (
              <button className="btn btn-outline btn-sm" onClick={() => onEdit(announcement)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(announcement._id)}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";
import ImageModal from "../components/ImageModal.jsx";

const statusPill = { open: "pill-warning", in_progress: "pill-primary", resolved: "pill-success" };

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [responses, setResponses] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/complaints/all${filter ? `?status=${filter}` : ""}`).then((res) => setComplaints(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const update = async (id, status) => {
    await api.patch(`/complaints/${id}`, { status, adminResponse: responses[id] || "" });
    load();
  };

  return (
    <AppLayout>
      <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p>Track and resolve resident-raised issues.</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>

      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <div className="empty-state card"><h3>No complaints found</h3></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {complaints.map((c) => (
            <div key={c._id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div className="flex-between">
                <strong style={{ fontSize: 15 }}>{c.title}</strong>
                <span className={`pill ${statusPill[c.status]}`}>{c.status.replace("_", " ")}</span>
              </div>
              <p className="muted small" style={{ marginTop: 6 }}>
                {c.raisedBy?.fullName} · Flat {c.raisedBy?.flatNumber || "—"} · {c.category}
              </p>
              <p style={{ marginTop: 10, fontSize: 14, flex: 1 }}>{c.description}</p>
              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  onClick={() => setZoomedImage(c.imageUrl)}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    height: 180, /* Fixed symmetrical thumbnail size */
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid rgba(89, 255, 138, .18)",
                    cursor: "zoom-in"
                  }}
                />
              )}
              <textarea
                placeholder="Add a response for the resident..."
                defaultValue={c.adminResponse}
                onChange={(e) => setResponses({ ...responses, [c._id]: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "var(--surface-muted)",
                  color: "var(--text)",
                  caretColor: "var(--text)",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => update(c._id, "in_progress")}>Mark in progress</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => update(c._id, "resolved")}>Mark resolved</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

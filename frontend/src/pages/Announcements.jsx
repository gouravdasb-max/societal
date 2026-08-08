import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import AnnouncementCard from "../components/AnnouncementCard.jsx";
import api from "../services/api.js";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setAnnouncements(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>Updates and notices from your society admin.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : announcements.length === 0 ? (
        <div className="empty-state card">
          <h3>No announcements yet</h3>
          <p>Check back later for updates from your admin.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {announcements.map((a) => (
            <AnnouncementCard key={a._id} announcement={a} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

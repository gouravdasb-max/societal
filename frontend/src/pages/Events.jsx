import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORY_EMOJI = { festival: "🎉", meeting: "📋", maintenance: "🔧", social: "🎭", sports: "⚽", other: "📌" };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events?month=${month}&year=${year}`);
      setEvents(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [month, year]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const eventsByDate = {};
  events.forEach((e) => {
    const d = new Date(e.date).getDate();
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(e);
  });

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>📅 Events</h1>
          <p>Upcoming community events and activities.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
                <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <button className="btn btn-outline btn-sm" onClick={prevMonth}>← Prev</button>
            <h3 style={{ fontSize: 16 }}>{MONTHS[month - 1]} {year}</h3>
            <button className="btn btn-outline btn-sm" onClick={nextMonth}>Next →</button>
          </div>

          <div className="calendar-grid">
            {DAYS.map((d) => (
              <div key={d} className="calendar-header-cell">{d}</div>
            ))}
            {calendarCells.map((day, idx) => {
              const isToday = day && today.getDate() === day && today.getMonth() === month - 1 && today.getFullYear() === year;
              const hasEvents = day && eventsByDate[day];
              return (
                <div
                  key={idx}
                  className={`calendar-cell ${!day ? "empty" : ""} ${isToday ? "today" : ""} ${hasEvents ? "has-events" : ""}`}
                >
                  {day && (
                    <>
                      <span className="calendar-day-num">{day}</span>
                      {hasEvents && (
                        <div className="calendar-dots">
                          {eventsByDate[day].slice(0, 3).map((e, i) => (
                            <span key={i} className={`calendar-dot cat-${e.category}`} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

                <div>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Upcoming events</h3>
          {loading ? (
            <Loader />
          ) : upcomingEvents.length === 0 ? (
            <div className="card">
              <p className="muted small">No upcoming events this month.</p>
            </div>
          ) : (
            upcomingEvents.map((event, i) => (
              <div key={event._id} className="card event-card" style={{ marginBottom: 12, animationDelay: `${i * 0.06}s` }}>
                <div className="flex-between">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="event-date-badge">
                      <span className="event-date-day">{new Date(event.date).getDate()}</span>
                      <span className="event-date-month">{MONTHS[new Date(event.date).getMonth()].slice(0, 3)}</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: 14.5 }}>{event.title}</strong>
                      <div className="muted small" style={{ marginTop: 3 }}>
                        {event.startTime && `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ""}`}
                        {event.location && ` · ${event.location}`}
                      </div>
                    </div>
                  </div>
                  <span className="pill pill-muted">{CATEGORY_EMOJI[event.category] || "📌"} {event.category}</span>
                </div>
                {event.description && (
                  <p className="muted small" style={{ marginTop: 10 }}>{event.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

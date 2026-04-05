import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [appointmentPage, setAppointmentPage] = useState(0);
  const [appointmentPageSize] = useState(10);
  const [appointmentTotalPages, setAppointmentTotalPages] = useState(0);

  const auth = localStorage.getItem("auth");

  // 🔍 Fetch appointments
  const fetchAppointments = () => {

    if (!date) {
      alert("Select date");
      return;
    }

    let url = `http://localhost:8080/doctors/appointments?date=${date}&page=${appointmentPage}&size=${appointmentPageSize}`;

    if (search) {
      url += `&name=${encodeURIComponent(search)}`;
    }

    fetch(url, {
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(data => {
        setAppointments(data?.content || []);
        setAppointmentTotalPages(data?.totalPages || 0);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    setAppointmentPage(0);
  }, [date, search]);

  useEffect(() => {
    if (date) fetchAppointments();
  }, [date, search, appointmentPage]);

  // ✅ Update status
  const markCompleted = (id) => {

    fetch(`http://localhost:8080/doctors/appointments/${id}/status?status=COMPLETED`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(() => {
        alert("Marked as completed");
        fetchAppointments();
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("doctor");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Doctor Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* 📅 Date */}
      <div className="form-group">
        <label>Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* 🔍 Search */}
      <div className="form-group">
        <label>Search Patient</label>
        <input
          placeholder="Search patient"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button className="btn" onClick={fetchAppointments}>Load Appointments</button>

      <hr />

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <button className="btn" disabled={appointmentPage <= 0} onClick={() => setAppointmentPage(prev => Math.max(prev - 1, 0))}>
          Previous
        </button>
        <span>
          Page {appointmentPage + 1} of {appointmentTotalPages || 1}
        </span>
        <button className="btn" disabled={appointmentPage + 1 >= appointmentTotalPages} onClick={() => setAppointmentPage(prev => prev + 1)}>
          Next
        </button>
      </div>

      {/* 📋 Appointments */}
      {appointments.length === 0 ? (
        <p>No appointments found</p>
      ) : (
        appointments.map(app => (
          <div key={app.id} className="card">
            <h3>{app.patientName}</h3>
            <p><b>Date:</b> {app.date}</p>
            <p><b>Time:</b> {app.time || 'Not set'}</p>
            <p><b>Queue:</b> {app.queueNumber}</p>
            <p><b>Status:</b> {app.status}</p>

            <button
              className="btn"
              onClick={() => markCompleted(app.id)}
              disabled={app.status === "COMPLETED" || app.status === "CANCELLED"}
              style={{
                backgroundColor: app.status === "COMPLETED" || app.status === "CANCELLED" ? "#6c757d" : "#007bff",
                cursor: app.status === "COMPLETED" || app.status === "CANCELLED" ? "not-allowed" : "pointer"
              }}
            >
              {app.status === "CANCELLED" ? "Cancelled" : app.status === "COMPLETED" ? "Completed" : "Mark Completed"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DoctorDashboard;
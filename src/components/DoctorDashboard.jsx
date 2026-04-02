import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");

  const auth = localStorage.getItem("auth");

  // 🔍 Fetch appointments
  const fetchAppointments = () => {

    if (!date) {
      alert("Select date");
      return;
    }

    let url = `http://localhost:8080/doctors/appointments?date=${date}`;

    if (search) {
      url += `&name=${search}`;
    }

    fetch(url, {
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(data => setAppointments(data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (date) fetchAppointments();
  }, [date, search]);

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
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Doctor Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
      </div>

      {/* 📅 Date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br /><br />

      {/* 🔍 Search */}
      <input
        placeholder="Search patient"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br /><br />

      <button onClick={fetchAppointments}>Load Appointments</button>

      <hr />

      {/* 📋 Appointments */}
      {appointments.length === 0 ? (
        <p>No appointments found</p>
      ) : (
        appointments.map(app => (
          <div key={app.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <h3>{app.patientName}</h3>
            <p>Date: {app.date}</p>
            <p>Time: {app.time || 'Not set'}</p>
            <p>Queue: {app.queueNumber}</p>
            <p>Status: {app.status}</p>

            {app.status !== "COMPLETED" && (
              <button onClick={() => markCompleted(app.id)}>
                Mark Completed
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DoctorDashboard;
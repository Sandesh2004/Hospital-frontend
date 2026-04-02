import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ReceptionDashboard = () => {

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [activeTab, setActiveTab] = useState("doctors");
  const [searchPatientName, setSearchPatientName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const navigate = useNavigate();
  const auth = localStorage.getItem("auth");

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, [name, specialization]);

  const fetchDoctors = () => {

    let url = "http://localhost:8080/doctors?";

    if (name) url += `name=${name}&`;
    if (specialization) url += `specialization=${specialization}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setDoctors(data || []))
      .catch(err => console.error(err));
  };

  const fetchAppointments = () => {
    fetch("http://localhost:8080/reception/appointments", {
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(data => setAppointments(data || []))
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("doctor");
    navigate("/login");
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    const res = await fetch(`http://localhost:8080/appointments/${id}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + auth,
      },
    });

    if (res.ok) {
      alert("Appointment cancelled");
      fetchAppointments();
    } else {
      alert("Failed to cancel appointment");
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    if (searchPatientName) {
      filtered = filtered.filter(a =>
        a.patientName?.toLowerCase().includes(searchPatientName.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    return filtered;
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔐 Logout & Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Reception Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
      </div>
      {/* � Tab Navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #007bff" }}>
        <button
          onClick={() => setActiveTab("doctors")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "doctors" ? "#007bff" : "#f0f0f0",
            color: activeTab === "doctors" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
            borderRadius: "4px 4px 0 0",
          }}
        >
          Doctors
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "appointments" ? "#007bff" : "#f0f0f0",
            color: activeTab === "appointments" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0",
          }}
        >
          All Appointments
        </button>
      </div>

      {/* 👨‍⚕️ DOCTORS TAB */}
      {activeTab === "doctors" && (
        <div>
          <h3 style={{ marginTop: 0 }}>Find Doctors</h3>

          {/* 🔍 Search */}
          <input
            placeholder="Search doctor"
            onChange={(e) => setName(e.target.value)}
          />

          {/* 🏷️ Filter */}
          <select onChange={(e) => setSpecialization(e.target.value)}>
            <option value="">All</option>
            <option value="ENT">ENT</option>
            <option value="CARDIOLOGY">Cardiology</option>
          </select>

          <button onClick={fetchDoctors}>Search</button>

          <hr />

          {/* 👨‍⚕️ Doctor List */}
          {doctors.map(doc => (
            <div
              key={doc.id || doc._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >
              <h3>{doc.name}</h3>
              <p><b>Specialization:</b> {doc.specialization}</p>
              <p><b>Email:</b> {doc.email || 'N/A'}</p>
              <p><b>Phone:</b> {doc.phone || 'N/A'}</p>
              <p><b>Experience:</b> {doc.experience || 'N/A'} years</p>
              <p><b>Patients/hour:</b> {doc.patientsPerHour || 'N/A'}</p>

              {/* 🕒 Availability */}
              <p><b>Available:</b></p>

              {doc.availability && doc.availability.length > 0 ? (
                doc.availability.map((a, index) => (
                  <div key={index}>
                    {a.day} ({a.startTime} - {a.endTime})
                  </div>
                ))
              ) : (
                <p>No availability set</p>
              )}
            </div>
          ))}

          <hr />

          {/* 🔥 MAIN BUTTON */}
          <button onClick={() => navigate("/reception/book")}>
            New Appointment
          </button>
        </div>
      )}

      {/* 📅 APPOINTMENTS TAB */}
      {activeTab === "appointments" && (
        <div>
          <h3>All Appointments</h3>

          {/* 🔍 Search & Filter */}
          <input
            placeholder="Search by patient name"
            value={searchPatientName}
            onChange={(e) => setSearchPatientName(e.target.value)}
          />

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button onClick={fetchAppointments}>Refresh</button>

          <hr />

          {/* 📋 Appointments List */}
          {getFilteredAppointments().length === 0 ? (
            <p>No appointments found</p>
          ) : (
            getFilteredAppointments().map(app => (
              <div
                key={app.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  backgroundColor: app.status === "COMPLETED" ? "#d4edda" : app.status === "CANCELLED" ? "#f8d7da" : "#e7f3ff"
                }}
              >
                <h4>{app.patientName}</h4>
                <p><b>Date:</b> {app.date}</p>
                <p><b>Time:</b> {app.time || 'Not set'}</p>
                <p><b>Queue:</b> {app.queueNumber}</p>
                <p><b>Status:</b> <span style={{ fontWeight: "bold", color: app.status === "COMPLETED" ? "green" : app.status === "CANCELLED" ? "red" : "blue" }}>{app.status}</span></p>
                {app.status === "BOOKED" && (
                  <button onClick={() => cancelAppointment(app.id)} style={{ marginTop: "8px", padding: "6px 12px", backgroundColor: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default ReceptionDashboard;
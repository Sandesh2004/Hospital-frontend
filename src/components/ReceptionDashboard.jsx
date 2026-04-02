import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ReceptionDashboard = () => {

  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors");

  // Appointment search filters
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();
  const auth = localStorage.getItem("auth");

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, [name, specialization]);

  useEffect(() => {
    fetchAppointments();
  }, [patientSearch, doctorSearch, dateSearch, statusFilter]);

  const fetchDoctors = () => {

    let url = "http://localhost:8080/doctors?";

    if (name) url += `name=${name}&`;
    if (specialization) url += `specialization=${specialization}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setDoctors(data || []));
  };

  const fetchAppointments = () => {
    fetch("http://localhost:8080/reception/appointments", {
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(data => {
        let filteredAppointments = data || [];

        // Apply client-side filtering
        if (patientSearch) {
          filteredAppointments = filteredAppointments.filter(app =>
            app.patientName?.toLowerCase().includes(patientSearch.toLowerCase())
          );
        }

        if (doctorSearch) {
          filteredAppointments = filteredAppointments.filter(app =>
            app.doctorName?.toLowerCase().includes(doctorSearch.toLowerCase())
          );
        }

        if (dateSearch) {
          filteredAppointments = filteredAppointments.filter(app =>
            app.date === dateSearch
          );
        }

        if (statusFilter) {
          filteredAppointments = filteredAppointments.filter(app =>
            app.status === statusFilter
          );
        }

        setAppointments(filteredAppointments);
      })
      .catch(err => console.error(err));
  };

  const cancelAppointment = (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    fetch(`http://localhost:8080/reception/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => {
        if (res.ok) {
          alert("Appointment cancelled");
          fetchAppointments();
        } else {
          alert("Failed to cancel");
        }
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("doctor");
    navigate("/login");
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h2>Reception Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className={`btn ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveTab("doctors")}
          style={{ marginRight: "10px" }}
        >
          Doctors
        </button>
        <button
          className={`btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>
      </div>

      {activeTab === "doctors" && (
        <>
          <div className="form-group">
            <label>Search doctor</label>
            <input
              placeholder="Search doctor"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Filter by specialization</label>
            <select onChange={(e) => setSpecialization(e.target.value)}>
              <option value="">All</option>
              <option value="ENT">ENT</option>
              <option value="CARDIOLOGY">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          <button className="btn" onClick={fetchDoctors}>Search</button>

          <div style={{ marginTop: "20px" }}>
            {doctors.map(doc => (
              <div
                key={doc.id || doc._id}
                className="card"
              >
                <h3>{doc.name}</h3>
                <p><b>Specialization:</b> {doc.specialization}</p>

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

                <p>
                  Capacity: {doc.patientsPerHour} patients/hour
                </p>
              </div>
            ))}
          </div>

          <button className="btn" onClick={() => navigate("/reception/book")}>
            New Appointment
          </button>
        </>
      )}

      {activeTab === "appointments" && (
        <>
          <button className="btn" onClick={fetchAppointments} style={{ marginBottom: "20px" }}>
            Refresh Appointments
          </button>

          {/* Appointment Search Form */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3>Search Appointments</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              <div className="form-group" style={{ flex: "1", minWidth: "200px" }}>
                <label>Patient Name</label>
                <input
                  type="text"
                  placeholder="Search by patient name"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: "1", minWidth: "200px" }}>
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="Search by doctor name"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: "1", minWidth: "150px" }}>
                <label>Date</label>
                <input
                  type="date"
                  value={dateSearch}
                  onChange={(e) => setDateSearch(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: "1", minWidth: "150px" }}>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="BOOKED">Booked</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              <button className="btn" onClick={() => {
                setPatientSearch("");
                setDoctorSearch("");
                setDateSearch("");
                setStatusFilter("");
              }}>
                Clear Filters
              </button>
            </div>
          </div>

          <div>
            {appointments.length === 0 ? (
              <p>No appointments found</p>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="card" style={{ marginBottom: "10px" }}>
                  <h3>{app.patientName}</h3>
                  <p><b>Doctor:</b> {app.doctorName}</p>
                  <p><b>Date:</b> {app.date}</p>
                  <p><b>Time:</b> {app.time || 'Not set'}</p>
                  <p><b>Queue:</b> {app.queueNumber}</p>
                  <p><b>Status:</b> <span style={{
                    color: app.status === 'COMPLETED' ? '#28a745' :
                           app.status === 'CANCELLED' ? '#dc3545' : '#007bff'
                  }}>{app.status}</span></p>

                  {app.status !== "COMPLETED" && app.status !== "CANCELLED" && (
                    <button className="btn btn-danger" onClick={() => cancelAppointment(app.id)}>
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReceptionDashboard;
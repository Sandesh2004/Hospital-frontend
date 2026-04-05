import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const token = localStorage.getItem("auth");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userPageSize] = useState(10);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [doctorPage, setDoctorPage] = useState(0);
  const [doctorPageSize] = useState(10);
  const [doctorTotalPages, setDoctorTotalPages] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("RECEPTIONIST");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(0);
  const [phone, setPhone] = useState("");
  const [patientsPerHour, setPatientsPerHour] = useState(1);

  // Availability by day
  const [availabilityDays, setAvailabilityDays] = useState({
    MONDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
    TUESDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
    WEDNESDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
    THURSDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
    FRIDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
    SATURDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
    SUNDAY: { enabled: false, startTime: "09:00", endTime: "17:00" },
  });

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchDoctors();
  }, [navigate, role, token]);

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      return;
    }

    fetchUsers();
  }, [token, role, userPage]);

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      return;
    }

    fetchDoctors();
  }, [token, role, doctorPage]);

  const fetchUsers = async () => {
    const res = await fetch(`http://localhost:8080/admin/users?page=${userPage}&size=${userPageSize}`, {
      headers: { Authorization: "Basic " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data?.content || []);
      setUserTotalPages(data?.totalPages || 0);
    }
  };

  const fetchDoctors = async () => {
    const res = await fetch(`http://localhost:8080/doctors?page=${doctorPage}&size=${doctorPageSize}`, {
      headers: { Authorization: "Basic " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setDoctors(data?.content || []);
      setDoctorTotalPages(data?.totalPages || 0);
    }
  };

  const getAvailabilityList = () => {
    return Object.entries(availabilityDays)
      .filter(([day, times]) => times.enabled && times.startTime && times.endTime)
      .map(([day, times]) => ({
        day,
        startTime: times.startTime,
        endTime: times.endTime,
      }));
  };

  const createUser = async () => {
    if (!username || !password || !newRole) {
      alert("Username, password, and role are required");
      return;
    }

    const body = {
      username,
      password,
      role: newRole,
    };

    if (newRole === "DOCTOR") {
      if (!name || !email || !specialization || !experience || !phone) {
        alert("Doctor fields are required for role DOCTOR");
        return;
      }

      const availList = getAvailabilityList();
      if (availList.length === 0) {
        alert("Please add at least one availability slot");
        return;
      }

      body.name = name;
      body.email = email;
      body.specialization = specialization;
      body.experience = Number(experience);
      body.phone = phone;
      body.patientsPerHour = Number(patientsPerHour);
      body.availability = availList;
    }

    const res = await fetch("http://localhost:8080/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + token,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("User created");
      console.log("Created user:", body);
      setUsername("");
      setPassword("");
      setNewRole("RECEPTIONIST");
      setName("");
      setEmail("");
      setSpecialization("");
      setExperience(0);
      setPhone("");
      setPatientsPerHour(1);
      setAvailabilityDays({
        MONDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
        TUESDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
        WEDNESDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
        THURSDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
        FRIDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
        SATURDAY: { enabled: true, startTime: "09:00", endTime: "17:00" },
        SUNDAY: { enabled: false, startTime: "09:00", endTime: "17:00" },
      });
      fetchUsers();
      fetchDoctors();
    } else {
      const err = await res.text();
      alert(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user permanently?")) return;

    const res = await fetch(`http://localhost:8080/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Basic " + token },
    });

    if (res.ok) {
      fetchUsers();
      alert("User deleted");
    }
  };

  const updateRole = async (id, roleValue) => {
    const res = await fetch(`http://localhost:8080/admin/users/${id}/role?role=${roleValue}`, {
      method: "PUT",
      headers: { Authorization: "Basic " + token },
    });

    if (res.ok) {
      fetchUsers();
      alert("Role updated");
    }
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
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="card">
        <h3>Create New User</h3>

        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="RECEPTIONIST">Receptionist</option>
          </select>
        </div>

        {newRole === "DOCTOR" && (
          <>
            <div className="form-group">
              <label>Doctor Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Doctor name" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            </div>

            <div className="form-group">
              <label>Specialization</label>
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Specialization" />
            </div>

            <div className="form-group">
              <label>Experience (years)</label>
              <input value={experience} onChange={(e) => setExperience(e.target.value)} type="number" placeholder="Experience (years)" min="0" />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            </div>

            <div className="form-group">
              <label>Patients per hour</label>
              <input value={patientsPerHour} onChange={(e) => setPatientsPerHour(e.target.value)} type="number" placeholder="Patients per hour" min="1" />
            </div>

            <div className="form-group">
              <label>Availability Schedule</label>
              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "6px" }}>
                <p style={{ marginTop: "0", marginBottom: "15px", fontWeight: "bold" }}>Set working hours for each day (uncheck to mark unavailable):</p>
                {Object.entries(availabilityDays).map(([day, times]) => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", padding: "10px", backgroundColor: "white", borderRadius: "4px", border: "1px solid #ddd" }}>
                    <input
                      type="checkbox"
                      checked={times.enabled}
                      onChange={(e) =>
                        setAvailabilityDays({
                          ...availabilityDays,
                          [day]: { ...times, enabled: e.target.checked },
                        })
                      }
                      style={{ cursor: "pointer", width: "18px", height: "18px" }}
                    />
                    <label style={{ fontWeight: "500", minWidth: "100px", cursor: "pointer" }}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </label>
                    <input
                      type="time"
                      value={times.startTime}
                      onChange={(e) =>
                        setAvailabilityDays({
                          ...availabilityDays,
                          [day]: { ...times, startTime: e.target.value },
                        })
                      }
                      disabled={!times.enabled}
                      style={{ cursor: times.enabled ? "pointer" : "not-allowed", opacity: times.enabled ? 1 : 0.5 }}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={times.endTime}
                      onChange={(e) =>
                        setAvailabilityDays({
                          ...availabilityDays,
                          [day]: { ...times, endTime: e.target.value },
                        })
                      }
                      disabled={!times.enabled}
                      style={{ cursor: times.enabled ? "pointer" : "not-allowed", opacity: times.enabled ? 1 : 0.5 }}
                    />
                  </div>
                ))}
                <p style={{ fontSize: "12px", color: "#6c757d", margin: "10px 0 0 0" }}>✓ Check days when doctor is available</p>
              </div>
            </div>
          </>
        )}

        <button className="btn" onClick={createUser}>Create User</button>
      </div>

      <div className="card">
        <h3>Users</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <button className="btn" disabled={userPage <= 0} onClick={() => setUserPage(prev => Math.max(prev - 1, 0))}>
            Previous
          </button>
          <span>
            Page {userPage + 1} of {userTotalPages || 1}
          </span>
          <button className="btn" disabled={userPage + 1 >= userTotalPages} onClick={() => setUserPage(prev => prev + 1)}>
            Next
          </button>
        </div>
        <div>
          {users.map((u) => (
            <div key={u.id} className="card" style={{ marginBottom: "10px" }}>
              <p><b>Username:</b> {u.username}</p>
              <p><b>Role:</b> {u.role}</p>
              <button className="btn btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
              <button className="btn" onClick={() => updateRole(u.id, u.role === "ADMIN" ? "RECEPTIONIST" : "ADMIN")}>Toggle Admin</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Doctors</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <button className="btn" disabled={doctorPage <= 0} onClick={() => setDoctorPage(prev => Math.max(prev - 1, 0))}>
            Previous
          </button>
          <span>
            Page {doctorPage + 1} of {doctorTotalPages || 1}
          </span>
          <button className="btn" disabled={doctorPage + 1 >= doctorTotalPages} onClick={() => setDoctorPage(prev => prev + 1)}>
            Next
          </button>
        </div>
        <div>
          {doctors.length === 0 ? (
            <p>No doctors available</p>
          ) : (
            doctors.map((d) => (
              <div key={d.id} className="card" style={{ marginBottom: "10px" }}>
                <h4>{d.name}</h4>
                <p><b>Specialization:</b> {d.specialization}</p>
                <p><b>Email:</b> {d.email}</p>
                <p><b>Phone:</b> {d.phone}</p>
                <p><b>Experience:</b> {d.experience} years</p>
                <p><b>Patients/hour:</b> {d.patientsPerHour}</p>
                <div>
                  <b style={{ display: "block", marginBottom: "8px" }}>📅 Availability:</b>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
                    {d.availability?.map((a, i) => (
                      <div key={i} style={{
                        backgroundColor: "#e7f3ff",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #b8daff",
                        textAlign: "center",
                        fontSize: "13px"
                      }}>
                        <div style={{ fontWeight: "bold", color: "#0056b3" }}>{a.day.charAt(0) + a.day.slice(1).toLowerCase()}</div>
                        <div style={{ color: "#495057" }}>🕐 {a.startTime} - {a.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

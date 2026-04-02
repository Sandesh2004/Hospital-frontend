import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const token = localStorage.getItem("auth");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("RECEPTIONIST");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(0);
  const [phone, setPhone] = useState("");
  const [patientsPerHour, setPatientsPerHour] = useState(1);
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchUsers();
    fetchDoctors();
  }, [navigate, role, token]);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8080/admin/users", {
      headers: { Authorization: "Basic " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data || []);
    }
  };

  const fetchDoctors = async () => {
    const res = await fetch("http://localhost:8080/doctors/all", {
      headers: { Authorization: "Basic " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setDoctors(data || []);
    }
  };

  const getAvailabilityList = () => {
    return availability
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [day, startTime, endTime] = item.split(",").map((s) => s.trim());
        return { day, startTime, endTime };
      });
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
      if (!name || !email || !specialization || !experience || !phone || !availability) {
        alert("Doctor fields are required for role DOCTOR");
        return;
      }

      body.name = name;
      body.email = email;
      body.specialization = specialization;
      body.experience = Number(experience);
      body.phone = phone;
      body.patientsPerHour = Number(patientsPerHour);
      body.availability = getAvailabilityList();
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
      setAvailability("");
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
              <label>Availability</label>
              <textarea
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Availability entries: MONDAY,09:00,17:00; TUESDAY,09:00,17:00"
                rows={3}
              />
            </div>
          </>
        )}

        <button className="btn" onClick={createUser}>Create User</button>
      </div>

      <div className="card">
        <h3>Users</h3>
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
                  <b>Availability:</b>
                  {d.availability?.map((a, i) => (
                    <p key={i} style={{ margin: "2px 0" }}>{a.day} {a.startTime}-{a.endTime}</p>
                  ))}
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

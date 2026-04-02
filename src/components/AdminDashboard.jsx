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
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
      </div>

      <section style={{ marginBottom: "30px" }}>
        <h3>Create New User</h3>

        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <br />
        <br />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <br />
        <br />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="ADMIN">Admin</option>
          <option value="DOCTOR">Doctor</option>
          <option value="RECEPTIONIST">Receptionist</option>
        </select>

        {newRole === "DOCTOR" && (
          <>
            <br /><br />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Doctor name" />
            <br /><br />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <br /><br />
            <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Specialization" />
            <br /><br />
            <input value={experience} onChange={(e) => setExperience(e.target.value)} type="number" placeholder="Experience (years)" min="0" />
            <br /><br />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <br /><br />
            <input value={patientsPerHour} onChange={(e) => setPatientsPerHour(e.target.value)} type="number" placeholder="Patients per hour" min="1" />
            <br /><br />
            <textarea
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Availability entries: MONDAY,09:00,17:00; TUESDAY,09:00,17:00"
              rows={3}
              style={{ width: "400px" }}
            />
          </>
        )}

        <br />
        <button onClick={createUser}>Create User</button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h3>Users</h3>
        <div>
          {users.map((u) => (
            <div key={u.id} style={{ border: "1px solid #ccc", marginBottom: "8px", padding: "8px" }}>
              <p><b>Username:</b> {u.username}</p>
              <p><b>Role:</b> {u.role}</p>
              <button onClick={() => deleteUser(u.id)}>Delete</button>
              <button onClick={() => updateRole(u.id, u.role === "ADMIN" ? "RECEPTIONIST" : "ADMIN")}>Toggle Admin</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3>Doctors</h3>
        <div>
          {doctors.length === 0 ? (
            <p>No doctors available</p>
          ) : (
            doctors.map((d) => (
              <div key={d.id} style={{ border: "1px solid #ccc", marginBottom: "8px", padding: "8px" }}>
                <p><b>{d.name}</b></p>
                <p>{d.specialization}</p>
                <p>Email: {d.email}</p>
                <p>Phone: {d.phone}</p>
                <p>Experience: {d.experience}</p>
                <p>Patients/hour: {d.patientsPerHour}</p>
                {d.availability?.map((a, i) => (
                  <p key={i}>{a.day} {a.startTime}-{a.endTime}</p>
                ))}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

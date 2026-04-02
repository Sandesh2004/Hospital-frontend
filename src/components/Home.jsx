import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [name, specialization]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("doctor");
    navigate("/login");
  };

  const fetchDoctors = () => {

    let url = "http://localhost:8080/doctors?";

    if (name) {
      url += `name=${name}&`;
    }

    if (specialization) {
      url += `specialization=${specialization}`;
    }

    fetch(url)
    .then(res => {
        if (!res.ok) {
            //return []; // handle error safely
            throw new Error("API failed");
        }
        return res.json();
    })
    .then(data => setDoctors(data || []))
    .catch(err => {
        console.error(err);
        setDoctors([]); // fallback
    });
  };


  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Find Doctors</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
      </div>

      {/* 🔍 Search by Name */}
      <input
        type="text"
        placeholder="Search by name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* 🏷️ Filter by Specialization */}
      <select
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
      >
        <option value="">All Departments</option>
        <option value="ENT">ENT</option>
        <option value="CARDIOLOGY">Cardiology</option>
        <option value="ORTHO">Ortho</option>
      </select>

      {/* 🔘 Search Button */}
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

    </div>
  );
};

export default Home;
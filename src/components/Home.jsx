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
    <div className="container">
      <div className="header">
        <h2>Find Doctors</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="form-group">
        <label>Search by name</label>
        <input
          type="text"
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Filter by Specialization</label>
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="">All Departments</option>
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
            <p><b>Email:</b> {doc.email || 'N/A'}</p>
            <p><b>Phone:</b> {doc.phone || 'N/A'}</p>
            <p><b>Experience:</b> {doc.experience || 'N/A'} years</p>
            <p><b>Patients/hour:</b> {doc.patientsPerHour || 'N/A'}</p>

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
    </div>
  );
};

export default Home;
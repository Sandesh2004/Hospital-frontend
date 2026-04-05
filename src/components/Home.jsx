import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [uniqueSpecializations, setUniqueSpecializations] = useState([]);
  const [doctorPage, setDoctorPage] = useState(0);
  const [doctorPageSize] = useState(10);
  const [doctorTotalPages, setDoctorTotalPages] = useState(0);

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [name, specialization, doctorPage]);

  const fetchAllDoctors = () => {
    fetch("http://localhost:8080/doctors/all")
      .then(res => res.json())
      .then(data => {
        const specs = [...new Set((data || []).map(doc => doc.specialization).filter(Boolean))];
        setUniqueSpecializations(specs.sort());
      })
      .catch(err => console.error(err));
  };

  const fetchDoctors = (page = doctorPage) => {
    let url = `http://localhost:8080/doctors?page=${page}&size=${doctorPageSize}`;

    if (name) {
      url += `&name=${encodeURIComponent(name)}`;
    }

    if (specialization) {
      url += `&specialization=${encodeURIComponent(specialization)}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error("API failed");
        }
        return res.json();
      })
      .then(data => {
        setDoctors(data?.content || []);
        setDoctorTotalPages(data?.totalPages || 0);
      })
      .catch(err => {
        console.error(err);
        setDoctors([]);
        setDoctorTotalPages(0);
      });
  };


  return (
    <div className="container">
      <div className="header">
        <h2>Find Doctors</h2>
      </div>

      <div className="form-group">
        <label>Search by name</label>
        <input
          type="text"
          placeholder="Search by name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDoctorPage(0);
          }}
        />
      </div>

      <div className="form-group">
        <label>Filter by Specialization</label>
        <select
          value={specialization}
          onChange={(e) => {
            setSpecialization(e.target.value);
            setDoctorPage(0);
          }}
        >
          <option value="">All Departments</option>
          {uniqueSpecializations.map((spec, index) => (
            <option key={index} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      <button className="btn" onClick={() => {
        setDoctorPage(0);
        fetchDoctors(0);
      }}>Search</button>

      <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          className="btn"
          disabled={doctorPage <= 0}
          onClick={() => setDoctorPage(prev => Math.max(prev - 1, 0))}
        >
          Previous
        </button>
        <span>
          Page {doctorPage + 1} of {doctorTotalPages || 1}
        </span>
        <button
          className="btn"
          disabled={doctorPage + 1 >= doctorTotalPages}
          onClick={() => setDoctorPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>

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
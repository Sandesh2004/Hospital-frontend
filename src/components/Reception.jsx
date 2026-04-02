import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Reception = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [date, setDate] = useState("");
  const [remainingSlots, setRemainingSlots] = useState(null);

  const auth = localStorage.getItem("auth");

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("doctor");
    navigate("/login");
  };

  // 🔍 Fetch remaining slots
  useEffect(() => {
    if (!selectedDoctor || !date) return;

    fetch(`http://localhost:8080/appointments/remaining?doctorId=${selectedDoctor}&date=${date}`, {
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(data => setRemainingSlots(data))
      .catch(err => console.error(err));

  }, [selectedDoctor, date]);

  // 🔍 Search Patient
  const searchPatients = () => {
    if (!patientName) {
      alert("Enter patient name to search");
      return;
    }

    fetch(`http://localhost:8080/reception/patients?name=${patientName}`, {
      headers: {
        Authorization: "Basic " + auth,
      },
    })
      .then(res => res.json())
      .then(data => setPatients(data || []))
      .catch(err => console.error(err));
  };

  // ➕ Create Patient
  const createPatient = () => {

    if (!patientName || !age || !phone || !gender) {
      alert("Please fill all patient details");
      return;
    }

    fetch("http://localhost:8080/reception/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify({
        name: patientName,
        age: Number(age),
        phone: phone,
        email: email,
        gender: gender
      }),
    })
      .then(res => res.json())
      .then(data => {
        setSelectedPatient(data);
        alert("Patient created & selected");
      })
      .catch(err => console.error(err));
  };

  // 👨‍⚕️ Load Doctors
  useEffect(() => {
    fetch("http://localhost:8080/doctors")
      .then(res => res.json())
      .then(data => setDoctors(data || []))
      .catch(err => console.error(err));
  }, []);

  // 📅 Get available days
  const getAvailableDays = () => {
    const doc = doctors.find(d => (d.id || d._id) === selectedDoctor);
    return doc?.availability?.map(a => a.day) || [];
  };


  // 📅 Book Appointment
  const bookAppointment = () => {

    if (!selectedPatient) {
      alert("Select or create patient");
      return;
    }

    if (!selectedDoctor) {
      alert("Select doctor");
      return;
    }

    if (!date) {
      alert("Select date");
      return;
    }

    // ✅ availability validation BEFORE API
    const selectedDay = new Date(date)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    if (!getAvailableDays().includes(selectedDay)) {
      alert("Doctor not available on selected day");
      return;
    }

    if (remainingSlots === 0) {
      alert("No slots available");
      return;
    }

    fetch("http://localhost:8080/appointments/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify({
        doctorId: selectedDoctor,
        patientId: selectedPatient.id || selectedPatient._id,
        date: date,
        patientName: selectedPatient.name,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Booking failed");
        return res.json();
      })
      .then(data => {
        alert(`Appointment booked! Queue Number: ${data.queueNumber}`);

        // reset
        setPatientName("");
        setAge("");
        setPhone("");
        setEmail("");
        setGender("");
        setSelectedPatient(null);
        setDate("");
        setRemainingSlots(null);
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Reception - Book Appointment</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="card">
        <h3>Patient Details</h3>

        <div className="form-group">
          <label>Patient name</label>
          <input
            placeholder="Enter patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            placeholder="Enter age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            placeholder="Enter phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            placeholder="Enter email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <button className="btn" onClick={searchPatients}>Search Patient</button>
        <button className="btn" onClick={createPatient}>Create New Patient</button>

        {patients.length > 0 && (
          <div className="card" style={{ marginTop: "20px" }}>
            <h4>Select Patient</h4>
            {patients.map(p => (
              <div key={p.id || p._id} style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #eee" }} onClick={() => setSelectedPatient(p)}>
                {p.name} ({p.id || p._id})
              </div>
            ))}
          </div>
        )}

        {selectedPatient && (
          <div className="alert alert-success">
            <p><b>Selected Patient:</b> {selectedPatient.name}</p>
            <p><b>Email:</b> {selectedPatient.email || 'N/A'}</p>
            <p><b>Gender:</b> {selectedPatient.gender || 'N/A'}</p>
            <p><b>Phone:</b> {selectedPatient.phone || 'N/A'}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Select Doctor</h3>

        <div className="form-group">
          <label>Choose Doctor</label>
          <select onChange={(e) => setSelectedDoctor(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map(d => (
              <option key={d.id || d._id} value={d.id || d._id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>
        </div>

        {selectedDoctor && (
          <div className="alert alert-success">
            <p><b>Selected Doctor:</b> {doctors.find(d => (d.id || d._id) === selectedDoctor)?.name}</p>
            <p><b>Specialization:</b> {doctors.find(d => (d.id || d._id) === selectedDoctor)?.specialization}</p>
            <p><b>Experience:</b> {doctors.find(d => (d.id || d._id) === selectedDoctor)?.experience} years</p>
          </div>
        )}

        {selectedDoctor && (
          <div style={{ marginTop: "10px" }}>
            <b>Doctor Availability:</b>
            {doctors
              .find(d => (d.id || d._id) === selectedDoctor)
              ?.availability?.map((a, i) => (
                <div key={i}>
                  {a.day} ({a.startTime} - {a.endTime})
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Choose Date</h3>

        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              const selected = e.target.value;

              const day = new Date(selected)
                .toLocaleDateString("en-US", { weekday: "long" })
                .toUpperCase();

              if (!getAvailableDays().includes(day)) {
                alert("Doctor not available on this day");
                return;
              }

              setDate(selected);
            }}
          />
        </div>

        {remainingSlots !== null && (
          <p>
            <b>Remaining Slots:</b> {remainingSlots}
          </p>
        )}

        <button
          className="btn"
          onClick={bookAppointment}
          disabled={!selectedPatient || !selectedDoctor || !date || remainingSlots === 0}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default Reception;
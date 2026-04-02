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
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Reception - Book Appointment</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
      </div>

      {/* 🔍 Patient Section */}
      <h3>Patient Details</h3>

      <input
        placeholder="Enter patient name"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Enter age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Enter phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Enter email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">Select gender</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
        <option value="OTHER">Other</option>
      </select>
      <br /><br />

      <button onClick={searchPatients}>Search Patient</button>
      <button onClick={createPatient}>Create New Patient</button>

      {/* Patient List */}
      {patients.length > 0 && (
        <>
          <h4>Select Patient</h4>
          {patients.map(p => (
            <div key={p.id || p._id}>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedPatient(p)}
              >
                {p.name} ({p.id || p._id})
              </p>
            </div>
          ))}
        </>
      )}

      {selectedPatient && (
        <div>
          <p><b>Selected Patient:</b> {selectedPatient.name}</p>
          <p><b>Email:</b> {selectedPatient.email || 'N/A'}</p>
          <p><b>Gender:</b> {selectedPatient.gender || 'N/A'}</p>
          <p><b>Phone:</b> {selectedPatient.phone || 'N/A'}</p>
        </div>
      )}

      <hr />

      {/* 👨‍⚕️ Doctor Section */}
      <h3>Select Doctor</h3>

      <select onChange={(e) => setSelectedDoctor(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map(d => (
          <option key={d.id || d._id} value={d.id || d._id}>
            {d.name} ({d.specialization})
          </option>
        ))}
      </select>

      {/* Availability */}
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

      <hr />

      {/* 📅 Date */}
      <h3>Choose Date</h3>

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


      {/* 🔥 Remaining Slots */}
      {remainingSlots !== null && (
        <p>
          <b>Remaining Slots:</b> {remainingSlots}
        </p>
      )}

      <br /><br />

      {/* 🚀 Book Button */}
      <button
        onClick={bookAppointment}
        disabled={!selectedPatient || !selectedDoctor || !date || remainingSlots === 0}
      >
        Book Appointment
      </button>
    </div>
  );
};

export default Reception;
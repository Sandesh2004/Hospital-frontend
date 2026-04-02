import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = async () => {

    if (!username || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    const token = btoa(username + ":" + password);

    let url = "";

    if (role === "ADMIN") {
      url = "http://localhost:8080/admin/test";
    } else if (role === "DOCTOR") {
      url = "http://localhost:8080/doctors/me";
    } else if (role === "RECEPTIONIST") {
      url = "http://localhost:8080/reception/test";
    }

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Basic " + token,
        },
      });

      if (res.ok) {
        alert("Login successful!");

        // ✅ store auth
        localStorage.setItem("auth", token);
        localStorage.setItem("role", role);

        if (role === "DOCTOR") {

          const doctorRes = await fetch("http://localhost:8080/doctors/me", {
            headers: {
              Authorization: "Basic " + token,
            },
          });

          const doctorData = await doctorRes.json();

          console.log("Doctor:", doctorData);

          // optional (not required anymore)
          localStorage.setItem("doctor", JSON.stringify(doctorData));

          navigate("/doctor");
        }

        // redirect
        if (role === "ADMIN") navigate("/admin");
        if (role === "DOCTOR") navigate("/doctor");
        if (role === "RECEPTIONIST") navigate("/reception");

      } else {
        alert("Invalid credentials or role");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="RECEPTIONIST">Receptionist</option>
          </select>
        </div>

        <button className="btn" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
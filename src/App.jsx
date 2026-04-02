import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Home from "./components/Home.jsx";
import ReceptionDashboard from "./components/ReceptionDashboard.jsx";
import Reception from "./components/Reception.jsx";
import DoctorDashboard from "./components/DoctorDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/reception" element={<ReceptionDashboard />} />
        <Route path="/reception/book" element={<Reception />} />

        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
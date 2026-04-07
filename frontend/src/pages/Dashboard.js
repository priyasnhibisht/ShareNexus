import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getAllListings } from "../services/listingService";
import "./Dashboard.css";

function Dashboard() {
  const user = getCurrentUser();
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllListings().then(setListings).catch(console.error);
  }, []);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">
        Welcome to ShareNexus 🎓
      </h2>

      <div className="dashboard-cards">

        <div
          className="dashboard-card"
          onClick={() => navigate("/listings/resources")}
          style={{ cursor: "pointer" }}
        >
          <h5>📦 Resources</h5>
          <p>{`${listings.length} listings available`}</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/listings/skills")}
          style={{ cursor: "pointer" }}
        >
          <h5>🎯 Skills</h5>
          <p>Teach and learn new skills</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/requests")}
          style={{ cursor: "pointer" }}
        >
          <h5>🤝 Requests</h5>
          <p>Manage sharing requests</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
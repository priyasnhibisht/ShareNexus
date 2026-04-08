import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getListings } from "../services/listingService";
import { getMyListings } from "../services/listingService";
import { getReceivedRequests } from "../services/requestService";
import { getCurrentUser } from "../services/authService";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [resourceCount, setResourceCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      // ✅ LISTINGS
      const listings = await getMyListings();

      const resources = listings.filter(
        (l) => l.category === "resource"
      );

      const skills = listings.filter(
        (l) => l.category === "skill"
      );

      setResourceCount(resources.length);
      setSkillCount(skills.length);

      // ✅ REQUESTS
      const received = await getReceivedRequests();
      setReceivedCount(Array.isArray(received) ? received.length : 0);

    } catch (err) {
      console.log("Error fetching dashboard data", err);
    }
  };

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">
        Welcome to ShareNexus 🎓
      </h1>

      <div className="dashboard-cards">

        {/* RESOURCES */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/listings/resources")}
        >
          📦 Resources
          <p>{resourceCount} listings available</p>
        </div>

        {/* SKILLS */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/listings/skills")}
        >
          🎯 Skills
          <p>{skillCount} listings available</p>
        </div>

        {/* REQUESTS */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/requests")}
        >
          🤝 Requests
          <p>{receivedCount} requests received</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
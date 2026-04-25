import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getCoins } from "../services/coinService";
import "./Profile.css";

function Profile() {
  const user = getCurrentUser();
  const [coins, setCoins] = useState(user?.coins || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getCoins();
        setCoins(balance);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (!user) return <div className="page-bg profile-container"><p>Please login to view profile.</p></div>;

  return (
    <div className="page-bg profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-icon">🪙</span>
            <div className="stat-details">
              <span className="stat-value">{loading ? "..." : coins} coins</span>
              <span className="stat-label">Spend tips to appreciate helpful listings</span>
            </div>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Course:</span>
            <span className="info-value">{user.course}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Joined:</span>
            <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

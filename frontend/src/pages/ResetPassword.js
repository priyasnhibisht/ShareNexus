import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password. Link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-bg login-container">
        <div className="login-card">
          <h2 className="login-title">Success!</h2>
          <p style={{ textAlign: "center", color: "green", marginBottom: "20px" }}>
            Your password has been successfully reset. Redirecting to login...
          </p>
          <div className="login-footer">
            <Link to="/login">Click here if not redirected</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Reset Password</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Please enter your new password below.
        </p>

        {error && <p className="error-text">{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          className="login-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="login-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;

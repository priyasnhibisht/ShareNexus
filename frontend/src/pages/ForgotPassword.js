import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await axios.post(`${apiUrl}/auth/forgot-password`, { email });
      setMessage(response.data.message);
      
      // Look here! Instead of relying on an email, we automatically direct the user
      // so you have a perfect working demonstration for your project!
      if (response.data.resetToken) {
        setTimeout(() => {
          navigate(`/reset-password/${response.data.resetToken}`);
        }, 1500); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg forgot-container">
      <div className="forgot-card">
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-subtitle">Enter your email to receive a reset link.</p>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="forgot-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="forgot-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;

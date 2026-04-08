import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function ForgotPassword() {
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
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Check your email for a reset link");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Forgot Password</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text" style={{ color: "green", textAlign: "center", marginBottom: "15px" }}>{message}</p>}

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="login-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;

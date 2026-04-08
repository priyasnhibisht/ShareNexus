import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { login } from "../services/authService";

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 ADD page-bg HERE */
    <div className="page-bg login-container">
      
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="login-footer">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>

    </div>
  );
}

export default Login;
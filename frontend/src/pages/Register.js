import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { register } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
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
    console.log("Registered:", name, email);
    setLoading(true);
    try {
      await register(name, email, password, course);
      navigate("/");
    } catch (err) {
      setError("Registration failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 ADD page-bg HERE */
    <div className="page-bg login-container">
      
      <div className="login-card">
        <h2 className="login-title">Register</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          className="login-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Course (e.g. BCA, MCA)"
          className="login-input"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
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

        <button className="login-btn" onClick={handleRegister}>
          {loading ? "Registering..." : "Register"}
        </button>
      </div>

    </div>
  );
}

export default Register;
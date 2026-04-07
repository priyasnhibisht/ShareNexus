import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-bg home-container">
      <h1 className="home-title">Welcome to ShareNexus 🎓</h1>

      <p className="home-subtitle">
        Share resources, learn new skills, and connect with others.
      </p>

      <div className="home-buttons">
        
        {/* 🔥 FIXED */}
        <button
          className="home-btn primary"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>

        {/* 🔥 FIXED */}
        <button
          className="home-btn secondary"
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>

      </div>
    </div>
  );
}

export default Home;
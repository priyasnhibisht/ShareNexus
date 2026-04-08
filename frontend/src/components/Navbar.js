import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import "./Navbar.css";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate("/login"); // ✅ REDIRECT
  };

  return (
    <nav className="navbar-custom">

      <Link className="navbar-logo" to="/">
        ShareNexus 🎓
      </Link>

      <div>
        {!isLoggedIn ? (
          <>
            <Link className="nav-btn" to="/">Home</Link>
            <Link className="nav-btn" to="/login">Login</Link>
            <Link className="nav-btn" to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link className="nav-btn" to="/dashboard">Dashboard</Link>

            <button className="nav-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>

    </nav>
  );
}

export default Navbar;
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ isLoggedIn, setIsLoggedIn }) {

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar-custom">

      <Link className="navbar-logo" to="/">
        ShareNexus 🎓
      </Link>

      <div>
        {!isLoggedIn ? (
          <>
            {/* ✅ Added Home */}
            <Link className="nav-btn" to="/">Home</Link>
            <Link className="nav-btn" to="/login">Login</Link>
            <Link className="nav-btn" to="/register">Register</Link>
          </>
        ) : (
          <>
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
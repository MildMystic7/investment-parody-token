import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Navbar.module.css";

function Navbar() {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setShowUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserDropdown(false);
  };

  const toggleDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Don't show navbar on login page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Left Section - Brand and Navigation */}
        <div className={styles.leftSection}>
          <div className={styles.brand}>
            <span className={styles.brandText}>OakmemeStratton</span>
          </div>

          <div className={styles.navLinks}>
            <Link
              to="/dashboard"
              className={`${styles.navLink} ${
                isActive("/dashboard") ? styles.active : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/memes"
              className={`${styles.navLink} ${
                isActive("/memes") ? styles.active : ""
              }`}
            >
              Memes
            </Link>
            <Link
              to="/portfolio"
              className={`${styles.navLink} ${
                isActive("/portfolio") ? styles.active : ""
              }`}
            >
              Portfolio
            </Link>
            <Link
              to="/council"
              className={`${styles.navLink} ${
                isActive("/council") ? styles.active : ""
              }`}
            >
              Council
            </Link>
          </div>
        </div>

        {/* Right Section - User Dropdown */}
        <div className={styles.rightSection}>
          <div className={styles.userDropdown} ref={dropdownRef}>
            <button className={styles.userButton} onClick={toggleDropdown}>
              <span className={styles.userName}>
                {user?.username || "DegenTrader"}
              </span>
              <span className={styles.dropdownIcon}>
                {showUserDropdown ? "▲" : "▼"}
              </span>
            </button>

            {showUserDropdown && (
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>👤</div>
                  <div className={styles.userDetails}>
                    <div className={styles.userDisplayName}>
                      {user?.username || "DegenTrader"}
                    </div>
                    <div className={styles.userEmail}>
                      {user?.email || "degen@oakmeme.com"}
                    </div>
                  </div>
                </div>
                <hr className={styles.divider} />
                <button className={styles.logoutButton} onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

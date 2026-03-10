import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import UpdatePassword from "./UpdatePassword";

const Navbar = ({ user, isAdmin, onLogout }) => {
  const navigate = useNavigate();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const hamburgerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileMenu]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && 
          hamburgerRef.current && 
          !hamburgerRef.current.contains(event.target) &&
          menuRef.current && 
          !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const isActiveLink = (path) => {
    return window.location.pathname === path;
  };

  return (
    <>
      <style>{`
        /* Navbar Variables */
        :root {
          --nav-bg: rgba(255, 255, 255, 0.98);
          --nav-border: rgba(0, 0, 0, 0.1);
          --nav-text: #333;
          --nav-text-light: #666;
          --nav-link: #000;
          --nav-link-hover: #aa8d74;
          --nav-link-active: #aa8d74;
          --nav-accent: #aa8d74;
          --nav-accent-light: rgba(170, 141, 116, 0.15);
          --nav-accent-hover: rgba(170, 141, 116, 0.08);
          --nav-shadow: 0 8px 35px rgba(0, 0, 0, 0.08);
          --nav-mobile-bg: rgba(20, 20, 20, 0.98);
          --nav-overlay: rgba(0, 0, 0, 0.5);
          --nav-active-bg: rgba(170, 141, 116, 0.12);
          --nav-active-border: #aa8d74;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          :root {
            --nav-bg: rgba(18, 18, 18, 0.98);
            --nav-border: rgba(170, 141, 116, 0.2);
            --nav-text: #fff;
            --nav-text-light: #e0e0e0;
            --nav-link: #fff;
            --nav-accent-light: rgba(170, 141, 116, 0.2);
            --nav-accent-hover: rgba(170, 141, 116, 0.15);
            --nav-active-bg: rgba(170, 141, 116, 0.2);
          }
        }

        /* Navbar Animations */
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(170, 141, 116, 0.2);
          }
          50% {
            box-shadow: 0 4px 16px rgba(170, 141, 116, 0.4);
          }
        }

        /* Navbar Styles */
        .navbar {
          width: 100%;
          padding: 16px 32px;
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(12px);
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          animation: fadeDown 0.5s ease;
          box-shadow: var(--nav-shadow);
          transition: all 0.3s ease;
        }

        .navbar:hover {
          border-bottom-color: var(--nav-accent);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        /* Logo Styles */
        .navbar-logo {
          font-size: 26px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          color: var(--nav-text);
          position: relative;
          animation: slideInRight 0.5s ease;
          padding: 8px 0;
          background: linear-gradient(135deg, var(--nav-text), var(--nav-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-right: 150px;
        }

        .navbar-logo:hover {
          transform: translateY(-2px);
        }

        .navbar-logo::after {
          content: '✦';
          position: absolute;
          top: -5px;
          right: -20px;
          font-size: 18px;
          opacity: 0;
          transition: all 0.3s ease;
          color: var(--nav-accent);
          -webkit-text-fill-color: var(--nav-accent);
        }

        .navbar-logo:hover::after {
          opacity: 1;
          transform: rotate(180deg);
        }

        /* Desktop Menu */
        .navbar-desktop-menu {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Navigation Links */
        .nav-link {
          color: var(--nav-link);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          padding: 10px 20px;
          letter-spacing: 0.3px;
          border-radius: 40px;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: var(--nav-link-hover);
          background: var(--nav-accent-hover);
          transform: translateY(-2px);
        }

        .nav-link.active {
          color: var(--nav-link-active);
          background: var(--nav-active-bg);
          border: 1px solid var(--nav-active-border);
          box-shadow: 0 4px 12px rgba(170, 141, 116, 0.25);
          padding: 10px 24px;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        /* Logout Button */
        .nav-link.logout {
          border: 1px solid var(--nav-accent-light);
          background: transparent;
          margin-left: 8px;
        }

        .nav-link.logout:hover {
          border-color: var(--nav-accent);
          background: var(--nav-accent-hover);
        }

        /* Admin Badge */
        .nav-badge {
          background: var(--nav-accent-light);
          color: var(--nav-accent);
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 10px;
          border: 1px solid var(--nav-accent-light);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-link:hover .nav-badge,
        .nav-link.active .nav-badge {
          background: var(--nav-accent);
          color: white;
          border-color: var(--nav-accent);
        }

        /* Hamburger Menu */
        .navbar-hamburger {
          width: 32px;
          height: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1002;
          -webkit-tap-highlight-color: transparent;
        }

        .navbar-hamburger:hover {
          transform: scale(1.1);
        }

        .navbar-hamburger:active {
          transform: scale(0.95);
        }

        .hamburger-line {
          width: 100%;
          height: 3px;
          background: var(--nav-accent);
          border-radius: 3px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(170, 141, 116, 0.3);
        }

        .hamburger-line.open:nth-child(1) {
          transform: rotate(45deg) translate(6px, 7px);
        }

        .hamburger-line.open:nth-child(2) {
          opacity: 0;
          transform: translateX(20px);
        }

        .hamburger-line.open:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -7px);
        }

        /* Mobile Menu */
        .navbar-mobile-menu {
          position: fixed;
          top: 0;
          right: -350px;
          width: 320px;
          height: 100vh;
          background: var(--nav-mobile-bg);
          backdrop-filter: blur(15px);
          padding: 80px 25px 40px;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1001;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
          border-left: 1px solid var(--nav-accent-light);
          overflow-y: auto;
        }

        .navbar-mobile-menu.open {
          right: 0;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--nav-accent-light);
        }

        .mobile-welcome {
          color: var(--nav-accent);
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: var(--nav-accent-light);
          padding: 8px 16px;
          border-radius: 30px;
        }

        .mobile-close-btn {
          background: none;
          border: none;
          color: var(--nav-accent);
          font-size: 32px;
          cursor: pointer;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
          background: var(--nav-accent-light);
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-close-btn:hover {
          background: var(--nav-accent);
          color: white;
          transform: rotate(90deg);
        }

        .mobile-link {
          color: #eee;
          font-size: 17px;
          text-decoration: none;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 16px 20px;
          border-radius: 12px;
          letter-spacing: 0.3px;
          font-weight: 500;
          width: 100%;
          position: relative;
          animation: slideInRight 0.4s ease;
          animation-fill-mode: both;
          border: 1px solid transparent;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-link:nth-child(2) { animation-delay: 0.1s; }
        .mobile-link:nth-child(3) { animation-delay: 0.15s; }
        .mobile-link:nth-child(4) { animation-delay: 0.2s; }
        .mobile-link:nth-child(5) { animation-delay: 0.25s; }
        .mobile-link:nth-child(6) { animation-delay: 0.3s; }
        .mobile-link:nth-child(7) { animation-delay: 0.35s; }
        .mobile-link:nth-child(8) { animation-delay: 0.4s; }
        .mobile-link:nth-child(9) { animation-delay: 0.45s; }

        .mobile-link:hover,
        .mobile-link.active {
          color: var(--nav-accent);
          background: var(--nav-accent-hover);
          transform: translateX(8px);
          border-color: var(--nav-accent-light);
          padding-left: 28px;
        }

        .mobile-link.active {
          background: var(--nav-active-bg);
          border-color: var(--nav-accent);
          font-weight: 600;
        }

        .mobile-link::before {
          content: '→';
          position: absolute;
          left: 10px;
          opacity: 0;
          transition: all 0.3s ease;
          color: var(--nav-accent);
        }

        .mobile-link:hover::before,
        .mobile-link.active::before {
          opacity: 1;
          left: 20px;
        }

        .mobile-link.logout {
          border: 1px solid var(--nav-accent-light);
          margin-top: 15px;
        }

        .mobile-link.logout:hover {
          border-color: var(--nav-accent);
          background: var(--nav-accent-hover);
        }

        /* Overlay */
        .navbar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--nav-overlay);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar {
            padding: 12px 20px;
          }

          .navbar-logo {
            font-size: 22px;
          }

          .navbar-logo::after {
            font-size: 16px;
            right: -15px;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 10px 16px;
          }

          .navbar-logo {
            font-size: 20px;
          }

          .navbar-mobile-menu {
            width: 280px;
            padding: 70px 20px 30px;
          }

          .mobile-link {
            font-size: 16px;
            padding: 14px 16px;
          }

          .mobile-welcome {
            font-size: 14px;
            padding: 6px 12px;
          }
        }

        /* Touch Device Optimizations */
        @media (hover: none) and (pointer: coarse) {
          .nav-link:hover,
          .navbar-logo:hover,
          .mobile-link:hover {
            transform: none;
          }

          .nav-link:active,
          .mobile-link:active {
            transform: scale(0.98);
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .navbar,
          .navbar-logo,
          .nav-link,
          .hamburger-line,
          .navbar-mobile-menu,
          .mobile-link,
          .mobile-close-btn {
            animation: none !important;
            transition: none !important;
          }

          .navbar-logo::after,
          .mobile-link::before {
            animation: none !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .navbar {
            border-bottom: 2px solid var(--nav-accent);
          }

          .nav-link.active {
            border: 2px solid var(--nav-accent);
          }

          .navbar-mobile-menu {
            border-left: 2px solid var(--nav-accent);
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">
          <Link 
            to="/" 
            className="navbar-logo"
          >
            Salon Excellence
          </Link>

          {!isMobile && (
            <div className="navbar-desktop-menu">
              <Link
                to="/"
                className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
              >
                Home
              </Link>

              <Link
                to="/about"
                className={`nav-link ${isActiveLink('/about') ? 'active' : ''}`}
              >
                About
              </Link>

              <Link
                to="/reviews"
                className={`nav-link ${isActiveLink('/reviews') ? 'active' : ''}`}
              >
                Reviews
              </Link>

              <Link
                to="/contact"
                className={`nav-link ${isActiveLink('/contact') ? 'active' : ''}`}
              >
                Contact
              </Link>

              {user ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className={`nav-link ${isActiveLink('/admin') ? 'active' : ''}`}
                    >
                      Admin
                      <span className="nav-badge">Admin</span>
                    </Link>
                  ) : (
                    <Link
                      to="/user"
                      className={`nav-link ${isActiveLink('/user') ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    className="nav-link"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>

                  <button
                    className="nav-link logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`nav-link ${isActiveLink('/login') ? 'active' : ''}`}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className={`nav-link ${isActiveLink('/signup') ? 'active' : ''}`}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          )}

          {isMobile && (
            <div 
              ref={hamburgerRef}
              className="navbar-hamburger" 
              onClick={toggleMobileMenu}
            >
              <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`} />
              <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`} />
              <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`} />
            </div>
          )}
        </div>
      </nav>

      {isMobile && (
        <>
          <div 
            ref={menuRef}
            className={`navbar-mobile-menu ${showMobileMenu ? 'open' : ''}`}
          >
            <div className="mobile-menu-header">
              <span className="mobile-welcome">
                {user ? `Welcome, ${user.name || 'User'}` : "Menu"}
              </span>
              <button 
                className="mobile-close-btn"
                onClick={closeMobileMenu}
              >
                ×
              </button>
            </div>

            <Link 
              to="/" 
              className={`mobile-link ${isActiveLink('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>

            <Link 
              to="/about" 
              className={`mobile-link ${isActiveLink('/about') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              About
            </Link>

            <Link 
              to="/reviews" 
              className={`mobile-link ${isActiveLink('/reviews') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Reviews
            </Link>

            <Link 
              to="/contact" 
              className={`mobile-link ${isActiveLink('/contact') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {user ? (
              <>
                {isAdmin ? (
                  <Link 
                    to="/admin" 
                    className={`mobile-link ${isActiveLink('/admin') ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/user" 
                    className={`mobile-link ${isActiveLink('/user') ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    My Dashboard
                  </Link>
                )}

                <button
                  className="mobile-link"
                  onClick={() => {
                    setShowPasswordModal(true);
                    closeMobileMenu();
                  }}
                >
                  Change Password
                </button>

                <button
                  className="mobile-link logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`mobile-link ${isActiveLink('/login') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>

                <Link 
                  to="/signup" 
                  className={`mobile-link ${isActiveLink('/signup') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {showMobileMenu && (
            <div className="navbar-overlay" onClick={closeMobileMenu} />
          )}
        </>
      )}

      {showPasswordModal && (
        <UpdatePassword
          user={user}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
};

export default Navbar;
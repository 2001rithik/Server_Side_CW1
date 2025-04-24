import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaListUl, FaUserCircle } from 'react-icons/fa';
import '../style/header.css';

const Header = () => {
  const location = useLocation();         // Tracks current route
  const navigate = useNavigate();         // Navigation hook

  const [user, setUser] = useState(null); // Stores logged-in user info
  const [menuOpen, setMenuOpen] = useState(false); // Controls mobile menu
  const [hoverProfile, setHoverProfile] = useState(false); // Controls profile hover dropdown

  // Load user from localStorage when route changes
  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      setUser(JSON.parse(data));
    } else {
      setUser(null);
    }
  }, [location]);

  // Helper flags
  const isAuthPage = location.pathname === '/' || location.pathname === '/registerform';
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';

  // Toggle hamburger menu for mobile
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  // Hover handlers for user profile
  const showProfile = useCallback(() => setHoverProfile(true), []);
  const hideProfile = useCallback(() => setHoverProfile(false), []);

  // Clear user session on logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Redirect to login
  };

  return (
    <header className="header-container">
      {/* Logo section */}
      <div className="logo">CountryAPI</div>

      {/* Mobile menu toggle icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        <FaListUl />
      </div>

      {/* Navigation links */}
      <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <ul>
          {/* Show Sign In / Sign Up links only on login/register pages */}
          {isAuthPage ? (
            <>
              <li><Link to="/">Log In</Link></li>
              <li><Link to="/registerform">Sign Up</Link></li>
            </>
          ) : isLoggedIn ? (
            <>
             
            
              {/* User profile icon and dropdown */}
              <li
                className="user-icon-wrapper"
                onMouseEnter={showProfile}
                onMouseLeave={hideProfile}
              >
                <FaUserCircle className="user-icon" />
                {hoverProfile && (
                  <div className="user-dropdown">
                    {/* User information */}
                    <div className="user-info-box">
                      <p><strong>User:</strong> {user.username}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      {user.role !== 'admin' && (
                        <p><strong>Plan:</strong> {user.plan}</p>
                      )}
                    </div>

                    {/* API key box */}
                    <div className="api-box">
                      <p><strong>API Key:</strong></p>
                      <p className="api-key-text">{user.api_key}</p>
                    </div>
                  </div>
                )}
              </li>

              {/* Logout button */}
              <li>
                <button onClick={logout} className="logout-btn">Logout</button>
              </li>
            </>
          ) : null}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

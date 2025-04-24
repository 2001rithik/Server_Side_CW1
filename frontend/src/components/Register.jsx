import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/authForm.css';
import { registerUser, registerAdmin } from '../api/authApi';

const Register = () => {
  // State hooks to manage input fields and registration type
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Handler function for the registration process
  const handleRegister = async () => {
    // Check if all required fields are filled
    if (!username || !email || !password || !confirm) {
      alert("Please fill in all fields");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    // Check if security code is provided for admin registration
    if (isAdmin && !securityCode) {
      alert("Please enter the admin security code");
      return;
    }

    try {
      let data;
      
      if (isAdmin) {
        // Register as admin with the security code
        data = await registerAdmin({ username, email, password, securityCode });
      } else {
        // Register as regular user
        data = await registerUser({ username, email, password });
      }
      
      // Store the user data in localStorage after successful registration
      localStorage.setItem("user", JSON.stringify(data));
      // Redirect the user to the login page after successful registration
      navigate('/');
    } catch (error) {
      // If registration fails, show an alert
      alert(`Registration failed. ${error.message || 'Please try again.'}`);
      console.error(error);
    }
  };

  // Toggle between user and admin registration
  const toggleRegistrationType = () => {
    setIsAdmin(!isAdmin);
    // Clear the security code when switching back to user registration
    if (isAdmin) {
      setSecurityCode('');
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">{isAdmin ? 'Admin Sign Up' : 'Sign Up'}</h1>
        
        {/* Registration type toggle */}
        <div className="form-group" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <button 
            className={`type-toggle ${!isAdmin ? 'active' : ''}`} 
            onClick={() => setIsAdmin(false)}
            style={{ 
              padding: '8px 15px', 
              margin: '0 5px', 
              borderRadius: '4px',
              backgroundColor: !isAdmin ? '#4a90e2' : '#f5f5f5',
              color: !isAdmin ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            User
          </button>
          <button 
            className={`type-toggle ${isAdmin ? 'active' : ''}`} 
            onClick={() => setIsAdmin(true)}
            style={{ 
              padding: '8px 15px', 
              margin: '0 5px', 
              borderRadius: '4px',
              backgroundColor: isAdmin ? '#4a90e2' : '#f5f5f5',
              color: isAdmin ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Admin
          </button>
        </div>

        {/* Username input field */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Email input field */}
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password input field */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm password input field */}
        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            type="password"
            id="confirm"
            className="form-input"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* Security code field - only visible for admin registration */}
        {isAdmin && (
          <div className="form-group">
            <label htmlFor="securityCode">Admin Security Code</label>
            <input
              type="password"
              id="securityCode"
              className="form-input"
              placeholder="Enter admin security code"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Please enter the security code provided by your organization.
            </small>
          </div>
        )}

        {/* Register button */}
        <button className="submit-button" onClick={handleRegister}>
          {isAdmin ? 'Register as Admin' : 'Register'}
        </button>

        {/* Link to the login page for users who already have an account */}
        <div className="register-link" style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <a href="/">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
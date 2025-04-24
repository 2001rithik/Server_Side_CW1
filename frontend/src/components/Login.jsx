import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/authForm.css';
import { loginUser } from '../api/authApi';

const Login = () => {
  // State hooks to manage email and password input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook to navigate between pages

  // Handler function for the login button click
  const handleLogin = async () => {
    // Check if both email and password are provided
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      // Attempt to log the user in with the provided email and password
      const data = await loginUser({ email, password });
      // Extract user data and API key from the response
      const userData = {
        ...data.user,
        api_key: data.apiKey
      };

      // Store the user data (including API key) in localStorage for later use
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect the user to the appropriate page based on their role (admin or regular user)
      if (userData.role === 'admin') {
        navigate('/adminpage');
      } else {
        navigate('/home');
      }

    } catch (error) {
      // Handle any errors (e.g., wrong credentials) and alert the user
      alert("Login failed. Please check your credentials.");
      console.error(error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">LOG IN
        </h1>
        
        {/* Email input field */}
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
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
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
          />
        </div>

        {/* Login button */}
        <button className="submit-button" onClick={handleLogin}>LOG IN</button>

        {/* Link to the registration page for users who don't have an account */}
        <div className="register-link" style={{ marginTop: '15px', textAlign: 'center' }}>
          Don’t have an account? <a href="/registerform">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

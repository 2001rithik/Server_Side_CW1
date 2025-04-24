import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Home';  // Import the Home component
import Login from '../components/Login';  // Import the Login component
import Register from '../components/Register';  // Import the Register component
import AdminPage from '../components/AdminPage';  // Import the AdminPage component

const AppRoutes = () => {
  return (
    // Defining the Routes for the app using React Router
    <Routes>
      {/* Route for the login page */}
      <Route path="/" element={<Login />} />
      
      {/* Route for the registration page */}
      <Route path="/registerform" element={<Register />} />
      
      {/* Route for the home page (user dashboard) */}
      <Route path="/home" element={<Home />} />
      
      {/* Route for the admin page */}
      <Route path="/adminpage" element={<AdminPage />} />
    </Routes>
  );
};

export default AppRoutes;

import React, { useEffect, useState } from 'react';
import { fetchUsersWithUsage, updateUserPlan, deleteApiKey } from '../api/userApi';
import { fetchTotalApiKeyCount, fetchUserApiKeys } from '../api/countryApi';
import { FaUsers, FaKey, FaTimes, FaTrash } from 'react-icons/fa';
import '../style/adminPage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);           // Store list of users with their usage info
  const [totalKeys, setTotalKeys] = useState(0);    // Total number of API keys issued
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for popup
  const [userApiKeys, setUserApiKeys] = useState([]); // API keys for selected user
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Control popup visibility

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await fetchUsersWithUsage(); // Get users + usage info
        setUsers(usersData);
        
        const keyData = await fetchTotalApiKeyCount(); // Get total number of API keys
        setTotalKeys(keyData.totalApiKeys);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    
    loadData();
  }, []);

  // Handle subscription plan change for a user
  const handlePlanChange = async (userId, newPlan) => {
    try {
      await updateUserPlan(userId, newPlan); // Send update to backend
      // Update frontend state to reflect change
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, plan: newPlan } : user
        )
      );
    } catch (error) {
      alert('Failed to update user plan');
      console.error(error);
    }
  };

  // Open popup with user API details
  const handleUserClick = async (user) => {
    try {
      const apiKeys = await fetchUserApiKeys(user.id);
      setSelectedUser(user);
      setUserApiKeys(apiKeys);
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Failed to fetch user API keys:', error);
      alert('Could not load API keys for this user');
    }
  };

  // Handle API key deletion
  const handleDeleteApiKey = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await deleteApiKey(keyId);
        // Remove from local state
        setUserApiKeys(prev => prev.filter(key => key.id !== keyId));
        // Update total keys count
        setTotalKeys(prev => prev - 1);
      } catch (error) {
        console.error('Failed to delete API key:', error);
        alert('Could not delete the API key');
      }
    }
  };

  // Close the popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedUser(null);
    setUserApiKeys([]);
  };

  return (
    <div className="admin-container">
      <h2>User API Usage Report</h2>
      
      {/* Dashboard summary cards */}
      <div className="dashboard-cards">
        <div className="card">
          
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="card">
          
          <h3>{totalKeys}</h3>
          <p>API Keys Issued</p>
        </div>
      </div>
      
      {/* Usage table */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Plan</th>
              
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="8">No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Admin can change user plan */}
                    <select
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleUserClick(user)}
                    >
                      View API Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* API Keys Popup */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="api-details-popup">
            <div className="popup-header">
              <h3>API Keys for {selectedUser?.name}</h3>
              <button className="close-btn" onClick={closePopup}>
                <FaTimes />
              </button>
            </div>
            
            <div className="popup-content">
              {userApiKeys.length === 0 ? (
                <p>No API keys found for this user.</p>
              ) : (
                <table className="api-keys-table">
                  <thead>
                    <tr>
                      <th>API Key</th>
                      <th>Created</th>
                      <th>Expires</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userApiKeys.map(key => (
                      <tr key={key.id}>
                        <td>{key.api_key.substring(0, 8)}...{key.api_key.substring(key.api_key.length - 8)}</td>
                        <td>{new Date(key.created_at).toLocaleDateString()}</td>
                        <td>{new Date(key.expires_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="delete-key-btn"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
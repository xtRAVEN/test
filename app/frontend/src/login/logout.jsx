// src/components/Logout.js
import { Navigate } from 'react-router-dom';

function Logout() {
  // Clear tokens from local storage
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');



  // Redirect to login page
  return <Navigate to="/login" />;
}

export default Logout;

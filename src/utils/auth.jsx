import { jwtDecode } from 'jwt-decode';  // Changed from default import to named import

export const getUser = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);  // Using the named import
      return {
        name: decoded.username,
        email: decoded.email
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

// Optional: Add more auth utility functions
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};
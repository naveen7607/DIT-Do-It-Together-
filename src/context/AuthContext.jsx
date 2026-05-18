import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Set up an interval to check token expiry and admin updates (ban/warn) periodically
    const interval = setInterval(() => {
      const activeUser = authService.getCurrentUser();
      setUser((prevUser) => {
        if (!activeUser && prevUser) {
          // Token expired or user banned by admin
          return null;
        }
        // If live user state has changed (e.g. warned status updated), sync state instantly
        if (activeUser && JSON.stringify(activeUser) !== JSON.stringify(prevUser)) {
          return activeUser;
        }
        return prevUser;
      });
    }, 3000); // Check every 3 seconds for snappy real-time demonstration

    return () => clearInterval(interval);
  }, []);

  const signup = async (email, otp, username, password) => {
    try {
      const response = await authService.verifySignup(email, otp, username, password);
      if (response.success) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithPassword = async (username, password) => {
    try {
      const response = await authService.loginWithPassword(username, password);
      if (response.success) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (username, otp, newPassword) => {
    try {
      const response = await authService.resetPassword(username, otp, newPassword);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  const updateUser = async (profileData) => {
    if (!user) return { success: false, error: 'No active user' };
    try {
      const response = await authService.updateProfile(user.username, profileData);
      if (response.success) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, loginWithPassword, logout, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

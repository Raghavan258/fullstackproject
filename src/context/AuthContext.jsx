import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('constitutionAuth');
    if (stored) {
      try {
        const { user: storedUser, token: storedToken } = JSON.parse(stored);
        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
        } else {
          // Backward compatibility cleanup just in case
          localStorage.removeItem('constitutionAuth');
        }
      } catch (_) {}
    }
    // Also clean up old mock token if present
    localStorage.removeItem('constitutionUser'); 
    setLoading(false);
  }, []);

  // Takes complete AuthResponse DTO from backend
  const login = (authData) => {
    const userData = {
      id: authData.id,
      name: authData.fullName,
      email: authData.email,
      phone: authData.phone,
      role: authData.role?.toLowerCase() || 'citizen',
      verified: authData.verified,
    };
    
    setUser(userData);
    setToken(authData.token);
    
    localStorage.setItem('constitutionAuth', JSON.stringify({
      user: userData,
      token: authData.token
    }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('constitutionAuth');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
